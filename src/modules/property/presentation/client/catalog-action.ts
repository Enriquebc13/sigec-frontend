import { PropertyRequest } from "@/modules/request/domain/entities/request.entity";
import { Property } from "../../domain/entities/property.entity";

export type CatalogActionVariant =
  | "primary"
  | "pending"
  | "done"
  | "retry"
  | "disabled";

export interface CatalogAction {
  label: string;
  variant: CatalogActionVariant;
  /** true: el botón abre el formulario de solicitud */
  interactive: boolean;
}

// Se puede solicitar una propiedad disponible o reservada (en ese caso la
// solicitud entra a la lista de espera). Rentada o no disponible: no.
export const canRequest = (property: Property) =>
  property.status === "AVAILABLE" || property.status === "RESERVED";

/** Solicitud más reciente de cada propiedad (id de propiedad → solicitud). */
export function latestRequestByProperty(
  requests: PropertyRequest[],
): Map<string, PropertyRequest> {
  const map = new Map<string, PropertyRequest>();
  for (const request of requests) {
    const current = map.get(request.propertyId);
    if (!current || request.createdAt > current.createdAt) {
      map.set(request.propertyId, request);
    }
  }
  return map;
}

/**
 * Qué muestra el botón de cada tarjeta según la propiedad y la solicitud del
 * cliente. Misma lógica que el catálogo web.
 */
export function getCatalogAction(
  property: Property,
  request?: PropertyRequest,
): CatalogAction {
  const available = canRequest(property);
  const reserved = property.status === "RESERVED";
  const rented = property.status === "RENTED";

  if (request?.status === "PENDING") {
    return {
      label:
        request.posicionListaEspera != null
          ? `⏳ Pendiente · Lugar #${request.posicionListaEspera}`
          : "⏳ Solicitud pendiente",
      variant: "pending",
      interactive: false,
    };
  }

  if (request?.status === "APPROVED") {
    return {
      label: rented ? "🏠 Rentada por ti" : "✓ Solicitud aprobada",
      variant: "done",
      interactive: false,
    };
  }

  if (request?.status === "REJECTED") {
    return available
      ? {
          label: request.cancelledByApplicant
            ? "Cancelada · Volver a solicitar"
            : "Rechazada · Volver a solicitar",
          variant: "retry",
          interactive: true,
        }
      : {
          label: request.cancelledByApplicant
            ? "Solicitud cancelada"
            : "Solicitud rechazada",
          variant: "disabled",
          interactive: false,
        };
  }

  if (!available) {
    return {
      label: rented ? "Rentada" : "No disponible",
      variant: "disabled",
      interactive: false,
    };
  }

  return {
    label: reserved ? "Unirme a la lista de espera" : "Me interesa",
    variant: "primary",
    interactive: true,
  };
}
