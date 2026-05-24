import {
  Brain,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Compass,
  Flame,
  HeartPulse,
  LineChart,
  NotebookPen,
  Target,
} from "lucide-react";
import type {
  EnergyState,
  PriorityItem,
  ReviewDraft,
  ScheduleItem,
} from "./life-os-types";

export const navItems = [
  { href: "/", label: "Today" },
  { href: "/north-star", label: "North Star" },
  { href: "/review", label: "Review" },
];

export const northStar = {
  execution:
    "26년의 도메인 지식을 풀스택 앱과 AI 자동화로 제품화한다.",
  philosophy:
    "나는 세계를 쪼개어 경계를 세우고, AI는 그 사이의 해를 꿰맨다.",
  direction:
    "매일의 행동이 학습, 콘텐츠, 포트폴리오, 삶의 성장으로 이어지게 만든다.",
  values: ["본질", "통합", "자동화", "가족", "성장", "자유", "경험"],
  currentQuestion:
    "오늘 이 행동은 내 북극성과 연결되는가? 아니라면 유지할 일인가 줄일 일인가?",
};

const privateConfig = {
  healthCurrent:
    process.env.NEXT_PUBLIC_PRIVATE_HEALTH_CURRENT ??
    "Private health baseline configured locally",
  healthTarget:
    process.env.NEXT_PUBLIC_PRIVATE_HEALTH_TARGET ??
    "Private health target configured locally",
  financeCurrent:
    process.env.NEXT_PUBLIC_PRIVATE_FINANCE_CURRENT ??
    "Private finance baseline configured locally",
  financeTarget:
    process.env.NEXT_PUBLIC_PRIVATE_FINANCE_TARGET ??
    "Private finance target configured locally",
};

export const todayPriorities: PriorityItem[] = [
  {
    id: "phase-1-app-structure",
    title: "Sapporo Life OS v0.1 앱 구조 만들기",
    detail: "Today, North Star, Review를 실제 앱 화면으로 분리한다.",
    value: "통합",
    aligned: true,
    status: "todo",
  },
  {
    id: "alignment-rule",
    title: "North Star alignment 계산 규칙 정리",
    detail: "AI 추론 없이 goal/value 직접 연결 방식으로 시작한다.",
    value: "본질",
    aligned: true,
    status: "todo",
  },
  {
    id: "evening-reflection",
    title: "저녁 한 줄 reflection 남기기",
    detail: "오늘의 행동과 가치가 맞았는지 확인한다.",
    value: "자동화",
    aligned: false,
    status: "carry",
  },
  {
    id: "health-recovery",
    title: "건강 회복 행동 하나를 일정에 고정하기",
    detail: "수면, 운동, 식단 중 하나를 오늘의 실행 evidence로 남긴다.",
    value: "본질",
    aligned: true,
    status: "todo",
  },
];

