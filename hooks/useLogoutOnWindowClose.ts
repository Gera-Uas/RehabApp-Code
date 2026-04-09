"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

/**
 * Hook que cierra la sesión cuando se cierra la ventana del navegador
 * Escucha los eventos beforeunload y unload
 */
export function useLogoutOnWindowClose() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Hacer logout cuando se cierra la ventana
      signOut({ redirect: false });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleBeforeUnload);
    };
  }, []);
}
