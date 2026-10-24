// const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
// const TIMEOUT_MS = 10000;

// // Solo en desarrollo: token de prueba tomado del .env
// let authToken: string | null = __DEV__
//   ? (process.env.EXPO_PUBLIC_TOKEN_ADMIN ?? null)
//   : null;

// export function setAuthToken(token: string | null) {
//   authToken = token;
// }

// // La API respondió con un error (401, 403, 404, 500...)
// export class ApiError extends Error {
//   constructor(
//     public status: number,
//     message: string,
//     public data?: unknown,
//   ) {
//     super(message);
//   }
// }

// // No se pudo llegar a la API (apagada, IP incorrecta, sin red o timeout)
// export class NetworkError extends Error {
//   constructor() {
//     super(
//       'No se pudo conectar con el servidor. Revisa tu conexión',
//     );
//   }
// }

// export async function apiClient<T>(
//   path: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   // Crea un controlador para poder cancelar la petición si tarda demasiado.
//   const controller = new AbortController();
//    // Establece el tiempo máximo de espera para la petición.
//   const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

//   let res: Response;
//   // Realiza la petición al servidor utilizando la URL base y la ruta indicada.
//   try {
//     res = await fetch(`${API_URL}${path}`, {
//       ...options,
//       signal: controller.signal,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
//         ...options.headers,
//       },
//     });
//   } catch {
//     throw new NetworkError();
//   } finally {
//     clearTimeout(timeout);
//   }

//   const data = await res.json().catch(() => null);

//   if (!res.ok) {
//     throw new ApiError(res.status, data?.message ?? `Error ${res.status}`, data);
//   }

//   return data as T;
// }
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const TIMEOUT_MS = 10000;

// Token de la sesión actual. Lo asigna ApiAuthProvider al iniciar sesión
// o al restaurar la sesión guardada.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// Función que se ejecuta cuando la API responde 401 (token vencido o inválido).
// ApiAuthProvider la usa para cerrar la sesión.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
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
    // Sesión vencida o token inválido: avisar para cerrar sesión.
    // Se excluye /auth/login porque ahí un 401 solo significa "credenciales incorrectas".
    if (res.status === 401 && authToken && !path.startsWith('/auth/login')) {
      onUnauthorized?.();
    }

    // El ValidationPipe de Nest devuelve message como arreglo; se unen en un solo texto.
    const message = Array.isArray(data?.message)
      ? data.message.join('\n')
      : (data?.message ?? `Error ${res.status}`);

    throw new ApiError(res.status, message, data);
  }

  return data as T;
}