export interface PropertyResponseDto {
  id: string;
  title: string;
  description: string | null;
  price: string;               
  maintenanceCost: string | null;
  dimensions: string | null;
  floor: number | null;
  type: string;
  status: string;
  amenities: string | null;
}