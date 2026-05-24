import { getSupabaseBrowserClient } from "@/lib/supabase";
import type {
  PriorityItem,
  PriorityStatus,
  QuickCapture,
  ReviewDraft,
  ScheduleItem,
} from "@/lib/life-os-types";

type DbTask = {
  id: string;
  title: string;
  detail: string | null;
  status: "todo" | "doing" | "done" | "deferred" | "cancelled";
  north_star_alignment_score: number | null;
};

type DbLearningLog = {
  id: string;
  title: string;
  body: string | null;
  can_be_content: boolean;
  logged_at: string;
};

type DbReflection = {
  id: string;
  body: string;
  created_at: string;
};

type DbReview = {
  best_aligned_action: string | null;
  wasted_area: string | null;
  evidence_count: number | null;
  next_one_improvement: string | null;
  weekly_theme: string | null;
};

type DbCalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  event_type: ScheduleItem["eventType"];
  intent: string | null;
  linked_task_id: string | null;
  linked_value: string | null;
  north_star_aligned: boolean;
  energy_cost: ScheduleItem["energyCost"];
  visibility: ScheduleItem["visibility"];
  source_kind: ScheduleItem["sourceKind"];
};

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isPersistedId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

function toDbStatus(status: PriorityStatus): DbTask["status"] {
  if (status === "carry") {
    return "deferred";
  }

  return status;
}

function fromDbStatus(status: DbTask["status"]): PriorityStatus {
  if (status === "done") {
    return "done";
  }

  if (status === "deferred" || status === "cancelled") {
    return "carry";
  }

  return "todo";
}

function taskFromDb(task: DbTask): PriorityItem {
  const aligned = (task.north_star_alignment_score ?? 1) >= 3;

  return {
    id: task.id,
    title: task.title,
    detail: task.detail ?? "Supabase에서 불러온 task",
    value: aligned ? "통합" : "확인",
    aligned,
    status: fromDbStatus(task.status),
  };
}

function calendarEventFromDb(event: DbCalendarEvent): ScheduleItem {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    startAt: event.start_at,
    endAt: event.end_at,
    allDay: event.all_day,
    eventType: event.event_type,
    intent: event.intent ?? "기록",
    linkedTaskId: event.linked_task_id ?? undefined,
    linkedValue: event.linked_value ?? "통합",
    northStarAligned: event.north_star_aligned,
    energyCost: event.energy_cost,
    visibility: event.visibility,
    sourceKind: event.source_kind,
  };
}

function calendarEventToDb(input: Omit<ScheduleItem, "id">) {
  return {
    title: input.title,
    description: input.description ?? null,
    start_at: input.startAt,
    end_at: input.endAt,
    all_day: input.allDay,
    event_type: input.eventType,
    intent: input.intent,
    linked_task_id: input.linkedTaskId ?? null,
    linked_value: input.linkedValue,
    north_star_aligned: input.northStarAligned,
    energy_cost: input.energyCost,
    visibility: input.visibility,
    source_kind: input.sourceKind,
  };
}

