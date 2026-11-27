import { Property } from '../../domain/entities/property.entity';

export type PropertyStatusFilter =
  | 'ALL'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'UNAVAILABLE';

export type PropertyTypeFilter = 'ALL' | 'LOCAL' | 'OFFICE' | 'WAREHOUSE';

export const STATUS_FILTER_OPTIONS: { label: string; value: PropertyStatusFilter }[] = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Disponibles', value: 'AVAILABLE' },
  { label: 'Reservadas', value: 'RESERVED' },
  { label: 'Rentadas', value: 'RENTED' },
  { label: 'No disponibles', value: 'UNAVAILABLE' },
];

export const TYPE_FILTER_OPTIONS: { label: string; value: PropertyTypeFilter }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Locales', value: 'LOCAL' },
  { label: 'Oficinas', value: 'OFFICE' },
  { label: 'Bodegas', value: 'WAREHOUSE' },
];

export const matchesStatusFilter = (
  property: Pick<Property, 'status'>,
  filter: PropertyStatusFilter,
) => filter === 'ALL' || property.status === filter;

export const matchesTypeFilter = (
  property: Pick<Property, 'type'>,
  filter: PropertyTypeFilter,
) => filter === 'ALL' || property.type === filter;
