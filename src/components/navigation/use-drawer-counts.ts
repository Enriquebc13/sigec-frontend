import { useCallback, useEffect, useRef, useState } from 'react';

/** Número por ruta del drawer (clave = nombre de la pantalla). */
export type DrawerCounts = Record<string, number | undefined>;

/**
 * Mantiene los números del drawer. Se cargan al montar el layout y se vuelven a
 * pedir cada vez que se abre el menú (que es cuando se ven), con una pausa
 * mínima para no repetir llamadas si se abre y cierra rápido. Si una carga
 * falla, se conservan los números anteriores en vez de borrarlos.
 */
export function useDrawerCounts(
  load: () => Promise<DrawerCounts>,
  minIntervalMs = 5000,
) {
  const [counts, setCounts] = useState<DrawerCounts>({});
  const inFlight = useRef(false);
  const lastLoad = useRef(0);

  const refresh = useCallback(
    async (force = false) => {
      if (inFlight.current) return;
      if (!force && Date.now() - lastLoad.current < minIntervalMs) return;
      inFlight.current = true;
      try {
        const next = await load();
        lastLoad.current = Date.now();
        setCounts((prev) => {
          const merged = { ...prev };
          for (const [key, value] of Object.entries(next)) {
            if (value !== undefined) merged[key] = value;
          }
          return merged;
        });
      } finally {
        inFlight.current = false;
      }
    },
    [load, minIntervalMs],
  );

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  return { counts, refresh };
}