export async function loadPersistedLifeOs() {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { ok: false as const, reason: "Supabase env is not configured." };
  }

  const [tasks, learningLogs, reflections, reviews, calendarEvents] =
    await Promise.all([
    supabase
      .from("tasks")
      .select("id,title,detail,status,north_star_alignment_score")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("learning_logs")
      .select("id,title,body,can_be_content,logged_at")
      .order("logged_at", { ascending: false })
      .limit(20),
    supabase
      .from("reflections")
      .select("id,body,created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("reviews")
      .select(
        "best_aligned_action,wasted_area,evidence_count,next_one_improvement,weekly_theme",
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("calendar_events")
      .select(
        "id,title,description,start_at,end_at,all_day,event_type,intent,linked_task_id,linked_value,north_star_aligned,energy_cost,visibility,source_kind",
      )
      .order("start_at", { ascending: true })
      .limit(100),
  ]);

  const firstError =
    tasks.error ?? learningLogs.error ?? reflections.error ?? reviews.error;

  if (firstError) {
    return {
      ok: false as const,
      reason: firstError.message,
    };
  }

  const captureItems: QuickCapture[] = [
    ...((learningLogs.data as DbLearningLog[] | null) ?? []).map((item) => ({
      id: item.id,
      kind: item.can_be_content ? ("content" as const) : ("learning" as const),
      text: item.body ?? item.title,
    })),
    ...((reflections.data as DbReflection[] | null) ?? []).map((item) => ({
      id: item.id,
      kind: "reflection" as const,
      text: item.body,
    })),
  ];

  const latestReview = reviews.data as DbReview | null;
  const reviewDraft: Partial<ReviewDraft> | null = latestReview
    ? {
        alignedAction: latestReview.best_aligned_action ?? undefined,
        wastedArea: latestReview.wasted_area ?? undefined,
        evidence: latestReview.weekly_theme ?? undefined,
        nextOne: latestReview.next_one_improvement ?? undefined,
      }
    : null;

  return {
    ok: true as const,
    tasks: ((tasks.data as DbTask[] | null) ?? []).map(taskFromDb).reverse(),
    schedule: calendarEvents.error
      ? []
      : ((calendarEvents.data as DbCalendarEvent[] | null) ?? []).map(
          calendarEventFromDb,
        ),
    captures: captureItems,
    reviewDraft,
    calendarWarning: calendarEvents.error?.message,
  };
}

export async function createPersistedTask(
  input: Omit<PriorityItem, "id" | "status">,
) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase env is not configured.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      detail: input.detail,
      status: "todo",
      north_star_alignment_score: input.aligned ? 5 : 1,
    })
    .select("id,title,detail,status,north_star_alignment_score")
    .single();

  if (error) {
    throw error;
  }

  return taskFromDb(data as DbTask);
}

export async function updatePersistedTaskStatus(
  id: string,
  status: PriorityStatus,
) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase env is not configured.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: toDbStatus(status), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function createPersistedCapture(
  input: Omit<QuickCapture, "id">,
) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase env is not configured.");
  }

  if (input.kind === "reflection") {
    const { data, error } = await supabase
      .from("reflections")
      .insert({ body: input.text })
      .select("id,body,created_at")
      .single();

    if (error) {
      throw error;
    }

    return {
      id: (data as DbReflection).id,
      kind: "reflection" as const,
      text: (data as DbReflection).body,
    };
  }

  const { data, error } = await supabase
    .from("learning_logs")
    .insert({
      title: input.text.slice(0, 80),
      body: input.text,
      can_be_content: input.kind === "content",
    })
    .select("id,title,body,can_be_content,logged_at")
    .single();

  if (error) {
    throw error;
  }

  const item = data as DbLearningLog;

  return {
    id: item.id,
    kind: item.can_be_content ? ("content" as const) : ("learning" as const),
    text: item.body ?? item.title,
  };
}

export async function createPersistedCalendarEvent(
  input: Omit<ScheduleItem, "id">,
) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase env is not configured.");
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert(calendarEventToDb(input))
    .select(
      "id,title,description,start_at,end_at,all_day,event_type,intent,linked_task_id,linked_value,north_star_aligned,energy_cost,visibility,source_kind",
    )
    .single();

  if (error) {
    throw error;
  }

  return calendarEventFromDb(data as DbCalendarEvent);
}

export async function createPersistedReview(input: {
  alignmentPercent: number;
  completedEvidenceCount: number;
  reviewDraft: ReviewDraft;
}) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase env is not configured.");
  }

  const today = new Date();
  const periodEnd = today.toISOString().slice(0, 10);
  const periodStartDate = new Date(today);
  periodStartDate.setDate(today.getDate() - 6);
  const periodStart = periodStartDate.toISOString().slice(0, 10);

  const { error } = await supabase.from("reviews").insert({
    period_start: periodStart,
    period_end: periodEnd,
    alignment_score: Math.max(1, Math.min(100, input.alignmentPercent)),
    weekly_theme: input.reviewDraft.evidence,
    best_aligned_action: input.reviewDraft.alignedAction,
    wasted_area: input.reviewDraft.wastedArea,
    evidence_count: input.completedEvidenceCount,
    next_one_improvement: input.reviewDraft.nextOne,
  });

  if (error) {
    throw error;
  }
}
