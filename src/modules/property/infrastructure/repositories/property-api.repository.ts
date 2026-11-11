import { apiClient } from "@/core/http/api-client";
import { File } from "expo-file-system";
import { PropertyResponseDto } from "../../application/dtos/property-response.dto";
import { CreatePropertyInput } from "../../domain/entities/create-property-input";
import { ImageFile } from "../../domain/entities/image-file";
import { Property, PropertyImage } from "../../domain/entities/property.entity";
import { UpdatePropertyInput } from "../../domain/entities/update-property-input";
import { PropertyRepository } from "../../domain/interfaces/property.repository";
function toProperty(p: PropertyResponseDto): Property {
  return {
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
    address: p.address
      ? {
        street: p.address.street,
        city: p.address.city,
        state: p.address.state,
        zipCode: p.address.zipCode,
      }
      : null,
    images: (p.images ?? []).map((img) => ({ id: img.id, url: img.url })),
  };
}

export class PropertyApiRepository implements PropertyRepository {
  async getAll(): Promise<Property[]> {
    const data = await apiClient<PropertyResponseDto[]>("/properties");
    return data.map(toProperty);
  }

  async create(input: CreatePropertyInput): Promise<Property> {
    const data = await apiClient<PropertyResponseDto>("/properties", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toProperty(data);
  }
  
  async getById(id: string): Promise<Property> {
    const data = await apiClient<PropertyResponseDto>(`/properties/${id}`);
    return toProperty(data);
  }

  async update(id: string, input: UpdatePropertyInput): Promise<Property> {
    const data = await apiClient<PropertyResponseDto>(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return toProperty(data);
  }

  async delete(id: string): Promise<void> {
    await apiClient<{ message: string }>(`/properties/${id}`, {
      method: "DELETE",
    });
  }

  async addImage(propertyId: string, image: ImageFile): Promise<PropertyImage> {
    const form = new FormData();
    form.append("file", new File(image.uri) as unknown as Blob);
    form.append("propertyId", propertyId);

    const data = await apiClient<{ id: string; url: string }>("/images", {
      method: "POST",
      body: form,
    });
    return { id: data.id, url: data.url };
  }
}