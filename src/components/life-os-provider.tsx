"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  directSchedule,
  initialEnergyState,
  initialReviewDraft,
  todayPriorities,
} from "@/lib/life-os-data";
import type {
  DailyLoopState,
  EnergyState,
  GeneratedReviewSnapshot,
  NorthStarAlignment,
  PersistenceState,
  PriorityItem,
  PriorityStatus,
  QuickCapture,
  ReviewDraft,
  ScheduleItem,
  WeeklyInsights,
} from "@/lib/life-os-types";
import {
  generateReviewSnapshot as buildReviewSnapshot,
  getDailyLoopState,
  getNorthStarAlignment,
  getWeeklyInsights,
} from "@/lib/life-os-insights";
import {
  createPersistedCapture,
  createPersistedReview,
  createPersistedTask,
  isPersistedId,
  loadPersistedLifeOs,
  updatePersistedTaskStatus,
} from "@/lib/life-os-persistence";

type LifeOsContextValue = {
  priorities: PriorityItem[];
  schedule: ScheduleItem[];
  energy: EnergyState;
  captures: QuickCapture[];
  reviewDraft: ReviewDraft;
  persistence: PersistenceState;
  alignmentPercent: number;
  completedEvidenceCount: number;
  northStarAlignment: NorthStarAlignment;
  dailyLoopState: DailyLoopState;
  weeklyInsights: WeeklyInsights;
  generatedReviewSnapshot: GeneratedReviewSnapshot | null;
  addPriority: (input: Omit<PriorityItem, "id" | "status">) => void;
  updatePriorityStatus: (id: string, status: PriorityStatus) => void;
  addScheduleItem: (input: Omit<ScheduleItem, "id">) => void;
  setEnergy: (energy: EnergyState) => void;
  addCapture: (input: Omit<QuickCapture, "id">) => void;
  updateReviewDraft: (key: keyof ReviewDraft, value: string) => void;
  generateReviewSnapshot: () => void;
  saveReviewSnapshot: () => Promise<void>;
};

