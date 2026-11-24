import { RequestResponseDto } from './request-response.dto';

/** Respuesta de GET /requests (solo ADMIN). */
export interface AdminRequestResponseDto extends RequestResponseDto {
  applicant: {
    id: string;
    name: string;
    lastname: string;
    email: string;
  };
  property: { id: string; title: string; status: string };
}
