"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

const smokeTestSteps = [
  "배포 URL에 접속한다.",
  "비밀번호 화면만 보이는지 확인한다.",
  "오답을 입력해 거부 메시지를 확인한다.",
  "배포용 비밀번호를 입력해 Today 화면으로 들어간다.",
  "Today에서 task 하나를 추가하고 Task 저장 완료 메시지를 확인한다.",
  "Review에서 Generate Review Snapshot을 누른다.",
  "Save Review Snapshot을 눌러 Review snapshot 저장 완료를 확인한다.",
  "모바일 화면에서도 좌우 스크롤 없이 보이는지 확인한다.",
];

const dailyUseSteps = [
  "아침: 오늘 우선순위 3개만 입력한다.",
  "각 task가 북극성과 연결되는지 체크한다.",
  "에너지 점수와 회복 행동을 한 줄로 남긴다.",
  "낮: 학습, 회고, 콘텐츠 후보를 Quick Capture에 1개 남긴다.",
  "저녁: task를 완료/이월로 정리한다.",
  "주말: Review Snapshot을 생성하고 다음 주 개선점 하나를 저장한다.",
];

export function UsageGuideButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#c9d2c4] bg-white px-2 py-1 text-xs font-black text-[#1f2723] hover:bg-[#f8faf6]"
      >
        <HelpCircle size={14} />
        사용방법
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="usage-guide-title"
          className="fixed inset-0 z-50 bg-[#1f2723]/45 px-4 py-6"
        >
          <div className="mx-auto flex max-h-[calc(100vh-3rem)] max-w-3xl flex-col overflow-hidden rounded-lg border border-[#d9ded4] bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#eef1ea] px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase text-[#68746c]">
                  Sapporo Life OS
                </p>
                <h2
                  id="usage-guide-title"
                  className="mt-1 text-xl font-black text-[#1f2723]"
                >
                  배포 확인과 매일 사용하는 순서
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="사용방법 닫기"
                className="rounded-md border border-[#d9ded4] p-2 text-[#465249] hover:bg-[#f7f9f5]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <GuideBlock
                  title="배포 URL smoke test"
                  steps={smokeTestSteps}
                />
                <GuideBlock title="하루 사용 루틴" steps={dailyUseSteps} />
              </div>

              <div className="mt-5 rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-4">
                <p className="text-sm font-black text-[#1f2723]">
                  핵심 질문
                </p>
                <p className="mt-2 text-lg font-black leading-7 text-[#157f5b]">
                  오늘 이 행동은 내 북극성과 연결되는가?
                </p>
                <p className="mt-2 text-sm leading-6 text-[#68746c]">
                  이 앱은 많이 적는 도구가 아니라, 매일의 행동을 북극성,
                  evidence, 다음 개선점으로 연결하는 private cockpit이다.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function GuideBlock({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-4">
      <h3 className="text-sm font-black text-[#1f2723]">{title}</h3>
      <ol className="mt-3 grid gap-2">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-2 text-sm leading-6 text-[#465249]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e4f3eb] text-xs font-black text-[#157f5b]">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
