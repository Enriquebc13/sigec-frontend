import { useEffect, useState } from 'react';
import { checkOnboardingSeen } from './onboarding-services';

/** Lee si el dispositivo ya vio el intro. `loading` es true mientras se consulta. */
export function useOnboardingSeen() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    checkOnboardingSeen.execute().then((value) => {
      if (active) setSeen(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return { loading: seen === null, seen: seen ?? false };
}
