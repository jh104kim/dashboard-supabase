"use client";

import { usePathname } from "next/navigation";
import { LifeOsProvider } from "@/components/life-os-provider";

export function RootProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/gate") {
    return <>{children}</>;
  }

  return <LifeOsProvider>{children}</LifeOsProvider>;
}
