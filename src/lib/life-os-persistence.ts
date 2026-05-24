import { getSupabaseBrowserClient } from "@/lib/supabase";
import type {
  PriorityItem,
  PriorityStatus,
  QuickCapture,
  ReviewDraft,
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

export async function loadPersistedLifeOs() {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { ok: false as const, reason: "Supabase env is not configured." };
  }

  const [tasks, learningLogs, reflections, reviews] = await Promise.all([
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
    captures: captureItems,
    reviewDraft,
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
