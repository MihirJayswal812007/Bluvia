/**
 * BLUVIA — Products Page
 * Fetches products from Express/MySQL backend.
 */

import { getProducts } from '../api.js';
import { formatPrice, isMobile } from '../utils/format.js';
import { addToCart } from '../utils/cart.js';
import { showToast } from '../utils/toast.js';

const BOTTLE_CLASSES = ['bottle-5', 'bottle-10', 'bottle-20'];

export function render() {
  return `
    <section id="products" aria-labelledby="products-title">
      <div class="section-header">
        <div class="section-label">Our Products</div>
        <h1 class="section-title" id="products-title">Pure Water,<br>Every Drop</h1>
        <p class="section-sub">Three sizes. One promise — consistently pure, premium-quality packaged water.</p>
      </div>
      <div class="products-grid" id="products-grid">
        ${_skeletonCards()}
      </div>
    </section>
  `;
}

export async function init() {
  await _loadProducts();
  if (!isMobile()) _initTilt();
  _initScrollReveal();
}

async function _loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    const { products } = await getProducts();

    if (!products?.length) {
      grid.innerHTML = `<p style="color:var(--c-muted);text-align:center;grid-column:1/-1;">No products available.</p>`;
      return;
    }

    // stock_quantity comes directly from the API join
    const enriched = products.map(p => ({
      ...p,
      inventory: [{ stock_quantity: p.stock_quantity ?? 0 }],
    }));

    grid.innerHTML = enriched.map((p, i) => _cardHTML(p, i)).join('');

    requestAnimationFrame(() => {
      document.querySelectorAll('.product-card').forEach(card => {
        const water = card.querySelector('.cb-water');
        if (water) setTimeout(() => { water.style.height = card.dataset.fill || '72%'; }, 400 + parseInt(card.dataset.index || 0) * 150);
      });
    });
  } catch (err) {
    console.error('[Products] Load error:', err);
    grid.innerHTML = `<p style="color:var(--c-muted);text-align:center;grid-column:1/-1;">⚠️ Backend offline. Run: <code>cd server && npm run dev</code></p>`;
  }
}

function _cardHTML(product, index) {
  const bottleClass = BOTTLE_CLASSES[index] || 'bottle-5';
  const fills = ['65%', '72%', '80%'];
  const specs = Array.isArray(product.specs) ? product.specs : JSON.parse(product.specs || '[]');
  const stock = product.inventory?.[0]?.stock_quantity ?? 0;

  return `
    <article class="product-card" data-fill="${fills[index]}" data-index="${index}" data-id="${product.id}" aria-label="${product.name}">
      <div class="price-badge" aria-label="Price ${formatPrice(product.price_paise)}">${formatPrice(product.price_paise)}</div>
      <div class="card-bottle-wrap">
        <div class="card-bottle ${bottleClass}" aria-hidden="true">
          <div class="cb-cap"></div><div class="cb-neck"></div>
          <div class="cb-body"><div class="cb-water"></div></div>
        </div>
      </div>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-desc">${product.description || ''}</p>
      <div class="product-specs">
        ${specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
      </div>
      <button class="product-add-btn" data-product-id="${product.id}" ${stock <= 0 ? 'disabled style="opacity:.5"' : ''}>
        ${stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </article>
  `;
}

function _skeletonCards() {
  return Array(3).fill(0).map(() => `
    <div class="product-card" style="min-height:480px;">
      <div class="skeleton" style="height:18px;width:60px;position:absolute;top:-9px;right:20px;border-radius:40px;"></div>
      <div class="skeleton" style="height:200px;margin-bottom:1.5rem;border-radius:12px;"></div>
      <div class="skeleton" style="height:22px;width:60%;margin-bottom:.75rem;"></div>
      <div class="skeleton" style="height:14px;width:90%;margin-bottom:.5rem;"></div>
      <div class="skeleton" style="height:14px;width:70%;margin-bottom:1.5rem;"></div>
      <div style="display:flex;gap:.5rem;">
        <div class="skeleton" style="height:28px;width:60px;border-radius:20px;"></div>
        <div class="skeleton" style="height:28px;width:60px;border-radius:20px;"></div>
      </div>
    </div>
  `).join('');
}

function _initScrollReveal() {
  if (typeof gsap === 'undefined') return;
  gsap.set('.product-card', { y: 60, scale: .9, opacity: 0 });
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.batch('.product-card', {
      start: 'top 85%',
      onEnter: batch => {
        gsap.to(batch, { opacity: 1, y: 0, scale: 1, stagger: .18, duration: .9, ease: 'power3.out', clearProps: 'will-change' });
      },
    });
  } else {
    gsap.to('.product-card', { opacity: 1, y: 0, scale: 1, stagger: .18, duration: .9, ease: 'power3.out' });
  }
}

function _initTilt() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.product-add-btn');
    if (!btn || btn.disabled) return;
    const card = btn.closest('.product-card');
    const productId = card?.dataset.id;
    if (!productId) return;

    // Read from DOM since we don't store products in memory
    const name = card.querySelector('.product-name')?.textContent;
    const priceText = card.querySelector('.price-badge')?.textContent?.replace('₹', '');
    const price_paise = Math.round(parseFloat(priceText || '0') * 100);

    addToCart({ id: productId, name, price_paise }, 1);
    showToast(`${name} added to cart`, 'success');
  });

  document.querySelectorAll('.product-card').forEach(el => {
    let targetRX = 0, targetRY = 0, currRX = 0, currRY = 0, rafPending = false;
    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      currRX = lerp(currRX, targetRX, .1); currRY = lerp(currRY, targetRY, .1);
      el.style.transform = `perspective(1000px) rotateX(${currRX}deg) rotateY(${currRY}deg) scale(1.025)`;
      if (Math.abs(currRX - targetRX) > .01 || Math.abs(currRY - targetRY) > .01) requestAnimationFrame(loop);
      else { rafPending = false; el.style.transform = ''; }
    };
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      targetRY = ((e.clientX - r.left - r.width / 2) / r.width) * 10;
      targetRX = -((e.clientY - r.top - r.height / 2) / r.height) * 7;
      if (!rafPending) { rafPending = true; requestAnimationFrame(loop); }
    });
    el.addEventListener('mouseleave', () => { targetRX = 0; targetRY = 0; });
  });
}
