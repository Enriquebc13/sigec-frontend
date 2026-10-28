// const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
// const TIMEOUT_MS = 10000;

// let authToken: string | null = __DEV__
//   ? (process.env.EXPO_PUBLIC_TOKEN_ADMIN ?? null)
//   : null;

// export function setAuthToken(token: string | null) {
//   authToken = token;
// }

// export class ApiError extends Error {
//   constructor(
//     public status: number,
//     message: string,
//     public data?: unknown,
//   ) {
//     super(message);
//   }
// }

// export class NetworkError extends Error {
//   constructor() {
//     super('No se pudo conectar con el servidor. Revisa tu conexión');
//   }
// }

// export async function apiClient<T>(
//   path: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

//   let res: Response;
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