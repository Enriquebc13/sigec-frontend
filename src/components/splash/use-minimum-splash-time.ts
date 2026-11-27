import { useEffect, useState } from 'react';

/** true cuando ya pasaron `ms` desde que se montó; así el splash no parpadea si todo carga rápido. */
export function useMinimumSplashTime(ms: number) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), ms);
    return () => clearTimeout(timer);
  }, [ms]);

  return elapsed;
}
