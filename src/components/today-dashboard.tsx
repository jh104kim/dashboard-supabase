"use client";

import { useState } from "react";
import { Plus, RotateCcw, Save } from "lucide-react";
import { Panel, Pill, ProgressBar, SectionHeader } from "@/components/ui";
import { useLifeOs } from "@/components/life-os-provider";
import { metrics, northStar } from "@/lib/life-os-data";
import type { PriorityStatus, QuickCapture } from "@/lib/life-os-types";

const values = northStar.values;
const captureKinds: { value: QuickCapture["kind"]; label: string }[] = [
  { value: "learning", label: "학습" },
  { value: "reflection", label: "회고" },
  { value: "content", label: "콘텐츠" },
];

const statusLabels: Record<PriorityStatus, string> = {
  todo: "해야 함",
  done: "완료",
  carry: "이월",
};

export function TodayDashboard() {
  const {
    priorities,
    schedule,
    energy,
    captures,
    reviewDraft,
    persistence,
    alignmentPercent,
    completedEvidenceCount,
    addPriority,
    updatePriorityStatus,
    addScheduleItem,
    setEnergy,
    addCapture,
    updateReviewDraft,
  } = useLifeOs();

  const [priorityTitle, setPriorityTitle] = useState("");
  const [priorityDetail, setPriorityDetail] = useState("");
  const [priorityValue, setPriorityValue] = useState(values[0]);
  const [priorityAligned, setPriorityAligned] = useState(true);
  const [scheduleTime, setScheduleTime] = useState("오후");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleIntent, setScheduleIntent] = useState("해야 함");
  const [captureKind, setCaptureKind] =
    useState<QuickCapture["kind"]>("learning");
  const [captureText, setCaptureText] = useState("");

  const carryCount = priorities.filter((item) => item.status === "carry").length;

  function submitPriority(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!priorityTitle.trim()) {
      return;
    }

    addPriority({
      title: priorityTitle.trim(),
      detail: priorityDetail.trim() || "오늘 직접 입력한 우선순위",
      value: priorityValue,
      aligned: priorityAligned,
    });
    setPriorityTitle("");
    setPriorityDetail("");
    setPriorityAligned(true);
  }

  function submitSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduleTitle.trim()) {
      return;
    }

    addScheduleItem({
      time: scheduleTime.trim() || "오늘",
      title: scheduleTitle.trim(),
      intent: scheduleIntent.trim() || "기록",
    });
    setScheduleTitle("");
  }

  function submitCapture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!captureText.trim()) {
      return;
    }

    addCapture({ kind: captureKind, text: captureText.trim() });
    setCaptureText("");
  }

  const liveMetrics = metrics.map((metric) => {
    if (metric.label === "Alignment") {
      return {
        ...metric,
        value: `${alignmentPercent}%`,
        detail: "오늘 task 중 북극성과 연결된 비율",
      };
    }

    if (metric.label === "Energy") {
      return {
        ...metric,
        value: `${energy.score}%`,
        detail: energy.reason,
      };
    }

    if (metric.label === "Focus") {
      return { ...metric, value: `${priorities.length}` };
    }

    return { ...metric, value: `${carryCount}` };
  });

  return (
    <>
      <SectionHeader
        eyebrow="Today Dashboard"
        title="오늘 나를 다시 정렬하는 화면"
        description="오늘의 우선순위, 에너지, quick capture를 저장하고 Review로 보낸다. Supabase 연결이 되지 않으면 local-only로 계속 동작한다."
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-black text-[#1f2723]">Persistence</p>
              <p className="mt-1 text-[#68746c]">{persistence.message}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                persistence.status === "connected"
                  ? "bg-[#e4f3eb] text-[#157f5b]"
                  : persistence.status === "saving" ||
                      persistence.status === "checking"
                    ? "bg-[#eef1ea] text-[#465249]"
                    : "bg-[#fff1dd] text-[#9b650e]"
              }`}
            >
              {persistence.status}
            </span>
          </div>
        </Panel>

        <Panel className="xl:col-span-12">
          <p className="text-xl font-black leading-8 text-[#1f2723]">
            {northStar.currentQuestion}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {values.map((value) => (
              <Pill key={value}>{value}</Pill>
            ))}
          </div>
        </Panel>

        {liveMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Panel key={metric.label} className="xl:col-span-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#68746c]">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#157f5b]">
                    {metric.value}
                  </p>
                </div>
                <Icon className="h-5 w-5 text-[#285d8f]" />
              </div>
              <p className="mt-3 min-h-10 text-sm leading-5 text-[#68746c]">
                {metric.detail}
              </p>
            </Panel>
          );
        })}

        <Panel title="오늘의 우선순위 입력" className="xl:col-span-7">
          <form onSubmit={submitPriority} className="grid gap-3">
            <input
              value={priorityTitle}
              onChange={(event) => setPriorityTitle(event.target.value)}
              className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none focus:border-[#157f5b] focus:ring-2 focus:ring-[#157f5b]/20"
              placeholder="오늘 반드시 진행할 일"
              aria-label="오늘 우선순위 제목"
            />
            <input
              value={priorityDetail}
              onChange={(event) => setPriorityDetail(event.target.value)}
              className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none focus:border-[#157f5b] focus:ring-2 focus:ring-[#157f5b]/20"
              placeholder="왜 중요한지 한 줄"
              aria-label="오늘 우선순위 설명"
            />
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <select
                value={priorityValue}
                onChange={(event) => setPriorityValue(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                aria-label="연결 가치"
              >
                {values.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#cfd7cb] px-3 py-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={priorityAligned}
                  onChange={(event) => setPriorityAligned(event.target.checked)}
                />
                북극성 연결
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f2723] px-4 py-2 text-sm font-bold text-white"
              >
                <Plus size={16} />
                추가
              </button>
            </div>
          </form>

          <div className="mt-5 grid gap-3">
            {priorities.map((task) => (
              <div
                key={task.id}
                className="grid gap-3 border-b border-[#eef1ea] pb-3 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p
                    className={`font-bold ${
                      task.status === "done"
                        ? "text-[#68746c] line-through"
                        : "text-[#1f2723]"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[#68746c]">
                    {task.detail}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                  <Pill>{task.value}</Pill>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-bold ${
                      task.aligned
                        ? "bg-[#e4f3eb] text-[#157f5b]"
                        : "bg-[#fff1dd] text-[#9b650e]"
                    }`}
                  >
                    {task.aligned ? "aligned" : "check"}
                  </span>
                  <select
                    value={task.status}
                    onChange={(event) =>
                      updatePriorityStatus(
                        task.id,
                        event.target.value as PriorityStatus,
                      )
                    }
                    className="rounded-md border border-[#cfd7cb] bg-[#fbfcfa] px-2 py-1 text-xs font-bold"
                    aria-label={`${task.title} 상태`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="직접 입력 일정" className="xl:col-span-5">
          <form onSubmit={submitSchedule} className="mb-4 grid gap-2">
            <div className="grid grid-cols-[82px_1fr] gap-2">
              <input
                value={scheduleTime}
                onChange={(event) => setScheduleTime(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                aria-label="일정 시간대"
              />
              <input
                value={scheduleTitle}
                onChange={(event) => setScheduleTitle(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                placeholder="직접 입력 일정"
                aria-label="일정 제목"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={scheduleIntent}
                onChange={(event) => setScheduleIntent(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                aria-label="일정 의도"
              />
              <button
                type="submit"
                aria-label="일정 추가"
                className="inline-flex items-center justify-center rounded-lg bg-[#1f2723] px-4 py-2 text-white"
              >
                <Plus size={16} />
              </button>
            </div>
          </form>
          <div className="grid gap-3">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[68px_1fr_auto] items-start gap-3 border-b border-[#eef1ea] pb-3 text-sm last:border-0 last:pb-0"
              >
                <span className="font-bold text-[#285d8f]">{item.time}</span>
                <span>{item.title}</span>
                <span className="text-xs text-[#68746c]">{item.intent}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="North Star 연결도" className="xl:col-span-6">
          <div className="grid gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">연결된 task</span>
              <span className="text-[#68746c]">
                {priorities.filter((item) => item.aligned).length} /{" "}
                {priorities.length}
              </span>
            </div>
            <ProgressBar value={alignmentPercent} />
            <p className="text-sm leading-6 text-[#68746c]">
              완료 evidence 후보: {completedEvidenceCount}개. 초기 계산은 AI
              추론 없이 사용자가 직접 선택한 연결 여부만 사용한다.
            </p>
          </div>
        </Panel>

        <Panel title="에너지와 회복 입력" className="xl:col-span-6">
          <div className="grid gap-3">
            <label className="text-sm font-bold text-[#465249]">
              에너지 {energy.score}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={energy.score}
              onChange={(event) =>
                setEnergy({ ...energy, score: Number(event.target.value) })
              }
              aria-label="에너지 점수"
            />
            <input
              value={energy.reason}
              onChange={(event) =>
                setEnergy({ ...energy, reason: event.target.value })
              }
              className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
              aria-label="에너지 이유"
            />
            <input
              value={energy.recoveryAction}
              onChange={(event) =>
                setEnergy({ ...energy, recoveryAction: event.target.value })
              }
              className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
              aria-label="회복 행동"
            />
          </div>
        </Panel>

        <Panel title="Quick Capture" className="xl:col-span-6">
          <form onSubmit={submitCapture} className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {captureKinds.map((kind) => (
                <button
                  key={kind.value}
                  type="button"
                  onClick={() => setCaptureKind(kind.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    captureKind === kind.value
                      ? "border-[#157f5b] bg-[#e4f3eb] text-[#157f5b]"
                      : "border-[#d9ded4] bg-[#fbfcfa] text-[#465249]"
                  }`}
                >
                  {kind.label}
                </button>
              ))}
            </div>
            <textarea
              value={captureText}
              onChange={(event) => setCaptureText(event.target.value)}
              className="min-h-24 rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm leading-6 outline-none"
              placeholder="30초 안에 남기는 학습/회고/콘텐츠 후보"
              aria-label="Quick capture"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f2723] px-4 py-2 text-sm font-bold text-white"
            >
              <Save size={16} />
              Capture
            </button>
          </form>
          <div className="mt-4 grid gap-2">
            {captures.length === 0 ? (
              <p className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-3 text-sm text-[#68746c]">
                아직 quick capture가 없다. 입력하면 Review preview에 반영된다.
              </p>
            ) : (
              captures.slice(0, 4).map((capture) => (
                <p
                  key={capture.id}
                  className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-3 text-sm leading-5"
                >
                  <span className="font-bold text-[#157f5b]">
                    {capture.kind}
                  </span>{" "}
                  {capture.text}
                </p>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Review Snapshot Preview" className="xl:col-span-6">
          <div className="grid gap-3">
            <input
              value={reviewDraft.alignedAction}
              onChange={(event) =>
                updateReviewDraft("alignedAction", event.target.value)
              }
              className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
              aria-label="Aligned action"
            />
            <input
              value={reviewDraft.wastedArea}
              onChange={(event) =>
                updateReviewDraft("wastedArea", event.target.value)
              }
              className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
              aria-label="Wasted area"
            />
            <textarea
              value={reviewDraft.nextOne}
              onChange={(event) =>
                updateReviewDraft("nextOne", event.target.value)
              }
              className="min-h-20 rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm leading-6 outline-none"
              aria-label="Next one"
            />
            <p className="flex items-center gap-2 text-xs leading-5 text-[#68746c]">
              <RotateCcw size={14} />
              Local-only: 새로고침하면 초기 샘플 상태로 돌아간다.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
