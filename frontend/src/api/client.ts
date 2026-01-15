const API_BASE_URL = '/api';

// Token management utilities
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Don't redirect for auth endpoints (login/register) - let them handle errors
    const isAuthEndpoint = endpoint.startsWith('/auth/');
    
    if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
      removeAuthToken();
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired'));
    }
    throw new Error(data.error);
  }

  return data;
}
