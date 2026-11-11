import { GetPropertyUseCase } from "@/modules/property/application/usecases/get-property.use-case";
import { UpdatePropertyUseCase } from "@/modules/property/application/usecases/update-property.use-case";
import { Property } from "@/modules/property/domain/entities/property.entity";
import { UpdatePropertyInput } from "@/modules/property/domain/entities/update-property-input";
import { PropertyApiRepository } from "@/modules/property/infrastructure/repositories/property-api.repository";
import { useEffect, useState } from "react";

const repository = new PropertyApiRepository();
const getPropertyUseCase = new GetPropertyUseCase(repository);
const updatePropertyUseCase = new UpdatePropertyUseCase(repository);

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
    return { property, loading, error, saving, update };
}