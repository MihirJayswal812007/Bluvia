/**
 * BLUVIA — Navbar Component
 * Renders the persistent navbar and wires up:
 *   - Mobile hamburger drawer
 *   - Active link sync on route change
 *   - Cart count badge
 *   - Auth-aware links (Login vs Dashboard/Logout)
 */

import { navigate, currentPath } from '../router.js';
import { getUser, signOut, isAdmin } from '../auth.js';
import { getCartCount } from '../utils/cart.js';
import { showToast } from '../utils/toast.js';

let _navEventsBound = false;

export async function renderNavbar() {
    const mount = document.getElementById('navbar-mount');
    if (!mount) return;

    const user = await getUser();
    const adminUser = user ? await isAdmin() : false;
    const cartCount = getCartCount();
    const path = currentPath();

    const links = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/features', label: 'Features' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    const authLinks = user
        ? [
            ...(adminUser ? [{ href: '/admin', label: 'Admin', admin: true }] : []),
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/orders', label: 'Orders' },
            { href: '#logout', label: 'Logout', id: 'nav-logout' },
        ]
        : [
            { href: '/login', label: 'Login' },
            { href: '/signup', label: 'Get Started', cta: true },
        ];

    const allLinks = [...links, ...authLinks];

    mount.innerHTML = `
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <a href="/" class="nav-logo" data-nav-link aria-label="BLUVIA Home">BLUVIA</a>

      <ul class="nav-links" id="nav-links-list">
        ${links.map(l => `
          <li>
            <a href="${l.href}" class="nav-link${path === l.href ? ' active' : ''}" data-nav-link>
              ${l.label}
            </a>
          </li>
        `).join('')}

        ${authLinks.map(l => `
          <li>
            <a href="${l.href}"
               class="nav-link${l.cta ? ' nav-cta' : ''}${l.admin ? ' nav-admin' : ''}${path === l.href ? ' active' : ''}"
               ${l.id ? `id="${l.id}"` : ''}
               data-nav-link>
              ${l.label}
            </a>
          </li>
        `).join('')}

        ${cartCount > 0 ? `
          <li>
            <a href="/checkout" class="nav-link nav-cart${path === '/checkout' ? ' active' : ''}" data-nav-link>
              🛒 <span class="cart-badge">${cartCount}</span>
            </a>
          </li>
        ` : ''}
      </ul>

      <!-- Hamburger button -->
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-mobile-drawer">
        <span></span><span></span><span></span>
      </button>

      <!-- Mobile drawer -->
      <div class="nav-mobile-drawer" id="nav-mobile-drawer" aria-hidden="true">
        <div class="drawer-inner">
          ${allLinks.map(l => `
            <a href="${l.href}"
               class="drawer-link${l.cta ? ' drawer-cta' : ''}${path === l.href ? ' active' : ''}"
               ${l.id ? `id="drawer-${l.id}"` : ''}
               data-nav-link>
              ${l.label}
            </a>
          `).join('')}
          ${cartCount > 0 ? `<a href="/checkout" class="drawer-link" data-nav-link>🛒 Cart (${cartCount})</a>` : ''}
        </div>
      </div>
    </nav>
  `;

    _bindNavEvents();
}

function _bindNavEvents() {
    // Hamburger toggle
    const hamburger = document.getElementById('nav-hamburger');
    const drawer = document.getElementById('nav-mobile-drawer');
    hamburger?.addEventListener('click', () => {
        const open = drawer.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open);
        drawer.setAttribute('aria-hidden', !open);
        hamburger.classList.toggle('open', open);
        document.body.classList.toggle('drawer-open', open);
    });

    // Close drawer on link click
    drawer?.querySelectorAll('[data-nav-link]').forEach(link => {
        link.addEventListener('click', () => {
            drawer.classList.remove('open');
            hamburger?.setAttribute('aria-expanded', false);
            drawer.setAttribute('aria-hidden', true);
            hamburger?.classList.remove('open');
            document.body.classList.remove('drawer-open');
        });
    });

    // Logout
    document.getElementById('nav-logout')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut();
            showToast('Logged out successfully', 'success');
            navigate('/');
        } catch {
            showToast('Logout failed', 'error');
        }
    });

    if (!_navEventsBound) {
        _navEventsBound = true;
        const onScroll = () => {
            const nav = document.querySelector('.navbar');
            nav?.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // Cart badge update listener
        window.addEventListener('bluvia:cart-updated', () => renderNavbar());
    }
}

/**
 * Update active link without full re-render.
 */
export function syncNavActive(path) {
    document.querySelectorAll('[data-nav-link]').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === path);
    });
}
