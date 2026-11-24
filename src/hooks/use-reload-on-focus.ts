import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * Ejecuta `reload` cada vez que la pantalla vuelve a tener foco, SALTÁNDOSE el
 * primer foco (ahí el hook de datos ya hizo su carga inicial). Los drawers
 * mantienen las pantallas montadas, así que sin esto verías datos viejos.
 */
export function useReloadOnFocus(reload: () => unknown) {
  const first = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      reload();
    }, [reload]),
  );
}
