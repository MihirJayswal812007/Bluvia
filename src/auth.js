/**
 * BLUVIA — Frontend Auth
 * Calls the PHP API (/api/auth) for authentication.
 * JWT token stored in localStorage for session persistence.
 */

const API = 'http://localhost:8000/api';
const TOKEN_KEY = 'bluvia_token';
const USER_KEY = 'bluvia_user';

const _listeners = new Set();

function _getToken() { return localStorage.getItem(TOKEN_KEY); }
function _getStoredUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}
function _saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    _listeners.forEach(cb => { try { cb('SIGNED_IN', user); } catch { } });
}
function _clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    _listeners.forEach(cb => { try { cb('SIGNED_OUT', null); } catch { } });
}

// ── Public API ────────────────────────────────────────────

export async function signUp(email, password, fullName) {
    const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    _saveSession(data.token, data.user);
    return data;
}

export async function signIn(email, password) {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    _saveSession(data.token, data.user);
    return data;
}

export async function signOut() {
    _clearSession();
}

export async function getUser() {
    return _getStoredUser();
}

export async function getSession() {
    return _getStoredUser();
}

export async function isAuthenticated() {
    return !!_getToken();
}

export async function isAdmin() {
    const user = _getStoredUser();
    return user?.role === 'admin';
}

export async function getProfile() {
    const token = _getToken();
    if (!token) return null;
    try {
        const res = await fetch(`${API}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) { _clearSession(); return null; }
        const data = await res.json();
        return data.user;
    } catch { return null; }
}

/** Get Authorization header for API calls */
export function getAuthHeader() {
    const token = _getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function onAuthChange(callback) {
    _listeners.add(callback);
    return { data: { subscription: { unsubscribe: () => _listeners.delete(callback) } } };
}
