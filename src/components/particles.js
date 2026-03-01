/**
 * BLUVIA — Three.js Particle Backdrop
 * Renders animated floating particles on the #particle-canvas.
 * Only active on the home page. Call destroy() on route change.
 */

let animationFrameId = null;
let renderer = null;
let isRunning = false;

/**
 * Initialize the particle backdrop on #particle-canvas.
 * Uses Three.js loaded via CDN in index.html.
 * @returns {Function} cleanup function to stop and dispose
 */
export function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || !window.THREE || isRunning) return () => { };

    const THREE = window.THREE;

    // ── Scene setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ── Particles ──
    const PARTICLE_COUNT = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 20;     // x
        positions[i3 + 1] = (Math.random() - 0.5) * 20; // y
        positions[i3 + 2] = (Math.random() - 0.5) * 10; // z

        velocities[i3] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 1] = Math.random() * 0.003 + 0.001; // slight upward drift
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;

        sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Cyan-tinted particle material
    const material = new THREE.PointsMaterial({
        color: 0x06e0f9,
        size: 2.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Mouse interaction ──
    let mouseX = 0, mouseY = 0;
    function onMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── Resize ──
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize, { passive: true });

    // ── Animation loop ──
    isRunning = true;
    canvas.style.display = 'block';

    function animate() {
        if (!isRunning) return;

        const pos = geometry.attributes.position.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            pos[i3] += velocities[i3];
            pos[i3 + 1] += velocities[i3 + 1];
            pos[i3 + 2] += velocities[i3 + 2];

            // Wrap around bounds
            if (pos[i3 + 1] > 10) pos[i3 + 1] = -10;
            if (pos[i3] > 10) pos[i3] = -10;
            if (pos[i3] < -10) pos[i3] = 10;
        }
        geometry.attributes.position.needsUpdate = true;

        // Subtle camera sway towards mouse
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        // Slow rotation
        points.rotation.y += 0.0003;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    // ── Cleanup function ──
    return function destroyParticles() {
        isRunning = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);

        geometry.dispose();
        material.dispose();
        if (renderer) {
            renderer.dispose();
            renderer = null;
        }

        if (canvas) canvas.style.display = 'none';
        animationFrameId = null;
    };
}
