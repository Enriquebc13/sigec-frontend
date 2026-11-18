export interface CreatePropertyInput {
  title: string;
  description?: string;
  price: number;
  maintenanceCost?: number;
  dimensions?: string;
  floor?: number;
  type: "LOCAL" | "OFFICE" | "WAREHOUSE";
  amenities?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  userId: string;
}