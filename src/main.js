/**
 * BLUVIA — App Entry Point
 * Registers all routes and boots the router.
 */

import './style.css';
import { registerRoute, startRouter, initLinkInterception } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { onAuthChange } from './auth.js';

// Pages
import { render as renderHome, init as initHome } from './pages/home.js';
import { render as renderProducts, init as initProducts } from './pages/products.js';
import { render as renderFeatures, init as initFeatures } from './pages/features.js';
import { render as renderAbout } from './pages/about.js';
import { render as renderContact, init as initContact } from './pages/contact.js';
import { render as renderLogin, init as initLogin } from './pages/login.js';
import { render as renderSignup, init as initSignup } from './pages/signup.js';
import { render as renderDashboard, init as initDashboard } from './pages/dashboard.js';
import { render as renderOrders, init as initOrders } from './pages/orders.js';
import { render as renderCheckout, init as initCheckout } from './pages/checkout.js';
import { render as renderAdmin, init as initAdmin } from './pages/admin.js';
import { render as render404 } from './pages/404.js';

// ── Register all routes ──────────────────────────────────
registerRoute('/', renderHome, initHome, 'public');
registerRoute('/products', renderProducts, initProducts, 'public');
registerRoute('/features', renderFeatures, initFeatures, 'public');
registerRoute('/about', renderAbout, null, 'public');
registerRoute('/contact', renderContact, initContact, 'public');
registerRoute('/login', renderLogin, initLogin, 'public');
registerRoute('/signup', renderSignup, initSignup, 'public');
registerRoute('/dashboard', renderDashboard, initDashboard, 'admin');
registerRoute('/orders', renderOrders, initOrders, 'protected');
registerRoute('/checkout', renderCheckout, initCheckout, 'protected');
registerRoute('/admin', renderAdmin, initAdmin, 'admin');
registerRoute('/404', render404, null, 'public');

// ── Init shared components ───────────────────────────────
try {
    await renderNavbar();
} catch (e) {
    console.warn('[Bluvia] Navbar init failed:', e.message);
}
renderFooter();

// ── Boot router ──────────────────────────────────────────
initLinkInterception();
startRouter();

// ── Re-render navbar on auth change ─────────────────────
onAuthChange(async () => {
    try {
        await renderNavbar();
    } catch { }
});
