export interface PropertyImage {
  id: string;
  url: string;
}

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  maintenanceCost: number | null;
  dimensions: string | null;
  floor: number | null;
  type: string; // LOCAL | OFFICE | WAREHOUSE
  status: string; // AVAILABLE | RESERVED | RENTED | UNAVAILABLE
  amenities: string | null;
  address: PropertyAddress | null;
  images: PropertyImage[];
}

/** Solicitud que la API rechazó automáticamente al cambiar el estado de la propiedad. */
export interface AutoRejectedRequest {
  id: string;
  telefono: string;
  /** PENDING al marcar la propiedad como rentada; APPROVED al liberar una reserva. */
  previousStatus: "PENDING" | "APPROVED";
  applicant: {
    id: string;
    name: string;
    lastname: string;
    email: string;
  };
  propertyId: string;
  propertyTitle: string;
}

export interface UpdatePropertyResult {
  property: Property;
  /** Vacío si el cambio no rechazó ninguna solicitud. */
  autoRejectedRequests: AutoRejectedRequest[];
}
