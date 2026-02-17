/**
 * API client wrapper with fetch.
 * T023: Create API client wrapper
 * Handles API calls to FastAPI backend with proper error handling.
 *
 * Phase IV K8s Enhancement: Auto-detect backend URL for minikube service access
 */

/**
 * Get the API base URL with auto-detection support for Kubernetes deployments
 * - If NEXT_PUBLIC_API_URL is "auto" or empty, detect from window.location
 * - Otherwise use the provided URL or default to localhost:8000
 */
function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  // Auto-detection mode for Kubernetes (minikube service access)
  if (envUrl === 'auto' || envUrl === '' || !envUrl) {
    // Server-side rendering: use backend service name
    if (typeof window === 'undefined') {
      return 'http://backend-service:8000';
    }

    // Client-side: construct URL based on current host
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // If running on localhost (port-forward mode), use localhost:8000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }

    // For Minikube NodePort deployment: backend is at same hostname, port 30800
    return `${protocol}//${hostname}:30800`;
  }

  return envUrl;
}

const API_URL = getApiUrl();

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Get user ID from localStorage for authenticated requests
  let userId: string | null = null;
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id;
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add user ID header if user is logged in
  if (userId) {
    headers['X-User-Id'] = userId;
  }

  const { body, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers,
    credentials: 'include', // Include cookies for session management
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error or server unavailable');
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: Record<string, unknown>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: Record<string, unknown>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: Record<string, unknown>, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
