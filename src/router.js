/**
 * BLUVIA — History-mode SPA Router
 * Maps URL paths to page render functions.
 * Supports protected routes and admin-only routes.
 */

import { getSession, isAdmin } from './auth.js';

// Route registry: path → { render, guard }
const routes = {};
let currentCleanup = null; // cleanup fn from the previous page's init()

/**
 * Register a route.
 * @param {string} path - e.g. '/', '/products', '/dashboard'
 * @param {() => string} render - returns HTML string
 * @param {Function|null} init - post-render JS init (may return cleanup fn)
 * @param {'public'|'protected'|'admin'} guard
 */
export function registerRoute(path, render, init = null, guard = 'public') {
    routes[path] = { render, init, guard };
}

/**
 * Navigate to a path (programmatic).
 */
export function navigate(path) {
    window.history.pushState({}, '', path);
    renderRoute(path);
}

/**
 * Get current path.
 */
export function currentPath() {
    return window.location.pathname;
}

/**
 * Boot the router: listen for popstate + render current path.
 */
export function startRouter() {
    window.addEventListener('popstate', () => renderRoute(currentPath()));
    renderRoute(currentPath());
}

/**
 * Core render function.
 */
async function renderRoute(path) {
    const route = routes[path] || routes['/404'] || routes['/'];
    if (!route) return;

    // ── Guard checks ──
    if (route.guard === 'protected') {
        const session = await getSession();
        if (!session) {
            navigate('/login');
            return;
        }
    }
    if (route.guard === 'admin') {
        const session = await getSession();
        if (!session) { navigate('/login'); return; }
        const admin = await isAdmin();
        if (!admin) { navigate('/'); return; }
    }

    // ── Cleanup previous page ──
    if (typeof currentCleanup === 'function') {
        currentCleanup();
        currentCleanup = null;
    }

    // ── Render ──
    const content = document.getElementById('page-content');
    if (!content) return;
    content.innerHTML = route.render();

    // ── Init ──
    if (typeof route.init === 'function') {
        const cleanup = await route.init();
        if (typeof cleanup === 'function') currentCleanup = cleanup;
    }

    // ── Scroll to top ──
    window.scrollTo({ top: 0, behavior: 'instant' });

    // ── Sync navbar active state ──
    document.querySelectorAll('[data-nav-link]').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === path);
    });
}

/**
 * Intercept all <a> clicks that are same-origin — delegate to router.
 */
export function initLinkInterception() {
    document.body.addEventListener('click', e => {
        const anchor = e.target.closest('a[href]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        // Only intercept same-origin relative links, not external, not # hashes
        if (href.startsWith('/') && !href.startsWith('//')) {
            e.preventDefault();
            navigate(href);
        }
    });
}
