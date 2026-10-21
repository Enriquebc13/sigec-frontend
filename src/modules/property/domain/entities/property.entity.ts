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
}