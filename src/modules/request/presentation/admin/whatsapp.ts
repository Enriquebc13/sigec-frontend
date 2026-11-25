import { Alert, Linking } from 'react-native';
import { RequestStatus } from '../../domain/entities/request.entity';

// Lada de México. Cámbiala si el sistema se usa en otro país.
const COUNTRY_CODE = '52';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/** wa.me pide el número en formato internacional: solo dígitos y sin "+". */
export function toWhatsAppNumber(telefono: string): string {
  const digits = onlyDigits(telefono);
  // Los teléfonos de la solicitud son de 10 dígitos: se les agrega la lada del país
  return digits.length === 10 ? `${COUNTRY_CODE}${digits}` : digits;
}

/** Evita armar enlaces con números demasiado cortos. */
export const isWhatsAppReachable = (telefono: string) =>
  onlyDigits(telefono).length >= 10;

type MessageParams = {
  /** Nombre del solicitante (se usa solo el primer nombre). */
  applicant: string;
  /** Título real de la propiedad; si no se conoce, el mensaje no la menciona. */
  propertyTitle?: string;
  status: RequestStatus;
  /** Turno en la lista de espera (solo tiene sentido con status PENDING). */
  position?: number | null;
};

// Estos textos son un punto de partida: la persona puede editarlos en WhatsApp.
export function buildContactMessage({
  applicant,
  propertyTitle,
  status,
  position,
}: MessageParams): string {
  const firstName = applicant.trim().split(' ')[0];
  const about = propertyTitle ? ` para «${propertyTitle}»` : '';

  switch (status) {
    case 'APPROVED':
      return `Hola ${firstName}, tu solicitud${about} fue aprobada. Te escribimos de SIGEC para coordinar los siguientes pasos.`;
    case 'REJECTED':
      return `Hola ${firstName}, gracias por tu interés${
        propertyTitle ? ` en «${propertyTitle}»` : ''
      }. Por ahora no pudimos aprobar tu solicitud, pero con gusto te ayudamos a revisar otras opciones.`;
    default:
      if (position === 1) {
        return `Hola ${firstName}, te escribimos de SIGEC. Eres el siguiente en la lista de espera${about ? ` de «${propertyTitle}»` : ''}. ¿Sigues interesado/a?`;
      }
      if (position && position > 1) {
        return `Hola ${firstName}, te escribimos de SIGEC. Vas en el lugar #${position} de la lista de espera${
          propertyTitle ? ` de «${propertyTitle}»` : ''
        }. Te avisaremos cuando te toque tu turno.`;
      }
      return `Hola ${firstName}, te escribimos de SIGEC sobre tu solicitud${about}. ¿Tienes un momento para platicar?`;
  }
}

export function buildWhatsAppUrl(telefono: string, message: string): string {
  return `https://wa.me/${toWhatsAppNumber(telefono)}?text=${encodeURIComponent(message)}`;
}

/**
 * Abre WhatsApp (app si está instalada; si no, el navegador) con el mensaje
 * prellenado y editable. Con https://wa.me no hace falta canOpenURL ni
 * declarar esquemas en iOS/Android.
 */
export async function openWhatsApp(telefono: string, message: string) {
  if (!isWhatsAppReachable(telefono)) {
    Alert.alert('Teléfono no válido', 'El número no tiene suficientes dígitos para WhatsApp.');
    return;
  }
  try {
    await Linking.openURL(buildWhatsAppUrl(telefono, message));
  } catch {
    Alert.alert('No se pudo abrir WhatsApp', 'Verifica que WhatsApp esté instalado o inténtalo de nuevo.');
  }
}
