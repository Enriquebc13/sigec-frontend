export interface UpdatePropertyInput {
  title?: string;
  description?: string | null;
  price?: number;
  maintenanceCost?: number | null;
  dimensions?: string | null;
  floor?: number | null;
  type?: "LOCAL" | "OFFICE" | "WAREHOUSE";
  status?: "AVAILABLE" | "RESERVED" | "RENTED" | "UNAVAILABLE";
  amenities?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}