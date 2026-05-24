"use client";

import { useState } from "react";
import { Lock, ShieldCheck, Unlock } from "lucide-react";
import { Panel } from "@/components/ui";

type FinancialGoal = {
  age: string;
  target: string;
  detail: string;
};

type HealthGoal = {
  metric: string;
  current: string;
  target: string;
  detail: string;
};

type PrivateTracksGateProps = {
  financialGoals: FinancialGoal[];
  healthGoals: HealthGoal[];
};

const cockpitKey = process.env.NEXT_PUBLIC_COCKPIT_KEY ?? "";

export function PrivateTracksGate({
  financialGoals,
  healthGoals,
}: PrivateTracksGateProps) {
  const [input, setInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");

  function unlockPrivateTracks() {
    if (!cockpitKey) {
      setError("로컬 .env에 NEXT_PUBLIC_COCKPIT_KEY를 설정하세요.");
      return;
    }

    if (input === cockpitKey) {
      setIsUnlocked(true);
      setError("");
      return;
    }

    setError("키가 맞지 않습니다. 다시 입력하세요.");
  }

  function hidePrivateTracks() {
    setIsUnlocked(false);
    setInput("");
    setError("");
  }

  if (!isUnlocked) {
    return (
      <Panel title="Private Financial Track / Private Health Track" className="xl:col-span-12">
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#e9ede5] p-2 text-[#285d8f]">
                <Lock size={20} />
              </div>
              <div>
                <p className="font-black text-[#1f2723]">Private cockpit locked</p>
                <p className="mt-2 text-sm leading-6 text-[#68746c]">
                  재무 목표와 건강 수치는 개인 실행 판단에만 사용하는 민감 정보다.
                  기본 화면에서는 숨기고, cockpit key를 입력한 뒤에만 표시한다.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#d9ded4] bg-white p-5">
            <label
              htmlFor="private-track-key"
              className="text-sm font-bold text-[#465249]"
            >
              Cockpit key
            </label>
            <div className="mt-3 flex gap-2">
              <input
                id="private-track-key"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    unlockPrivateTracks();
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-2 text-base font-bold text-[#1f2723] outline-none focus:border-[#157f5b] focus:ring-2 focus:ring-[#157f5b]/20"
                placeholder="키 입력"
                aria-label="Private track cockpit key"
              />
              <button
                type="button"
                onClick={unlockPrivateTracks}
                aria-label="Unlock private tracks"
                className="inline-flex items-center justify-center rounded-lg bg-[#1f2723] px-4 py-2 text-sm font-bold text-white"
              >
                <Unlock size={16} />
              </button>
            </div>
            {error ? (
              <p className="mt-2 text-sm font-bold text-[#b5483b]">{error}</p>
            ) : (
              <p className="mt-2 text-xs leading-5 text-[#68746c]">
                MVP 단계의 UI 잠금이다. 실제 배포 보안은 Auth/preview protection에서
                별도로 처리한다.
              </p>
            )}
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel title="Private Financial Track" className="xl:col-span-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#eef6f0] px-3 py-2 text-sm font-bold text-[#157f5b]">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={16} />
            Unlocked private cockpit
          </span>
          <button
            type="button"
            onClick={hidePrivateTracks}
            aria-label="Hide private tracks"
            className="inline-flex items-center gap-1 rounded-md border border-[#b9d8c6] bg-white px-2 py-1 text-xs font-black text-[#1f2723]"
          >
            <Lock size={14} />
            Hide
          </button>
        </div>
        <div className="grid gap-4">
          {financialGoals.map((goal) => (
            <div
              key={goal.age}
              className="border-b border-[#eef1ea] pb-3 last:border-0 last:pb-0"
            >
              <p className="text-sm font-bold text-[#68746c]">{goal.age}</p>
              <p className="mt-1 text-2xl font-black text-[#285d8f]">
                {goal.target}
              </p>
              <p className="mt-2 text-sm leading-5 text-[#68746c]">
                {goal.detail}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Private Health Track" className="xl:col-span-8">
        <div className="grid gap-4 md:grid-cols-2">
          {healthGoals.map((goal) => (
            <div
              key={goal.metric}
              className="rounded-lg border border-[#d9ded4] bg-[#fbfcfa] p-4"
            >
              <p className="text-sm font-bold text-[#68746c]">{goal.metric}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#68746c]">현재</p>
                  <p className="text-2xl font-black text-[#b5483b]">
                    {goal.current}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#68746c]">목표</p>
                  <p className="text-lg font-black text-[#157f5b]">
                    {goal.target}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-5 text-[#68746c]">
                {goal.detail}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-[#68746c]">
          건강 수치는 private cockpit 맥락에서만 사용한다. public profile 또는
          LinkedIn/portfolio export에는 직접 노출하지 않는다.
        </p>
      </Panel>
    </>
  );
}
