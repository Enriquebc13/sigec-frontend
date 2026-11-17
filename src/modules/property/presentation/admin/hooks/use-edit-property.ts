import { AddPropertyImageUseCase } from "@/modules/property/application/usecases/add-property-image.use-case";
import { DeletePropertyImageUseCase } from "@/modules/property/application/usecases/delete-property-image.use-case";
import { GetPropertyUseCase } from "@/modules/property/application/usecases/get-property.use-case";
import { UpdatePropertyUseCase } from "@/modules/property/application/usecases/update-property.use-case";
import { ImageFile } from "@/modules/property/domain/entities/image-file";
import { Property } from "@/modules/property/domain/entities/property.entity";
import { UpdatePropertyInput } from "@/modules/property/domain/entities/update-property-input";
import { PropertyApiRepository } from "@/modules/property/infrastructure/repositories/property-api.repository";
import { useCallback, useEffect, useState } from "react";

const repository = new PropertyApiRepository();
const getPropertyUseCase = new GetPropertyUseCase(repository);
const updatePropertyUseCase = new UpdatePropertyUseCase(repository);
const addImageUseCase = new AddPropertyImageUseCase(repository);
const deleteImageUseCase = new DeletePropertyImageUseCase(repository);

export function useEditProperty(id: string) {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        getPropertyUseCase
            .execute(id)
            .then((p) => {
                if (active) setProperty(p);
            })
            .catch((e) => {
                if (active) {
                    setError(
                        e instanceof Error ? e.message : "No se pudo cargar la propiedad."
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    const update = async (input: UpdatePropertyInput) => {
        setSaving(true);
        try {
            const updated = await updatePropertyUseCase.execute(id, input);
            setProperty(updated);
            return updated;
        } finally {
            setSaving(false);
        }
    };

    const reload = useCallback(async () => {
        setError(null);
        try {
            setProperty(await getPropertyUseCase.execute(id));
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "No se pudo cargar la propiedad."
            );
        }
    }, [id]);

    // Borra las fotos marcadas y sube las nuevas.
    // Devuelve cuántas operaciones fallaron.
    const syncImages = async (
        newImages: ImageFile[],
        removedImageIds: string[]
    ): Promise<number> => {
        setSaving(true);
        try {
            const results = await Promise.allSettled([

                ...removedImageIds.map((imageId) => deleteImageUseCase.execute(imageId)),
                ...newImages.map((image) => addImageUseCase.execute(id, image)),
            ]);
            const deletes = removedImageIds.length;
            results.forEach((r, i) => {
                if (r.status === "rejected") {
                    console.log(
                        i < deletes ? "Falló al BORRAR foto:" : "Falló al SUBIR foto:",
                        r.reason
                    );
                }
            });
            return results.filter((r) => r.status === "rejected").length;
        } finally {
            setSaving(false);
        }
    };

    return { property, loading, error, saving, update, syncImages, reload };
}