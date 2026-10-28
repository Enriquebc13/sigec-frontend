const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.70:3000';
const TIMEOUT_MS = 10000;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'No se pudo conectar con el servidor. Revisa tu conexión') {
    super(message);
    this.name = 'NetworkError';
  }
}

function getErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
  }

  if (status === 401) return 'Credenciales inválidas o sesión expirada';
  if (status === 403) return 'No tienes permisos para realizar esta acción';
  if (status === 404) return 'Recurso no encontrado';
  if (status >= 500) return 'Error interno del servidor';

  return `Error ${status}`;
}

function parseResponse(text: string): unknown {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = new Headers(options.headers);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    const baseUrl = API_URL.replace(/\/+$/, '');
    const url = `${baseUrl}${normalizedPath}`;
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const data = parseResponse(await response.text());

    if (!response.ok) {
      throw new ApiError(response.status, getErrorMessage(data, response.status), data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if ((error as { name?: string }).name === 'AbortError') {
      throw new NetworkError('El servidor tardó demasiado en responder (tiempo de espera agotado)');
    }
    throw new NetworkError();
  } finally {
    clearTimeout(timeout);
  }
}
