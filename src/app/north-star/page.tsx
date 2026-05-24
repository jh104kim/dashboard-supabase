import { AppShell } from "@/components/app-shell";
import { PrivateTracksGate } from "@/components/private-tracks-gate";
import { Panel, Pill, ProgressBar, SectionHeader } from "@/components/ui";
import {
  capabilityRows,
  northStar,
  privateFinancialGoals,
  privateHealthGoals,
} from "@/lib/life-os-data";

export default function NorthStarPage() {
  return (
    <AppShell active="/north-star">
      <SectionHeader
        eyebrow="North Star"
        title="북극성, 현재 위치, 다음 증거"
        description="가장 중요한 페이지다. 철학과 실행 상태를 같이 보여주고, 오늘의 선택이 장기 방향과 연결되는지 확인한다."
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel className="bg-[#fffdf7] xl:col-span-12">
          <p className="text-2xl font-black leading-9 text-[#1f2723]">
            {northStar.execution}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#68746c]">
            실행 북극성: {northStar.direction}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#68746c]">
            철학 문장: {northStar.philosophy}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {northStar.values.map((value) => (
              <Pill key={value}>{value}</Pill>
            ))}
          </div>
        </Panel>

        <Panel title="현재 위치" className="xl:col-span-4">
          <p className="text-4xl font-black text-[#157f5b]">2.4/5</p>
          <p className="mt-3 text-sm leading-6 text-[#68746c]">
            도메인 경험은 깊지만, 개인 앱 제품화 루프는 아직 만드는 중이다.
            지금 필요한 것은 더 많은 기획이 아니라 매일 쓰는 작은 화면이다.
          </p>
        </Panel>

        <Panel title="Milestone" className="xl:col-span-8">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="font-black">1개월</p>
              <p className="mt-2 text-sm leading-5 text-[#68746c]">
                Today/North Star/Review를 실제 입력 가능한 화면으로 만든다.
              </p>
            </div>
            <div>
              <p className="font-black">3개월</p>
              <p className="mt-2 text-sm leading-5 text-[#68746c]">
                매주 리뷰가 쌓이고, 학습과 콘텐츠 후보가 evidence로 남는다.
              </p>
            </div>
            <div>
              <p className="font-black">1년</p>
              <p className="mt-2 text-sm leading-5 text-[#68746c]">
                private cockpit에서 public portfolio layer를 분리한다.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Capability / Learning Need / Evidence" className="xl:col-span-8">
          <div className="grid gap-4">
            {capabilityRows.map((row) => (
              <div
                key={row.name}
                className="grid gap-3 border-b border-[#eef1ea] pb-4 last:border-0 last:pb-0 md:grid-cols-[180px_90px_1fr]"
              >
                <p className="font-black">{row.name}</p>
                <div>
                  <p className="font-black text-[#157f5b]">{row.score}/5</p>
                  <ProgressBar value={row.score * 20} />
                </div>
                <p className="text-sm leading-6 text-[#68746c]">
                  학습 필요: {row.need}
                  <br />
                  Evidence: {row.evidence}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <PrivateTracksGate
          financialGoals={privateFinancialGoals}
          healthGoals={privateHealthGoals}
        />
      </div>
    </AppShell>
  );
}
