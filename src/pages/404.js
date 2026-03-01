/**
 * BLUVIA — 404 Page
 */

export function render() {
    return `
    <section class="page-404">
      <div class="page-404-content">
        <div class="page-404-code">404</div>
        <h1 class="page-404-title">Page Not Found</h1>
        <p class="page-404-sub">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" class="cta-btn" style="text-decoration:none; display:inline-flex; align-items:center; gap:.5rem; margin-top:2rem;">
          ← Back to Home
        </a>
      </div>
    </section>
  `;
}
