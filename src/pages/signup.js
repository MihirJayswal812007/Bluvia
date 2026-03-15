/**
 * BLUVIA — Signup Page
 */

import { signUp } from '../auth.js';
import { navigate } from '../router.js';
import { showToast } from '../utils/toast.js';

export function render() {
    return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">BLUVIA</div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-sub">Start your free distribution management journey</p>
        <form id="signup-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="su-name">Full Name</label>
            <input class="form-input" id="su-name" type="text" placeholder="Ramesh Patel" autocomplete="name" required />
            <p class="form-error" id="su-name-err"></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="su-email">Email</label>
            <input class="form-input" id="su-email" type="email" placeholder="you@example.com" autocomplete="email" required />
            <p class="form-error" id="su-email-err"></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="su-pass">Password</label>
            <input class="form-input" id="su-pass" type="password" placeholder="Min 8 characters" autocomplete="new-password" required minlength="8" />
            <p class="form-error" id="su-pass-err"></p>
          </div>
          <div class="form-group">
            <label class="form-label" for="su-confirm">Confirm Password</label>
            <input class="form-input" id="su-confirm" type="password" placeholder="Repeat password" autocomplete="new-password" required />
            <p class="form-error" id="su-confirm-err"></p>
          </div>
          <button type="submit" class="cta-btn auth-submit" id="su-btn">Create Account</button>
        </form>
        <p class="auth-link">Already have an account? <a href="/login">Sign in</a></p>
        <p style="text-align:center;font-size:.78rem;color:var(--c-muted);margin-top:1rem;">
          You may receive a confirmation email. Check your inbox.
        </p>
      </div>
    </div>
  `;
}

export async function init() {
    import('../auth.js').then(async ({ isAuthenticated, getUser }) => {
        if (await isAuthenticated()) {
            const user = await getUser();
            navigate(user?.role === 'admin' ? '/dashboard' : '/orders');
        }
    });

    const form = document.getElementById('signup-form');
    form?.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('su-name').value.trim();
        const email = document.getElementById('su-email').value.trim();
        const pass = document.getElementById('su-pass').value;
        const confirm = document.getElementById('su-confirm').value;
        const btn = document.getElementById('su-btn');

        let valid = true;
        if (!name) { _err('su-name-err', 'Name is required'); valid = false; }
        if (!email) { _err('su-email-err', 'Email is required'); valid = false; }
        if (pass.length < 8) { _err('su-pass-err', 'Password must be at least 8 characters'); valid = false; }
        if (pass !== confirm) { _err('su-confirm-err', 'Passwords do not match'); valid = false; }
        if (!valid) return;

        btn.disabled = true; btn.textContent = 'Creating account…';
        try {
            const data = await signUp(email, pass, name);
            showToast('Account created successfully!', 'success');
            navigate(data.user?.role === 'admin' ? '/dashboard' : '/orders');
        } catch (err) {
            showToast(err.message || 'Signup failed', 'error');
            btn.disabled = false; btn.textContent = 'Create Account';
        }
    });
}

function _err(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
}
