"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleDot,
  HeartPulse,
  NotebookPen,
  WalletCards,
} from "lucide-react";
import { useLifeOs } from "@/components/life-os-provider";
import { Panel, ProgressBar, SectionHeader } from "@/components/ui";
import { currentBaseline } from "@/lib/life-os-data";

export function ReviewDashboard() {
  const {
    priorities,
    captures,
    reviewDraft,
    alignmentPercent,
    completedEvidenceCount,
    energy,
    persistence,
    dailyLoopState,
    weeklyInsights,
    generatedReviewSnapshot,
    updateReviewDraft,
    generateReviewSnapshot,
    saveReviewSnapshot,
  } = useLifeOs();

  const doneItems = priorities.filter((item) => item.status === "done");
  const carryItems = priorities.filter((item) => item.status === "carry");
  const alignedDoneItems = doneItems.filter((item) => item.aligned);
  const latestCapture = captures[0]?.text ?? "아직 quick capture가 없다.";

  const strongestScore = currentBaseline.scores[0];
  const weakestScore = currentBaseline.scores.reduce((lowest, item) =>
    item.score < lowest.score ? item : lowest,
  );

  return (
    <>
      <SectionHeader
        eyebrow="Weekly Review"
        title="Baseline에서 오늘의 gap을 본다"
        description="wiki에 정리된 현재 수준을 기준으로 저장된 Today 입력을 비교하고, 다음 행동 하나를 생성한다."
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel title="1. Baseline" className="xl:col-span-12">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
            <div className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-4">
              <p className="text-xs font-black uppercase text-[#68746c]">
                Wiki Current Baseline
              </p>
              <p className="mt-2 text-xl font-black leading-8 text-[#1f2723]">
                {currentBaseline.summary}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#68746c]">
                {currentBaseline.northStarFit}
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-lg border border-[#d9ded4] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-[#68746c]">
                    Strongest asset
                  </p>
                  <span className="text-lg font-black text-[#157f5b]">
                    {strongestScore.score}/5
                  </span>
                </div>
                <p className="mt-1 font-black">{strongestScore.label}</p>
                <p className="mt-2 text-sm leading-5 text-[#68746c]">
                  {strongestScore.note}
                </p>
              </div>
              <div className="rounded-lg border border-[#d9ded4] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-[#68746c]">
                    Weakest evidence loop
                  </p>
                  <span className="text-lg font-black text-[#b5483b]">
                    {weakestScore.score}/5
                  </span>
                </div>
                <p className="mt-1 font-black">{weakestScore.label}</p>
                <p className="mt-2 text-sm leading-5 text-[#68746c]">
                  {weakestScore.note}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {currentBaseline.scores.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[#d9ded4] bg-white p-3"
              >
                <p className="min-h-10 text-sm font-black leading-5">
                  {item.label}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-black text-[#157f5b]">
                    {item.score}/5
                  </span>
                  <span className="text-[#68746c]">readiness</span>
                </div>
                <ProgressBar value={item.score * 20} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Private Life Axes" className="xl:col-span-12">
          <div className="grid gap-4 md:grid-cols-2">
            {currentBaseline.privateAxes.map((axis) => {
              const Icon =
                axis.label === "Health and Energy Foundation"
                  ? HeartPulse
                  : WalletCards;

              return (
                <div
                  key={axis.label}
                  className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[#68746c]">
                        {axis.label}
                      </p>
                      <p className="mt-1 text-2xl font-black text-[#157f5b]">
                        {axis.score}/5
                      </p>
                    </div>
                    <Icon className="h-5 w-5 text-[#285d8f]" />
                  </div>
                  <ProgressBar value={axis.score * 20} />
                  <div className="mt-4 grid gap-3 text-sm leading-6">
                    <div>
                      <p className="text-xs font-black uppercase text-[#68746c]">
                        Current
                      </p>
                      <p className="mt-1 text-[#1f2723]">{axis.current}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-[#68746c]">
                        Target
                      </p>
                      <p className="mt-1 text-[#1f2723]">{axis.target}</p>
                    </div>
                    <p className="rounded-md border border-[#d9ded4] bg-white p-3 text-[#68746c]">
                      {axis.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#68746c]">
            이 영역은 private review 기준이다. public portfolio, LinkedIn, blog
            export에는 직접 노출하지 않는다.
          </p>
        </Panel>

        <Panel title="2. Today Input" className="xl:col-span-4">
          <div className="grid gap-3 text-sm leading-6">
            <div className="flex items-center justify-between">
              <span className="font-bold">완료 task</span>
              <span>{doneItems.length}개</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold">aligned 완료</span>
              <span>{alignedDoneItems.length}개</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold">이월</span>
              <span>{carryItems.length}개</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold">Quick capture</span>
              <span>{dailyLoopState.captureCount}개</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold">학습/회고/콘텐츠</span>
              <span>
                {dailyLoopState.learningCount}/{dailyLoopState.reflectionCount}/
                {dailyLoopState.contentIdeaCount}
              </span>
            </div>
            <div className="rounded-md border border-[#d9ded4] bg-[#fbfcfa] p-3">
              <p className="font-black">Energy {energy.score}%</p>
              <p className="mt-1 text-[#68746c]">{energy.reason}</p>
            </div>
            <div className="rounded-md border border-[#d9ded4] bg-[#fbfcfa] p-3">
              <p className="font-black">Recent task signal</p>
              <div className="mt-2 grid gap-1">
                {priorities
                  .slice(-3)
                  .reverse()
                  .map((item) => (
                    <p key={item.id} className="text-[#68746c]">
                      {item.title}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="3. Gap" className="xl:col-span-4">
          <div className="grid gap-3">
            <div className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-black">North Star Alignment</span>
                <span>{alignmentPercent}%</span>
              </div>
              <ProgressBar value={alignmentPercent} />
              <p className="mt-2 text-sm leading-5 text-[#68746c]">
                완료 evidence 후보 {completedEvidenceCount}개. 오늘 입력이
                baseline gap을 줄였는지 확인한다.
              </p>
              <p className="mt-2 rounded-md border border-[#d9ded4] bg-white p-3 text-sm font-bold leading-5 text-[#1f2723]">
                Alignment diagnosis: {weeklyInsights.alignmentDiagnosis}
              </p>
            </div>
            {currentBaseline.gaps.slice(0, 2).map((gap) => (
              <div
                key={gap.title}
                className="rounded-lg border border-[#d9ded4] bg-white p-3"
              >
                <p className="font-black">{gap.title}</p>
                <p className="mt-1 text-sm leading-5 text-[#68746c]">
                  {gap.detail}
                </p>
                <p className="mt-2 text-xs font-bold text-[#285d8f]">
                  다음 증거: {gap.nextEvidence}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="4. Next Action" className="xl:col-span-4">
          <div className="grid gap-3">
            <textarea
              value={reviewDraft.nextOne}
              onChange={(event) =>
                updateReviewDraft("nextOne", event.target.value)
              }
              className="min-h-28 rounded-md border border-[#d9ded4] bg-[#fbfcfa] p-3 text-sm leading-6 outline-none focus:border-[#157f5b] focus:ring-2 focus:ring-[#157f5b]/20"
              aria-label="다음 주 하나의 개선점"
            />
            <div className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-3 text-sm leading-6">
              <p className="font-black">Latest insight</p>
              <p className="mt-1 text-[#68746c]">{latestCapture}</p>
            </div>
            <p className="inline-flex items-start gap-2 text-xs leading-5 text-[#68746c]">
              <ArrowRight size={14} className="mt-0.5 shrink-0" />
              다음 주 하나만 고른다. 여러 문제를 고치는 화면이 아니라, 가장
              중요한 gap 하나를 줄이는 화면이다.
            </p>
            <button
              type="button"
              onClick={generateReviewSnapshot}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1f2723] bg-white px-4 py-2 text-sm font-black text-[#1f2723]"
            >
              <Brain size={16} />
              Generate Review Snapshot
            </button>
            <button
              type="button"
              onClick={() => void saveReviewSnapshot()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f2723] px-4 py-2 text-sm font-black text-white"
            >
              <NotebookPen size={16} />
              Save Review Snapshot
            </button>
            <p className="text-xs leading-5 text-[#68746c]">
              {persistence.message}
            </p>
          </div>
        </Panel>

        <Panel title="Generated Review Intelligence" className="xl:col-span-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InsightCard
              label="Alignment diagnosis"
              value={weeklyInsights.alignmentDiagnosis}
            />
            <InsightCard
              label="Best aligned action"
              value={weeklyInsights.bestAlignedAction}
            />
            <InsightCard
              label="Next one improvement"
              value={weeklyInsights.nextOneImprovement}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-[#68746c]">
            {generatedReviewSnapshot
              ? "Generated snapshot이 Review draft에 반영됐다."
              : "버튼을 누르면 현재 Today 입력과 저장된 task/capture를 바탕으로 Review draft를 갱신한다."}
          </p>
        </Panel>

        <Panel title="Weekly Review Outputs" className="xl:col-span-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OutputCard
              icon={<CheckCircle2 className="h-5 w-5 text-[#285d8f]" />}
              label="Aligned Action"
              value={weeklyInsights.bestAlignedAction}
            />
            <OutputCard
              icon={<CircleDot className="h-5 w-5 text-[#285d8f]" />}
              label="Wasted Area"
              value={weeklyInsights.wastedArea}
            />
            <OutputCard
              icon={<NotebookPen className="h-5 w-5 text-[#285d8f]" />}
              label="Evidence"
              value={weeklyInsights.evidenceSummary}
            />
            <OutputCard
              icon={<Brain className="h-5 w-5 text-[#285d8f]" />}
              label="Capability Gap"
              value={weeklyInsights.capabilityGap}
            />
          </div>
        </Panel>
      </div>
    </>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-4">
      <p className="text-sm font-black text-[#68746c]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#1f2723]">{value}</p>
    </div>
  );
}

function OutputCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-black text-[#68746c]">{label}</p>
        {icon}
      </div>
      <p className="text-sm leading-6 text-[#1f2723]">{value}</p>
    </div>
  );
}
