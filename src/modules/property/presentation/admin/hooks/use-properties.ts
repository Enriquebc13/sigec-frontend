import { useCallback, useEffect, useState } from "react";

import { DeletePropertyUseCase } from "@/modules/property/application/usecases/delete-property.use-case";
import { GetPropertiesUseCase } from "@/modules/property/application/usecases/get-properties.use-case";
import { Property } from "@/modules/property/domain/entities/property.entity";
import { PropertyApiRepository } from "@/modules/property/infrastructure/repositories/property-api.repository";

const getPropertiesUseCase = new GetPropertiesUseCase(
  new PropertyApiRepository()
);

const deletePropertyUseCase = new DeletePropertyUseCase(
  new PropertyApiRepository()
);

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPropertiesUseCase.execute();
      setProperties(result);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudieron cargar las propiedades."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await deletePropertyUseCase.execute(id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { properties, loading, error, reload: load, remove };
}