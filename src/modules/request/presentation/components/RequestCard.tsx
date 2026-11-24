import { PropertyRequest } from '@/modules/request/domain/entities/request.entity';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { displayStatusLabel } from '../request-labels';

type RequestCardProps = {
  request: PropertyRequest;
  propertyTitle: string;
  /** Solo se manda en la vista del admin: muestra quién hizo la solicitud. */
  applicant?: { name: string; email: string };
  /** Contenido extra al final de la tarjeta (historial, botones de acción...). */
  children?: ReactNode;
};

export default function RequestCard({
  request,
  propertyTitle,
  applicant,
  children,
}: RequestCardProps) {
  const displayId =
    request.id.length > 8 ? request.id.slice(-6) : request.id || '---';

  const formattedDate = !isNaN(request.createdAt.getTime())
    ? request.createdAt.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Fecha no disponible';

  const cancelled =
    request.status === 'REJECTED' && request.cancelledByApplicant;

  const statusStyle =
    request.status === 'PENDING'
      ? styles.pending
      : request.status === 'APPROVED'
        ? styles.approved
        : cancelled
          ? styles.cancelled
          : styles.rejected;

  return (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.requestNumber}>Solicitud #{displayId}</Text>
        <Text style={[styles.status, statusStyle]}>
          {displayStatusLabel(request.status, request.cancelledByApplicant)}
        </Text>
      </View>

      {applicant && (
        <>
          <Text style={styles.clientName}>{applicant.name}</Text>
          <Text style={styles.clientLabel}>{applicant.email}</Text>
          <View style={styles.divider} />
        </>
      )}

      <Text style={styles.detailLabel}>Propiedad solicitada</Text>
      <Text style={styles.detailText}>{propertyTitle}</Text>

      <Text style={styles.detailLabel}>Teléfono de contacto</Text>
      <Text style={styles.detailText}>{request.telefono}</Text>

      <Text style={styles.detailLabel}>Fecha de registro</Text>
      <Text style={styles.detailText}>{formattedDate}</Text>

      {request.status === 'PENDING' && request.posicionListaEspera != null && (
        <>
          <Text style={styles.detailLabel}>Lista de espera</Text>
          <Text style={styles.waitlistText}>
            Lugar #{request.posicionListaEspera}
          </Text>
        </>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  requestCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  requestNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C7B5FF',
  },
  status: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pending: {
    color: '#FCD34D',
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  approved: {
    color: '#86EFAC',
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  rejected: {
    color: '#FCA5A5',
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  cancelled: {
    color: '#D0C6E5',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clientLabel: {
    fontSize: 12,
    color: '#C8C2D2',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginVertical: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#C8C2D2',
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  waitlistText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#93C5FD',
    marginTop: 2,
  },
});
