const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const TIMEOUT_MS = 10000;

// Solo en desarrollo: token de prueba tomado del .env
let authToken: string | null = __DEV__
  ? (process.env.EXPO_PUBLIC_TOKEN_ADMIN ?? null)
  : null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// La API respondió con un error (401, 403, 404, 500...)
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
  }
}

// No se pudo llegar a la API (apagada, IP incorrecta, sin red o timeout)
export class NetworkError extends Error {
  constructor() {
    super(
      'No se pudo conectar con el servidor. Revisa tu conexión',
    );
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Crea un controlador para poder cancelar la petición si tarda demasiado.
  const controller = new AbortController();
   // Establece el tiempo máximo de espera para la petición.
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  // Realiza la petición al servidor utilizando la URL base y la ruta indicada.
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new NetworkError();
  } finally {
    clearTimeout(timeout);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `Error ${res.status}`, data);
  }

  return data as T;
}