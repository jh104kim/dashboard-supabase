export type PriorityStatus = "todo" | "done" | "carry";

export type PriorityItem = {
  id: string;
  title: string;
  detail: string;
  value: string;
  aligned: boolean;
  status: PriorityStatus;
};

export type ScheduleItem = {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  eventType:
    | "work"
    | "ai-ax"
    | "learning"
    | "health"
    | "finance"
    | "family"
    | "recovery"
    | "content"
    | "admin";
  intent: string;
  linkedTaskId?: string;
  linkedValue: string;
  northStarAligned: boolean;
  energyCost: "low" | "medium" | "high";
  visibility: "private" | "candidate" | "public";
  sourceKind: "manual" | "task" | "wiki-seed" | "external-later";
};

export type QuickCapture = {
  id: string;
  kind: "learning" | "reflection" | "content";
  text: string;
};

export type EnergyState = {
  score: number;
  reason: string;
  recoveryAction: string;
};

export type ReviewDraft = {
  alignedAction: string;
  wastedArea: string;
  evidence: string;
  capabilityGap: string;
  nextOne: string;
};

export type PersistenceState = {
  status: "checking" | "connected" | "local-only" | "saving" | "error";
  message: string;
};

export type NorthStarAlignment = {
  percent: number;
  alignedCount: number;
  totalCount: number;
  doneAlignedCount: number;
};

export type DailyLoopState = {
  totalTasks: number;
  doneTasks: number;
  carriedTasks: number;
  captureCount: number;
  learningCount: number;
  reflectionCount: number;
  contentIdeaCount: number;
  energyScore: number;
  recoveryAction: string;
};

export type WeeklyInsights = {
  bestAlignedAction: string;
  wastedArea: string;
  evidenceSummary: string;
  capabilityGap: string;
  nextOneImprovement: string;
  alignmentDiagnosis: string;
  timeUseSummary: string;
  protectedEvent: string;
  removeOrDeferEvent: string;
  calendarAlignmentPercent: number;
};

export type GeneratedReviewSnapshot = {
  draft: ReviewDraft;
  insights: WeeklyInsights;
};
