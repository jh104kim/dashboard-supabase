import type {
  DailyLoopState,
  EnergyState,
  GeneratedReviewSnapshot,
  NorthStarAlignment,
  PriorityItem,
  QuickCapture,
  ReviewDraft,
  ScheduleItem,
  WeeklyInsights,
} from "@/lib/life-os-types";

export function getNorthStarAlignment(
  priorities: PriorityItem[],
): NorthStarAlignment {
  const totalCount = priorities.length;
  const alignedCount = priorities.filter((item) => item.aligned).length;
  const doneAlignedCount = priorities.filter(
    (item) => item.aligned && item.status === "done",
  ).length;

  return {
    percent: totalCount === 0 ? 0 : Math.round((alignedCount / totalCount) * 100),
    alignedCount,
    totalCount,
    doneAlignedCount,
  };
}

export function getDailyLoopState(input: {
  priorities: PriorityItem[];
  captures: QuickCapture[];
  schedule: ScheduleItem[];
  energy: EnergyState;
}): DailyLoopState {
  const { priorities, captures, energy } = input;

  return {
    totalTasks: priorities.length,
    doneTasks: priorities.filter((item) => item.status === "done").length,
    carriedTasks: priorities.filter((item) => item.status === "carry").length,
    captureCount: captures.length,
    learningCount: captures.filter((item) => item.kind === "learning").length,
    reflectionCount: captures.filter((item) => item.kind === "reflection").length,
    contentIdeaCount: captures.filter((item) => item.kind === "content").length,
    energyScore: energy.score,
    recoveryAction: energy.recoveryAction,
  };
}

export function getWeeklyInsights(input: {
  priorities: PriorityItem[];
  captures: QuickCapture[];
  energy: EnergyState;
  currentDraft: ReviewDraft;
}): WeeklyInsights {
  const { priorities, captures, energy, currentDraft } = input;
  const alignment = getNorthStarAlignment(priorities);
  const doneItems = priorities.filter((item) => item.status === "done");
  const alignedDone = doneItems.filter((item) => item.aligned);
  const carriedItems = priorities.filter((item) => item.status === "carry");
  const latestLearning = captures.find((item) => item.kind === "learning");
  const latestReflection = captures.find((item) => item.kind === "reflection");
  const contentCount = captures.filter((item) => item.kind === "content").length;

  const bestAlignedAction =
    alignedDone[0]?.title ??
    priorities.find((item) => item.aligned)?.title ??
    currentDraft.alignedAction;

  const wastedArea =
    carriedItems[0]?.title ??
    (alignment.percent < 60
      ? "북극성과 연결되지 않은 task 비중"
      : currentDraft.wastedArea);

  const evidenceSummary =
    doneItems.length > 0
      ? `${doneItems.length}개 완료 task, aligned evidence ${alignedDone.length}개`
      : "아직 완료 evidence가 부족하다. 오늘 하나를 done으로 바꿔야 한다.";

  const capabilityGap =
    contentCount === 0
      ? "학습/회고를 public evidence 후보로 전환하는 루프"
      : latestLearning?.text ?? currentDraft.capabilityGap;

  const nextOneImprovement =
    energy.score < 55
      ? `회복 행동을 먼저 고정: ${energy.recoveryAction}`
      : carriedItems[0]
        ? `이월 task 하나를 줄이기: ${carriedItems[0].title}`
        : latestReflection?.text ?? currentDraft.nextOne;

  const alignmentDiagnosis =
    alignment.percent >= 75
      ? "오늘의 task 구조는 북극성과 강하게 정렬되어 있다."
      : alignment.percent >= 50
        ? "북극성과 연결된 행동은 있으나 이월/분산을 줄여야 한다."
        : "오늘 행동은 북극성과 약하게 연결되어 있다. task를 줄이고 핵심 하나를 골라야 한다.";

  return {
    bestAlignedAction,
    wastedArea,
    evidenceSummary,
    capabilityGap,
    nextOneImprovement,
    alignmentDiagnosis,
  };
}

export function generateReviewSnapshot(input: {
  priorities: PriorityItem[];
  captures: QuickCapture[];
  energy: EnergyState;
  currentDraft: ReviewDraft;
}): GeneratedReviewSnapshot {
  const insights = getWeeklyInsights(input);

  return {
    insights,
    draft: {
      alignedAction: insights.bestAlignedAction,
      wastedArea: insights.wastedArea,
      evidence: insights.evidenceSummary,
      capabilityGap: insights.capabilityGap,
      nextOne: insights.nextOneImprovement,
    },
  };
}
