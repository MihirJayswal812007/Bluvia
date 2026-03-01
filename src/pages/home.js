/**
 * BLUVIA — Home Page
 * Preserves all existing 3D bottle, particles, GSAP animations.
 */

import { isMobile } from '../utils/format.js';

export function render() {
    return `
    <section id="hero" aria-label="Hero">
      <div class="hero-content">
        <h1 class="hero-brand" data-text="BLUVIA">BLUVIA</h1>
        <p class="hero-tagline">Pure Supply. Smart Distribution.</p>
        <div class="hero-btns">
          <a href="/signup" class="cta-btn">
            Get Started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/products" class="hero-btn-ghost">View Products</a>
        </div>
      </div>

      <div class="bottle-scene" aria-hidden="true">
        <div class="glow-ring"></div><div class="glow-ring"></div><div class="glow-ring"></div>
        <div class="bottle-3d">
          <div class="b-cap"></div><div class="b-neck"></div>
          <div class="b-main"><div class="b-water"></div></div>
          <div class="b-base"></div>
        </div>
        <div class="bottle-reflection"></div>
      </div>

      <div class="scroll-indicator" aria-hidden="true">
        <div class="scroll-mouse"><div class="scroll-dot"></div></div>
        <span>Scroll</span>
      </div>
    </section>

    <section id="products-preview" style="padding:5rem 5%;background:linear-gradient(180deg,var(--c-bg),var(--c-deep));text-align:center;">
      <div class="section-header">
        <div class="section-label">Our Products</div>
        <h2 class="section-title">Three Sizes.<br>One Promise.</h2>
        <p class="section-sub">₹5 · ₹10 · ₹20 — consistently pure, premium quality packaged water.</p>
      </div>
      <a href="/products" class="cta-btn" style="margin-top:1rem;">Shop Now →</a>
    </section>

    <section id="features-preview" style="padding:5rem 5%;background:linear-gradient(180deg,var(--c-deep),#071020);text-align:center;">
      <div class="section-header">
        <div class="section-label">Why Bluvia</div>
        <h2 class="section-title">Smart Logistics.<br>Total Control.</h2>
        <p class="section-sub">From order to doorstep — manage your entire water distribution from one intelligent platform.</p>
      </div>
      <a href="/features" class="hero-btn-ghost" style="margin-top:1rem;">See Features →</a>
    </section>

    <section id="contact" aria-labelledby="contact-title">
      <div class="cta-content">
        <div class="section-label" style="margin-bottom:1.25rem;">Get Started</div>
        <h2 class="cta-title" id="contact-title">Ready to Transform<br>Your Distribution?</h2>
        <p class="cta-sub">Join hundreds of suppliers already using BLUVIA to streamline orders and grow their water business.</p>
        <a href="/signup" class="cta-btn" style="text-decoration:none;">
          Start Free Trial
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <div class="cta-info" role="list">
          <div class="cta-info-item" role="listitem"><div class="cta-info-num">500+</div><div class="cta-info-label">Active Suppliers</div></div>
          <div class="cta-info-item" role="listitem"><div class="cta-info-num">2M+</div><div class="cta-info-label">Bottles Tracked</div></div>
          <div class="cta-info-item" role="listitem"><div class="cta-info-num">99.9%</div><div class="cta-info-label">Uptime</div></div>
        </div>
      </div>
    </section>
  `;
}

export function init() {
    // Particle canvas
    _initParticles();
    // Water fill on hero bottle
    setTimeout(() => {
        const water = document.querySelector('#hero .b-water');
        if (water) water.style.height = '68%';
    }, 600);
    // GSAP scroll animations
    _initScrollAnimations();
    // Ripple on CTA
    _initRipple();
    // Floating droplets on contact section
    _spawnDroplets();

    return () => {
        // Cleanup: hide particle canvas when leaving home
        const canvas = document.getElementById('particle-canvas');
        if (canvas) canvas.style.display = 'none';
    };
}

function _initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || typeof THREE === 'undefined') return;
    canvas.style.display = 'block';

    if (canvas._bluviaRenderer) return; // already running

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas._bluviaRenderer = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 300;

    const COUNT = isMobile() ? 350 : 800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 800;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        velocities[i] = 0.05 + Math.random() * 0.15;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({ color: 0x00e5ff, size: isMobile() ? 1.4 : 1.8, transparent: true, opacity: 0.45, sizeAttenuation: true, depthWrite: false });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let mouseX = 0, mouseY = 0;
    if (!isMobile()) {
        document.addEventListener('mousemove', e => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 0.8;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 0.8;
        });
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        if (!canvas.isConnected) return;
        requestAnimationFrame(animate);
        const pos = geo.attributes.position;
        for (let i = 0; i < COUNT; i++) {
            pos.array[i * 3 + 1] += velocities[i];
            if (pos.array[i * 3 + 1] > 310) pos.array[i * 3 + 1] = -310;
        }
        pos.needsUpdate = true;
        points.rotation.y += 0.0004;
        if (!isMobile()) {
            camera.position.x += (mouseX * 20 - camera.position.x) * 0.03;
            camera.position.y += (-mouseY * 15 - camera.position.y) * 0.03;
        }
        renderer.render(scene, camera);
    }
    animate();
}

function _initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const bottleScene = document.querySelector('.bottle-scene');
    if (bottleScene) {
        bottleScene.classList.add('animating');
        gsap.to(bottleScene, { yPercent: -30, scale: .75, opacity: .4, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    gsap.to('.hero-content', { yPercent: 20, opacity: .6, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.utils.toArray('.section-header').forEach(el => {
        gsap.from(el, { opacity: 0, y: 35, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
}

function _initRipple() {
    document.querySelectorAll('.cta-btn').forEach(btn => {
        btn.addEventListener('pointerdown', e => {
            const rect = btn.getBoundingClientRect();
            const span = document.createElement('span');
            span.className = 'ripple-span';
            const size = Math.max(rect.width, rect.height);
            span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
            btn.appendChild(span);
            span.addEventListener('animationend', () => span.remove(), { once: true });
        });
    });
}

function _spawnDroplets() {
    if (isMobile()) return;
    const section = document.getElementById('contact');
    if (!section) return;
    for (let i = 0; i < 14; i++) {
        const d = document.createElement('div');
        d.className = 'droplet';
        const s = 20 + Math.random() * 50;
        d.style.cssText = `width:${s}px;height:${s * 1.25}px;left:${Math.random() * 100}%;bottom:${-s}px;animation-duration:${5 + Math.random() * 7}s;animation-delay:${Math.random() * 8}s;`;
        section.appendChild(d);
    }
}
