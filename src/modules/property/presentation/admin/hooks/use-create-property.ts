import { useState } from "react";

import { useApiAuth } from "@/modules/auth-api/presentation/context/ApiAuthProvider"; // ajusta la ruta
import { CreatePropertyUseCase } from "@/modules/property/application/usecases/create-property.use-case";
import { CreatePropertyInput } from "@/modules/property/domain/entities/create-property-input";
import { PropertyApiRepository } from "@/modules/property/infrastructure/repositories/property-api.repository";

const createPropertyUseCase = new CreatePropertyUseCase(
  new PropertyApiRepository()
);

export function useCreateProperty() {
  const { session } = useApiAuth();
  const [saving, setSaving] = useState(false);

  const create = async (input: Omit<CreatePropertyInput, "userId">) => {
    if (!session) throw new Error("No hay una sesión activa.");

    setSaving(true);
    try {
      return await createPropertyUseCase.execute({
        ...input,
        userId: session.userId,
      });
    } finally {
      setSaving(false);
    }
  };

  return { create, saving };
}