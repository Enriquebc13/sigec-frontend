export interface RequestResponseDto {
    id: string;
    telefono: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    user?: {
      id: string;
      name?: string;
      lastname?: string;
      fullName?: string;
    } | string;
    property?: {
      id: string;
      name?: string;
      title?: string;
    } | string;
    history?: string[];
  }
  