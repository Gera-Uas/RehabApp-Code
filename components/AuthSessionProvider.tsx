"use client";

import { SessionProvider } from "next-auth/react";
import { useLogoutOnWindowClose } from "@/hooks/useLogoutOnWindowClose";
import { useServerHealthCheck } from "@/hooks/useServerHealthCheck";

function SessionMonitor() {
  useLogoutOnWindowClose();
  useServerHealthCheck();
  return null;
}

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionMonitor />
      {children}
    </SessionProvider>
  );
}

