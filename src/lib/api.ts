// API helper functions for authentication

const API_BASE = '/api/auth';

export interface RegisterData {
  username: string;
  phone: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    phone: string;
    role?: string;
  };
  error?: string;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Registration failed' };
    }

    return result;
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Login failed' };
    }

    // Save token to localStorage
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error' };
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser(): { id: string; username: string; phone: string; role?: string } | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Verify token with server
export async function verifyTokenWithServer(): Promise<boolean> {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expired or invalid, try to refresh
      const refreshed = await refreshToken();
      return refreshed;
    }

    const result = await response.json();
    return result.success === true && result.valid === true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// Refresh token
export async function refreshToken(): Promise<boolean> {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      // Refresh failed, clear token and redirect to login
      logout();
      return false;
    }

    const result = await response.json();
    if (result.success && result.token) {
      // Save new token
      localStorage.setItem('token', result.token);
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    logout();
    return false;
  }
}

// Auto-refresh token before expiration
export async function ensureAuthenticated(): Promise<boolean> {
  const token = getToken();
  if (!token) {
    return false;
  }

  // Check if token is valid
  const isValid = await verifyTokenWithServer();
  if (isValid) {
    return true;
  }

  // Try to refresh
  return await refreshToken();
}

