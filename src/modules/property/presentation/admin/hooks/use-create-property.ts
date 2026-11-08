import { useApiAuth } from "@/modules/auth-api/presentation/context/ApiAuthProvider"; // ajusta la ruta
import { AddPropertyImageUseCase } from "@/modules/property/application/usecases/add-property-image.use-case";
import { CreatePropertyUseCase } from "@/modules/property/application/usecases/create-property.use-case";
import { CreatePropertyInput } from "@/modules/property/domain/entities/create-property-input";
import { ImageFile } from "@/modules/property/domain/entities/image-file";
import { PropertyApiRepository } from "@/modules/property/infrastructure/repositories/property-api.repository";
import { useState } from "react";

const repository = new PropertyApiRepository();
const createPropertyUseCase = new CreatePropertyUseCase(repository);
const addPropertyImageUseCase = new AddPropertyImageUseCase(repository);

export function useCreateProperty() {
  const { session } = useApiAuth();
  const [saving, setSaving] = useState(false);
  const create = async (input: Omit<CreatePropertyInput, "userId">,
    images: ImageFile[] = []
  ) => {
    if (!session) throw new Error("No hay una sesión activa.");

    setSaving(true);
    try {
      // Se crea la propiedad. Si esto falla, no se sube ninguna foto.
      const property = await createPropertyUseCase.execute({
        ...input,
        userId: session.userId,
      });
      // Con el id de la propiedad, se sube cada foto.
      const results = await Promise.allSettled(
        images.map((image) =>
          addPropertyImageUseCase.execute(property.id, image)
        )
      );
      
      //Se cuentan las fotos que fallaron.
      const failedImages = results.filter(
        (r) => r.status === "rejected"
      ).length;

      return { property, failedImages };

    } finally {
      setSaving(false);
    }
  };
  return { create, saving };
}