import { PropertyResponseDto } from "../../application/dtos/property-response.dto";
import { Property } from "../../domain/entities/property.entity";
import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class PropertyApiRepository implements PropertyRepository {
  async getAll(): Promise<Property[]> {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/properties`,
      {
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_TOKEN_ADMIN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status} al cargar las propiedades`);
    }

    const data: PropertyResponseDto[] = await response.json();

    return data.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      price: Number(p.price),
      maintenanceCost:
        p.maintenanceCost == null ? null : Number(p.maintenanceCost),
      dimensions: p.dimensions ?? null,
      floor: p.floor ?? null,
      type: p.type,
      status: p.status,
      amenities: p.amenities ?? null,
    }));
  }
}