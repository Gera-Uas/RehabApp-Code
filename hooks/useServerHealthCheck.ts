"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

/**
 * Hook que verifica periódicamente si el servidor está activo
 * Si el servidor se apaga, cierra la sesión automáticamente
 */
export function useServerHealthCheck() {
  const { data: session } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveFailuresRef = useRef(0);

  useEffect(() => {
    // Solo ejecutar si hay sesión activa
    if (!session?.user) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const checkServerHealth = async () => {
      try {
        const response = await fetch("/api/health", {
          method: "GET",
          cache: "no-store"
        });

        if (response.ok) {
          // Servidor está activo, resetear contador
          consecutiveFailuresRef.current = 0;
        } else {
          // Respuesta no OK
          consecutiveFailuresRef.current++;
        }
      } catch (error) {
        // Error en la petición (servidor apagado/no disponible)
        consecutiveFailuresRef.current++;
      }

      // Si hay 3 fallos consecutivos, hacer logout
      if (consecutiveFailuresRef.current >= 3) {
        await signOut({ redirect: true, callbackUrl: "/login" });
      }
    };

    // Verificar cada 10 segundos
    intervalRef.current = setInterval(checkServerHealth, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session?.user]);
}
