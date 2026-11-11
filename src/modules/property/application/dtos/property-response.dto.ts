export interface PropertyImageDto {
  id: string;
  url: string;
}

export interface PropertyAddressDto {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

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
  address?: PropertyAddressDto | null;
  images?: PropertyImageDto[];
}