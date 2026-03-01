/**
 * BLUVIA — Login Page
 */

import { signIn } from '../auth.js';
import { navigate } from '../router.js';
import { showToast } from '../utils/toast.js';

export function render() {
    return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">BLUVIA</div>
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-sub">Sign in to your account</p>
        <form id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">Email</label>
            <input class="form-input" id="login-email" type="email" placeholder="you@example.com" autocomplete="email" required />
            <p class="form-error" id="email-error"></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input class="form-input" id="login-password" type="password" placeholder="••••••••" autocomplete="current-password" required />
            <p class="form-error" id="password-error"></p>
          </div>
          <button type="submit" class="cta-btn auth-submit" id="login-btn">Sign In</button>
        </form>
        <p class="auth-link">Don't have an account? <a href="/signup">Sign up free</a></p>
      </div>
    </div>
  `;
}

export function init() {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        // Validation
        let valid = true;
        if (!email) { _setError('email-error', 'Email is required'); valid = false; }
        if (!password) { _setError('password-error', 'Password is required'); valid = false; }
        if (!valid) return;

        btn.disabled = true;
        btn.textContent = 'Signing in…';
        try {
            await signIn(email, password);
            showToast('Welcome back!', 'success');
            navigate('/dashboard');
        } catch (err) {
            showToast(err.message || 'Login failed', 'error');
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });

    // Clear errors on input
    ['login-email', 'login-password'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            const errId = id === 'login-email' ? 'email-error' : 'password-error';
            _setError(errId, '');
        });
    });
}

function _setError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
}
