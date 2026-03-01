/**
 * BLUVIA — Features Page
 */

export function render() {
    return `
    <section id="features" aria-labelledby="features-title">
      <div class="section-header">
        <div class="section-label">System Features</div>
        <h1 class="section-title" id="features-title">Smart Logistics.<br>Total Control.</h1>
        <p class="section-sub">Everything you need to run a water distribution business — from one intelligent dashboard.</p>
      </div>
      <div class="features-grid">
        <svg class="connector-svg" aria-hidden="true">
          <line class="connector-line" x1="10%" y1="30px" x2="30%" y2="30px"/>
          <line class="connector-line" x1="30%" y1="30px" x2="50%" y2="30px"/>
          <line class="connector-line" x1="50%" y1="30px" x2="70%" y2="30px"/>
          <line class="connector-line" x1="70%" y1="30px" x2="90%" y2="30px"/>
        </svg>
        ${_featurePanels()}
      </div>
    </section>
  `;
}

export function init() {
    if (typeof gsap === 'undefined') return;
    gsap.set('.feature-panel', { y: 50, opacity: 0 });
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.batch('.feature-panel', {
            start: 'top 88%',
            onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: .14, duration: .85, ease: 'power2.out', clearProps: 'will-change' }),
        });
    } else {
        gsap.to('.feature-panel', { opacity: 1, y: 0, stagger: .14, duration: .85, ease: 'power2.out' });
    }
}

function _featurePanels() {
    const panels = [
        { icon: '👥', title: 'Customer Management', desc: 'Maintain a complete database of customers, contacts, delivery preferences and purchase history.' },
        { icon: '📦', title: 'Order Tracking', desc: 'Real-time order status from placement to delivery — track every bottle, every route, every stop.' },
        { icon: '🗓️', title: 'Delivery Scheduling', desc: 'Automated scheduling with route optimisation, driver assignment and time-window management.' },
        { icon: '💳', title: 'Payment Records', desc: 'Full payment ledger with UPI, cash, and credit tracking. Auto-reconciliation with order history.' },
        { icon: '📊', title: 'Stock Management', desc: 'Live inventory meters per SKU. Low-stock alerts and reorder triggers keep supply uninterrupted.' },
    ];
    return panels.map((p, i) => `
    <article class="feature-panel" id="fp-${i + 1}" aria-label="${p.title}">
      <div class="fp-icon" aria-hidden="true">${p.icon}</div>
      <h3 class="fp-title">${p.title}</h3>
      <p class="fp-desc">${p.desc}</p>
      <div class="fp-glow"></div>
    </article>
  `).join('');
}
