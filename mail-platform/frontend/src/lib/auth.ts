const TOKEN_KEY = 'mail_platform_session_token';
const USER_KEY = 'mail_platform_user_email';

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getSessionToken();
}

export function saveSession(token: string, email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, email);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      return { success: false, error: err.detail || 'Authentication failed' };
    }

    const data = await res.json();
    saveSession(data.access_token, data.user_email || email);
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to connect to authentication server.' };
  }
}
