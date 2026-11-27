import { useSyncExternalStore } from "react";
import { AutoRejectedRequest } from "../../domain/entities/property.entity";

/**
 * Puente entre "Editar propiedad" y el listado de Propiedades: la pantalla de
 * edición guarda aquí las solicitudes que la API rechazó sola, y el listado
 * (al que se vuelve tras guardar) las muestra en un aviso hasta que se cierre.
 * Vive en memoria: no se conserva si se cierra la app.
 */
let current: AutoRejectedRequest[] = [];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export function setAutoRejected(requests: AutoRejectedRequest[]) {
  current = requests;
  emit();
}

export const clearAutoRejected = () => setAutoRejected([]);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useAutoRejected(): AutoRejectedRequest[] {
  return useSyncExternalStore(subscribe, () => current, () => current);
}
