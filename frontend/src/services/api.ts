const API_URL = "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`);

    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  const signal = options?.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    signal,
  });

  if (!response.ok) {
    let body: unknown = null;

    try {
      body = await response.json();
    } catch {
      signal.throwIfAborted();
      // Ответ получен, но его тело не является JSON.
    }

    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return await response.json() as T;
}