const LifeOsContext = createContext<LifeOsContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function LifeOsProvider({ children }: { children: ReactNode }) {
  const [priorities, setPriorities] = useState<PriorityItem[]>(todayPriorities);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(directSchedule);
  const [energy, setEnergy] = useState<EnergyState>(initialEnergyState);
  const [captures, setCaptures] = useState<QuickCapture[]>([]);
  const [reviewDraft, setReviewDraft] =
    useState<ReviewDraft>(initialReviewDraft);
  const [generatedReviewSnapshot, setGeneratedReviewSnapshot] =
    useState<GeneratedReviewSnapshot | null>(null);
  const [persistence, setPersistence] = useState<PersistenceState>({
    status: "checking",
    message: "Supabase 연결을 확인하는 중",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await loadPersistedLifeOs();

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setPersistence({
          status: "local-only",
          message: `Local-only mode: ${result.reason}`,
        });
        return;
      }

      if (result.tasks.length > 0) {
        setPriorities(result.tasks);
      }

      if (result.captures.length > 0) {
        setCaptures(result.captures);
      }

      if (result.reviewDraft) {
        setReviewDraft((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.entries(result.reviewDraft ?? {}).filter(
              ([, value]) => value !== undefined,
            ),
          ),
        }));
      }

      setPersistence({
        status: "connected",
        message: "Supabase connected. 입력값은 저장된다.",
      });
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const northStarAlignment = useMemo(
    () => getNorthStarAlignment(priorities),
    [priorities],
  );

  const alignmentPercent = northStarAlignment.percent;

  const dailyLoopState = useMemo(
    () => getDailyLoopState({ priorities, captures, schedule, energy }),
    [captures, energy, priorities, schedule],
  );

  const weeklyInsights = useMemo(
    () =>
      getWeeklyInsights({
        priorities,
        captures,
        energy,
        currentDraft: reviewDraft,
      }),
    [captures, energy, priorities, reviewDraft],
  );

  const completedEvidenceCount = useMemo(() => {
    return priorities.filter((item) => item.status === "done").length;
  }, [priorities]);

  const value = useMemo<LifeOsContextValue>(
    () => ({
      priorities,
      schedule,
      energy,
      captures,
      reviewDraft,
      persistence,
      alignmentPercent,
      completedEvidenceCount,
      northStarAlignment,
      dailyLoopState,
      weeklyInsights,
      generatedReviewSnapshot,
      addPriority(input) {
        const localTask = {
          ...input,
          id: createId("priority"),
          status: "todo" as const,
        };

        setPriorities((current) => [...current, localTask]);

        void (async () => {
          try {
            setPersistence({
              status: "saving",
              message: "Task를 Supabase에 저장하는 중",
            });
            const persistedTask = await createPersistedTask(input);
            setPriorities((current) =>
              current.map((item) =>
                item.id === localTask.id ? persistedTask : item,
              ),
            );
            setPersistence({
              status: "connected",
              message: "Task 저장 완료",
            });
          } catch (error) {
            setPersistence({
              status: "error",
              message:
                error instanceof Error
                  ? `Task 저장 실패: ${error.message}`
                  : "Task 저장 실패",
            });
          }
        })();
      },
      updatePriorityStatus(id, status) {
        setPriorities((current) =>
          current.map((item) => (item.id === id ? { ...item, status } : item)),
        );

        if (!isPersistedId(id)) {
          return;
        }

        void (async () => {
          try {
            await updatePersistedTaskStatus(id, status);
            setPersistence({
              status: "connected",
              message: "Task 상태 저장 완료",
            });
          } catch (error) {
            setPersistence({
              status: "error",
              message:
                error instanceof Error
                  ? `Task 상태 저장 실패: ${error.message}`
                  : "Task 상태 저장 실패",
            });
          }
        })();
      },
      addScheduleItem(input) {
        setSchedule((current) => [
          ...current,
          { ...input, id: createId("schedule") },
        ]);
      },
      setEnergy(nextEnergy) {
        setEnergy(nextEnergy);
      },
      addCapture(input) {
        const localCapture = { ...input, id: createId(input.kind) };
        setCaptures((current) => [localCapture, ...current]);

        void (async () => {
          try {
            setPersistence({
              status: "saving",
              message: "Quick capture를 Supabase에 저장하는 중",
            });
            const persistedCapture = await createPersistedCapture(input);
            setCaptures((current) =>
              current.map((item) =>
                item.id === localCapture.id ? persistedCapture : item,
              ),
            );
            setPersistence({
              status: "connected",
              message: "Quick capture 저장 완료",
            });
          } catch (error) {
            setPersistence({
              status: "error",
              message:
                error instanceof Error
                  ? `Quick capture 저장 실패: ${error.message}`
                  : "Quick capture 저장 실패",
            });
          }
        })();
      },
      updateReviewDraft(key, nextValue) {
        setReviewDraft((current) => ({ ...current, [key]: nextValue }));
        setGeneratedReviewSnapshot(null);
      },
      generateReviewSnapshot() {
        const snapshot = buildReviewSnapshot({
          priorities,
          captures,
          energy,
          currentDraft: reviewDraft,
        });

        setReviewDraft(snapshot.draft);
        setGeneratedReviewSnapshot(snapshot);
      },
      async saveReviewSnapshot() {
        try {
          setPersistence({
            status: "saving",
            message: "Review snapshot을 Supabase에 저장하는 중",
          });
          await createPersistedReview({
            alignmentPercent,
            completedEvidenceCount,
            reviewDraft,
          });
          setPersistence({
            status: "connected",
            message: "Review snapshot 저장 완료",
          });
        } catch (error) {
          setPersistence({
            status: "error",
            message:
              error instanceof Error
                ? `Review 저장 실패: ${error.message}`
                : "Review 저장 실패",
          });
        }
      },
    }),
    [
      alignmentPercent,
      captures,
      completedEvidenceCount,
      dailyLoopState,
      energy,
      generatedReviewSnapshot,
      northStarAlignment,
      persistence,
      priorities,
      reviewDraft,
      schedule,
      weeklyInsights,
    ],
  );

  return (
    <LifeOsContext.Provider value={value}>{children}</LifeOsContext.Provider>
  );
}

export function useLifeOs() {
  const context = useContext(LifeOsContext);

  if (!context) {
    throw new Error("useLifeOs must be used inside LifeOsProvider");
  }

  return context;
}
