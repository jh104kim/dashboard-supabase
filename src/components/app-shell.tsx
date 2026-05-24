import Link from "next/link";
import { navItems } from "@/lib/life-os-data";
import { UsageGuideButton } from "@/components/usage-guide-button";

type AppShellProps = {
  active: string;
  children: React.ReactNode;
};

export function AppShell({ active, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f7f2] text-[#1f2723]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-[#d9ded4] bg-[#eef1ea] px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <Link href="/" className="block text-xl font-black tracking-normal">
            Sapporo Life OS
          </Link>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-sm text-[#68746c]">
              Private cockpit before portfolio
            </p>
            <UsageGuideButton />
          </div>

          <nav className="mt-8 grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  active === item.href
                    ? "bg-[#dfe6d8] text-[#1f2723]"
                    : "text-[#465249] hover:bg-[#e4eadf]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-[#cfd8ca] bg-[#f8faf6] p-3 text-xs leading-5 text-[#546057]">
            초기 버전은 완전 private. 공개용 미화보다 실제 판단,
            우선순위, 모순, 욕망, 미룸을 드러내는 쪽을 우선한다.
          </div>
        </aside>

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
