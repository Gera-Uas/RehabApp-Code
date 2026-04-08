"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const getRoleDisplay = (role?: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: "Administrador",
      FISIOTERAPEUTA: "Fisioterapeuta",
      PACIENTE: "Paciente",
    };
    return roleMap[role || ""] || role || "";
  };

  const getRolePath = (role?: string) => {
    const pathMap: Record<string, string> = {
      ADMIN: "/admin",
      FISIOTERAPEUTA: "/fisio",
      PACIENTE: "/patient",
    };
    return pathMap[role || ""] || "/";
  };

  if (!session?.user) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            RehabApp
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href={getRolePath(session.user.role)}
              className="hover:text-blue-200"
            >
              Dashboard
            </Link>

            <div className="text-sm">
              <p className="font-semibold">{session.user.name}</p>
              <p className="text-blue-100">{getRoleDisplay(session.user.role)}</p>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-blue-600 border-blue-600"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
