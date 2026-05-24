import { LockKeyhole } from "lucide-react";

type GatePageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function GatePage({ searchParams }: GatePageProps) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";

  return (
    <main className="min-h-screen bg-[#f6f7f2] px-4 py-8 text-[#1f2723]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <div className="w-full rounded-lg border border-[#d9ded4] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-full bg-[#e9ede5] p-3 text-[#285d8f]">
              <LockKeyhole size={22} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#68746c]">
                Sapporo Polar
              </p>
              <h1 className="mt-1 text-2xl font-black">
                Private preview locked
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#68746c]">
                이 앱은 개인 Life OS private preview입니다. 접근 비밀번호를
                입력하면 대시보드를 열 수 있습니다.
              </p>
            </div>
          </div>

          <form action="/api/unlock" method="post" className="grid gap-3">
            <input type="hidden" name="next" value={nextPath} />
            <label htmlFor="password" className="text-sm font-bold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              className="rounded-lg border border-[#cfd7cb] bg-[#fbfcfa] px-3 py-3 text-base font-bold outline-none focus:border-[#157f5b] focus:ring-2 focus:ring-[#157f5b]/20"
              placeholder="비밀번호 입력"
              aria-label="Sapporo Polar password"
            />
            {params.error ? (
              <p className="rounded-md bg-[#fff1dd] px-3 py-2 text-sm font-bold text-[#9b650e]">
                비밀번호가 맞지 않습니다.
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-2 rounded-lg bg-[#1f2723] px-4 py-3 text-sm font-black text-white"
            >
              Unlock
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
