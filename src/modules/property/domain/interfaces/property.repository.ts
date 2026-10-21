import { Property } from "../entities/property.entity";

export interface PropertyRepository {
  getAll(): Promise<Property[]>;
}