"use client";

import { usePathname } from "next/navigation";
import { WhatsAppButton } from "./WhatsAppButton";
import { BackToTop } from "./BackToTop";
import { TopContactBar, TopContactBarProvider } from "./TopContactBar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        {children}
        <BackToTop />
      </>
    );
  }

  return (
    <TopContactBarProvider>
      <TopContactBar />
      {children}
      <WhatsAppButton />
      <BackToTop />
    </TopContactBarProvider>
  );
}
