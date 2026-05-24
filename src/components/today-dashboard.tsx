"use client";

import { useState } from "react";
import { CalendarPlus, Clock3, Plus, RotateCcw, Save } from "lucide-react";
import { Panel, Pill, ProgressBar, SectionHeader } from "@/components/ui";
import { useLifeOs } from "@/components/life-os-provider";
import { metrics, northStar } from "@/lib/life-os-data";
import type {
  PriorityStatus,
  QuickCapture,
  ScheduleItem,
} from "@/lib/life-os-types";

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

const eventTypeLabels: Record<ScheduleItem["eventType"], string> = {
  work: "업무",
  "ai-ax": "AI/AX",
  learning: "학습",
  health: "건강",
  finance: "재무",
  family: "가족",
  recovery: "회복",
  content: "콘텐츠",
  admin: "정리",
};

const eventTypeStyles: Record<ScheduleItem["eventType"], string> = {
  work: "border-[#285d8f] bg-[#eef6ff] text-[#1f4f80]",
  "ai-ax": "border-[#157f5b] bg-[#e4f3eb] text-[#157f5b]",
  learning: "border-[#7b61a8] bg-[#f0ebf7] text-[#654b91]",
  health: "border-[#b5483b] bg-[#fff0ed] text-[#9c3e33]",
  finance: "border-[#aa7a16] bg-[#fff6df] text-[#8a620d]",
  family: "border-[#5f7c3b] bg-[#eef5e6] text-[#4d692f]",
  recovery: "border-[#4b7c73] bg-[#e8f4f1] text-[#376c64]",
  content: "border-[#8c5a35] bg-[#fff1e7] text-[#754723]",
  admin: "border-[#68746c] bg-[#eef1ea] text-[#465249]",
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
    schedulePriority,
    setEnergy,
    addCapture,
    updateReviewDraft,
  } = useLifeOs();

  const [priorityTitle, setPriorityTitle] = useState("");
  const [priorityDetail, setPriorityDetail] = useState("");
  const [priorityValue, setPriorityValue] = useState(values[0]);
  const [priorityAligned, setPriorityAligned] = useState(true);
  const [calendarView, setCalendarView] = useState<"day" | "week" | "list">(
    "day",
  );
  const [selectedDate, setSelectedDate] = useState(toDateInput(new Date()));
  const [scheduleStartTime, setScheduleStartTime] = useState("18:00");
  const [scheduleEndTime, setScheduleEndTime] = useState("18:45");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleIntent, setScheduleIntent] = useState("해야 함");
  const [scheduleEventType, setScheduleEventType] =
    useState<ScheduleItem["eventType"]>("work");
  const [scheduleValue, setScheduleValue] = useState(values[0]);
  const [scheduleAligned, setScheduleAligned] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [captureKind, setCaptureKind] =
    useState<QuickCapture["kind"]>("learning");
  const [captureText, setCaptureText] = useState("");

  const carryCount = priorities.filter((item) => item.status === "carry").length;
  const weekDays = getWeekDays(selectedDate);
  const sortedSchedule = [...schedule].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
  const selectedDateEvents = sortedSchedule.filter((item) =>
    sameLocalDate(item.startAt, selectedDate),
  );
  const visibleCalendarEvents =
    calendarView === "day"
      ? selectedDateEvents
      : calendarView === "week"
        ? sortedSchedule.filter((item) =>
            weekDays.some((day) => sameLocalDate(item.startAt, day.value)),
          )
        : sortedSchedule.slice(0, 12);
  const selectedEvent =
    sortedSchedule.find((item) => item.id === selectedEventId) ??
    visibleCalendarEvents[0];

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
      title: scheduleTitle.trim(),
      description: "",
      startAt: composeDateTime(selectedDate, scheduleStartTime),
      endAt: composeDateTime(selectedDate, scheduleEndTime),
      allDay: false,
      eventType: scheduleEventType,
      intent: scheduleIntent.trim() || "기록",
      linkedValue: scheduleValue,
      northStarAligned: scheduleAligned,
      energyCost: scheduleEventType === "recovery" ? "low" : "medium",
      visibility: "private",
      sourceKind: "manual",
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
                  <button
                    type="button"
                    onClick={() => schedulePriority(task.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#cfd7cb] bg-[#fbfcfa] px-2 py-1 text-xs font-bold text-[#465249]"
                    aria-label={`${task.title} 일정화`}
                  >
                    <CalendarPlus size={13} />
                    일정화
                  </button>
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

        <Panel title="Calendar Planning" className="xl:col-span-5">
          <div className="mb-4 grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-1">
                {(["day", "week", "list"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setCalendarView(view)}
                    className={`rounded-md px-3 py-1 text-xs font-black ${
                      calendarView === view
                        ? "bg-[#1f2723] text-white"
                        : "text-[#465249]"
                    }`}
                  >
                    {view.toUpperCase()}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm font-bold outline-none"
                aria-label="캘린더 선택 날짜"
              />
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const count = sortedSchedule.filter((item) =>
                  sameLocalDate(item.startAt, day.value),
                ).length;
                const active = day.value === selectedDate;

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => setSelectedDate(day.value)}
                    className={`min-h-14 min-w-0 overflow-hidden rounded-lg border p-1.5 text-left ${
                      active
                        ? "border-[#157f5b] bg-[#e4f3eb]"
                        : "border-[#d9ded4] bg-[#fbfcfa]"
                    }`}
                  >
                    <span className="block truncate text-[10px] font-black text-[#68746c]">
                      {day.weekday}
                    </span>
                    <span className="mt-1 block text-sm font-black">
                      {day.day}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-[#68746c]">
                      {count}개
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={submitSchedule} className="mb-4 grid gap-2">
            <input
              value={scheduleTitle}
              onChange={(event) => setScheduleTitle(event.target.value)}
              className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
              placeholder="직접 입력 일정 또는 time block"
              aria-label="일정 제목"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={scheduleStartTime}
                onChange={(event) => setScheduleStartTime(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                aria-label="일정 시작 시간"
              />
              <input
                type="time"
                value={scheduleEndTime}
                onChange={(event) => setScheduleEndTime(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                aria-label="일정 종료 시간"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
              <select
                value={scheduleEventType}
                onChange={(event) =>
                  setScheduleEventType(
                    event.target.value as ScheduleItem["eventType"],
                  )
                }
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                aria-label="일정 영역"
              >
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={scheduleValue}
                onChange={(event) => setScheduleValue(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                aria-label="일정 연결 가치"
              >
                {values.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={scheduleIntent}
                onChange={(event) => setScheduleIntent(event.target.value)}
                className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-sm outline-none"
                aria-label="일정 의도"
              />
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#cfd7cb] px-3 py-2 text-xs font-black">
                <input
                  type="checkbox"
                  checked={scheduleAligned}
                  onChange={(event) => setScheduleAligned(event.target.checked)}
                />
                정렬
              </label>
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
            {visibleCalendarEvents.length === 0 ? (
              <p className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-3 text-sm leading-5 text-[#68746c]">
                선택한 기간의 일정이 없다. 오늘 지킬 time block 하나를 먼저
                만든다.
              </p>
            ) : (
              visibleCalendarEvents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedEventId(item.id)}
                  className="grid grid-cols-[74px_1fr] items-start gap-3 rounded-lg border border-[#eef1ea] p-3 text-left text-sm hover:border-[#157f5b]"
                >
                  <span className="font-black text-[#285d8f]">
                    {formatEventTime(item)}
                  </span>
                  <span>
                    <span className="block font-black text-[#1f2723]">
                      {item.title}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${eventTypeStyles[item.eventType]}`}
                      >
                        {eventTypeLabels[item.eventType]}
                      </span>
                      <span className="rounded-full border border-[#d9ded4] bg-[#fbfcfa] px-2 py-0.5 text-[11px] font-bold text-[#68746c]">
                        {item.linkedValue}
                      </span>
                      <span className="rounded-full border border-[#d9ded4] bg-white px-2 py-0.5 text-[11px] font-bold text-[#68746c]">
                        {item.intent}
                      </span>
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {selectedEvent ? (
            <div className="mt-4 rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-[#68746c]">
                    Selected block
                  </p>
                  <p className="mt-1 font-black">{selectedEvent.title}</p>
                </div>
                <Clock3 className="h-4 w-4 text-[#285d8f]" />
              </div>
              <p className="mt-2 text-sm leading-5 text-[#68746c]">
                {formatEventRange(selectedEvent)} ·{" "}
                {selectedEvent.northStarAligned
                  ? "북극성 연결"
                  : "정렬 확인 필요"}
              </p>
            </div>
          ) : null}
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

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function composeDateTime(date: string, time: string) {
  return new Date(`${date}T${time || "00:00"}:00`).toISOString();
}

function sameLocalDate(dateTime: string, date: string) {
  return toDateInput(new Date(dateTime)) === date;
}

function getWeekDays(date: string) {
  const selected = new Date(`${date}T12:00:00`);
  const start = new Date(selected);
  start.setDate(selected.getDate() - selected.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);

    return {
      value: toDateInput(day),
      weekday: day.toLocaleDateString("ko-KR", { weekday: "short" }),
      day: day.getDate(),
    };
  });
}

function formatEventTime(event: ScheduleItem) {
  return new Date(event.startAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventRange(event: ScheduleItem) {
  const start = new Date(event.startAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = new Date(event.endAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${start} - ${end}`;
}