function eventTime(hour: number, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const directSchedule: ScheduleItem[] = [
  {
    id: "morning",
    title: "오늘 우선순위 정리",
    description: "북극성과 연결되는 3가지만 남긴다.",
    startAt: eventTime(8, 30),
    endAt: eventTime(9, 0),
    allDay: false,
    eventType: "work",
    intent: "해야 함",
    linkedValue: "본질",
    northStarAligned: true,
    energyCost: "medium",
    visibility: "private",
    sourceKind: "wiki-seed",
  },
  {
    id: "lunch",
    title: "학습/메모 quick capture",
    description: "오늘 배운 것 하나를 30초 안에 남긴다.",
    startAt: eventTime(12, 30),
    endAt: eventTime(12, 45),
    allDay: false,
    eventType: "learning",
    intent: "짧게",
    linkedValue: "성장",
    northStarAligned: true,
    energyCost: "low",
    visibility: "private",
    sourceKind: "wiki-seed",
  },
  {
    id: "evening",
    title: "가족/회복/운동",
    description: "장기 실행을 위한 회복 block.",
    startAt: eventTime(19, 0),
    endAt: eventTime(20, 0),
    allDay: false,
    eventType: "recovery",
    intent: "밀리면 안 됨",
    linkedValue: "가족",
    northStarAligned: true,
    energyCost: "low",
    visibility: "private",
    sourceKind: "wiki-seed",
  },
  {
    id: "night",
    title: "회고와 내일 carry over",
    description: "오늘의 행동과 가치가 맞았는지 확인한다.",
    startAt: eventTime(22, 0),
    endAt: eventTime(22, 15),
    allDay: false,
    eventType: "admin",
    intent: "10분",
    linkedValue: "자동화",
    northStarAligned: true,
    energyCost: "low",
    visibility: "private",
    sourceKind: "wiki-seed",
  },
];

export const initialEnergyState: EnergyState = {
  score: 58,
  reason: "건강/회복 상태를 반영한 실제 사용 가능 에너지",
  recoveryAction: "저녁 회복/운동 시간을 일정에 고정",
};

export const initialReviewDraft: ReviewDraft = {
  alignedAction: "Life OS 앱 구조를 실제 코드로 분리",
  wastedArea: "기획을 계속 넓히는 습관",
  evidence: "project-docs 15개와 v0.1 앱 scaffold",
  capabilityGap: "DB persistence와 daily input UX",
  nextOne: "Task/Reflection 저장 흐름 하나만 완성",
};

export const currentBaseline = {
  summary:
    "도메인 전문성은 강하지만, 개인 앱 제품화 루프와 public evidence 전환은 아직 초기 단계다. 건강과 재무는 장기 실행을 지탱하는 private 축이다.",
  northStarFit:
    "압축기 엔지니어링 지식을 풀스택 앱과 AI 자동화로 제품화하는 방향은 포트폴리오와 핵심 맥락에 강하게 정렬되어 있다.",
  scores: [
    {
      label: "Compressor Domain Expertise",
      score: 5,
      note: "26년 압축기 개발, 품질, 기술영업, 조직 리딩 경험이 북극성의 가장 강한 원천이다.",
    },
    {
      label: "AI/AX Direction",
      score: 3,
      note: "AI Crew Leader로 업무 자동화, RAG, Agent, Prompt Design 확장 중이다.",
    },
    {
      label: "Full-stack Productization",
      score: 2,
      note: "Next.js UI는 시작했지만 DB, 배포, 운영 루프는 아직 진행 전이다.",
    },
    {
      label: "Life OS Operating Loop",
      score: 2,
      note: "wiki와 앱 루프가 연결되기 시작했지만 실제 습관 데이터는 아직 부족하다.",
    },
    {
      label: "Public Evidence Pipeline",
      score: 1,
      note: "포트폴리오 방향은 있으나 공개 가능한 글/LinkedIn evidence 전환은 초기다.",
    },
  ],
  privateAxes: [
    {
      label: "Health and Energy Foundation",
      score: 2,
      current: privateConfig.healthCurrent,
      target: privateConfig.healthTarget,
      note: "장기 실행을 위해 건강 회복 행동이 task, schedule, energy 판단과 연결되어야 한다.",
    },
    {
      label: "Financial Freedom Track",
      score: 2,
      current: privateConfig.financeCurrent,
      target: privateConfig.financeTarget,
      note: "재무 목표는 돈의 크기보다 AI 액션 전문가/컨설턴트 전환의 선택권을 확보하는 기준이다.",
    },
  ],
  gaps: [
    {
      title: "제품화 gap",
      detail:
        "강한 도메인 지식을 사용 가능한 개인 앱과 업무 자동화 제품으로 만드는 full-stack 루프가 필요하다.",
      nextEvidence: "Task/Reflection/LearningLog/Review를 Supabase에 저장",
    },
    {
      title: "Review intelligence gap",
      detail:
        "Today 입력은 가능하지만, baseline과의 차이를 해석하는 Review 구조가 더 필요하다.",
      nextEvidence: "baseline, input, gap, next action이 한 화면에서 연결",
    },
    {
      title: "콘텐츠 전환 gap",
      detail:
        "개인 insight와 지식은 많지만 public blog/LinkedIn으로 전환된 evidence는 부족하다.",
      nextEvidence: "매주 공개 가능 후보 1개 작성",
    },
    {
      title: "건강/에너지 gap",
      detail:
        "장기 실행을 위해 건강 회복 행동이 task, schedule, energy 판단과 연결되어야 한다.",
      nextEvidence: "매일 회복 행동 1개를 일정에 고정",
    },
  ],
};

export const metrics = [
  {
    label: "Alignment",
    value: "67%",
    detail: "오늘 task 중 북극성과 연결된 비율",
    icon: Compass,
  },
  {
    label: "Energy",
    value: "58%",
    detail: "건강/회복 상태를 반영한 실제 사용 가능 에너지",
    icon: HeartPulse,
  },
  {
    label: "Focus",
    value: "3",
    detail: "오늘의 우선순위",
    icon: Target,
  },
  {
    label: "Friction",
    value: "1",
    detail: "오늘 줄여야 할 마찰",
    icon: Flame,
  },
];

export const capabilityRows = [
  {
    name: "Next.js 앱 구조화",
    score: 2,
    need: "App Router, Server Actions, form 흐름",
    evidence: "Today/North Star/Review 화면 구현",
  },
  {
    name: "DB 모델링",
    score: 2,
    need: "Supabase PostgreSQL, 관계 설계",
    evidence: "Task, Reflection, Review 테이블 설계",
  },
  {
    name: "제품화 감각",
    score: 2,
    need: "매일 쓰는 화면의 밀도와 흐름",
    evidence: "1주일 연속 daily/review 입력",
  },
  {
    name: "콘텐츠 전환",
    score: 1,
    need: "private insight를 공개 가능한 문장으로 변환",
    evidence: "블로그/LinkedIn 초안 3개",
  },
];

export const privateFinancialGoals = [
  {
    age: process.env.NEXT_PUBLIC_PRIVATE_FINANCE_AGE1 ?? "1단계",
    target:
      process.env.NEXT_PUBLIC_PRIVATE_FINANCE_TARGET1 ??
      "월 현금흐름 안정화",
    detail:
      process.env.NEXT_PUBLIC_PRIVATE_FINANCE_DETAIL1 ??
      "고정비, 저축, 투자, 학습비를 한 화면에서 추적하고 매월 잉여 현금흐름을 확인한다.",
  },
  {
    age: process.env.NEXT_PUBLIC_PRIVATE_FINANCE_AGE2 ?? "2단계",
    target:
      process.env.NEXT_PUBLIC_PRIVATE_FINANCE_TARGET2 ??
      "AI 앱/컨설팅 수익 루프",
    detail:
      process.env.NEXT_PUBLIC_PRIVATE_FINANCE_DETAIL2 ??
      "도메인 지식, 자동화 보고서, 개인 앱을 연결해 반복 가능한 부수입 실험을 만든다.",
  },
  {
    age: process.env.NEXT_PUBLIC_PRIVATE_FINANCE_AGE3 ?? "3단계",
    target:
      process.env.NEXT_PUBLIC_PRIVATE_FINANCE_TARGET3 ??
      "선택권을 주는 자산 구조",
    detail:
      process.env.NEXT_PUBLIC_PRIVATE_FINANCE_DETAIL3 ??
      "은퇴, 전환, 독립 프로젝트를 선택할 수 있도록 자산, 현금흐름, 건강 루틴을 함께 관리한다.",
  },
];

export const privateHealthGoals = [
  {
    metric: process.env.NEXT_PUBLIC_PRIVATE_HEALTH_METRIC1 ?? "수면 회복",
    current:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_CURRENT1 ?? "기록 시작",
    target:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_TARGET1 ?? "주 5일 안정 수면",
    detail:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_DETAIL1 ??
      "매일 수면 시간과 회복감을 기록해 다음 날 에너지 판단에 반영한다.",
  },
  {
    metric: process.env.NEXT_PUBLIC_PRIVATE_HEALTH_METRIC2 ?? "운동 루틴",
    current:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_CURRENT2 ?? "주간 루틴 구축",
    target:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_TARGET2 ?? "주 3회 지속",
    detail:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_DETAIL2 ??
      "강도보다 지속성을 우선해 걷기, 근력, 스트레칭 중 하나를 일정에 고정한다.",
  },
  {
    metric: process.env.NEXT_PUBLIC_PRIVATE_HEALTH_METRIC3 ?? "식단/체중",
    current:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_CURRENT3 ?? "기준선 확인",
    target:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_TARGET3 ?? "무리 없는 감량",
    detail:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_DETAIL3 ??
      "숫자보다 저녁 식사, 간식, 음주 같은 반복 패턴을 먼저 추적한다.",
  },
  {
    metric: process.env.NEXT_PUBLIC_PRIVATE_HEALTH_METRIC4 ?? "스트레스 관리",
    current:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_CURRENT4 ?? "일일 신호 기록",
    target:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_TARGET4 ?? "번아웃 전 조정",
    detail:
      process.env.NEXT_PUBLIC_PRIVATE_HEALTH_DETAIL4 ??
      "업무 압박과 회복 행동을 함께 기록해 무리한 계획을 줄인다.",
  },
];

export const weeklyOutputs = [
  {
    label: "Aligned Action",
    value: "Life OS 앱 구조를 실제 코드로 분리",
    icon: CheckCircle2,
  },
  {
    label: "Wasted Area",
    value: "기획을 계속 넓히는 습관",
    icon: CircleDot,
  },
  {
    label: "Evidence",
    value: "project-docs 15개와 v0.1 앱 scaffold",
    icon: NotebookPen,
  },
  {
    label: "Capability Gap",
    value: "DB persistence와 daily input UX",
    icon: Brain,
  },
  {
    label: "Next One",
    value: "Task/Reflection 저장 흐름 하나만 완성",
    icon: CalendarDays,
  },
  {
    label: "Insight",
    value: "삶의 방향과 행동 정렬이 제품의 핵심 보상",
    icon: LineChart,
  },
];
