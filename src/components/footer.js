/**
 * BLUVIA — Footer Component
 */

export function renderFooter() {
    const mount = document.getElementById('footer-mount');
    if (!mount) return;

    mount.innerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <span class="footer-logo" aria-label="BLUVIA">BLUVIA</span>

        <ul class="footer-links" role="list">
          <li><a href="/products" data-nav-link>Products</a></li>
          <li><a href="/features" data-nav-link>Features</a></li>
          <li><a href="/about" data-nav-link>About</a></li>
          <li><a href="/contact" data-nav-link>Contact</a></li>
        </ul>

        <span class="footer-copy">© ${new Date().getFullYear()} Bluvia. All rights reserved.</span>
      </div>
    </footer>
  `;
}
