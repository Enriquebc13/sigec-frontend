import { apiClient } from "@/core/http/api-client";
import { PropertyResponseDto } from "../../application/dtos/property-response.dto";
import { Property } from "../../domain/entities/property.entity";
import { PropertyRepository } from "../../domain/interfaces/property.repository";

export class PropertyApiRepository implements PropertyRepository {
  async getAll(): Promise<Property[]> {

    const data = await apiClient<PropertyResponseDto[]>('/properties');

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
      images: (p.images ?? []).map((img) => ({ id: img.id, url: img.url })),
    }));
  }
}