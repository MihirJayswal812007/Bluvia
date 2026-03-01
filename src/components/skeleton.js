/**
 * BLUVIA — Skeleton Loading Components
 * Displays shimmer-animated placeholders while data loads.
 * Usage: document.getElementById('x').innerHTML = renderSkeleton('card', 3);
 */

// Inject skeleton CSS once
let stylesInjected = false;
function injectSkeletonStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes skeleton-shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }
        .skeleton {
            background: linear-gradient(
                90deg,
                rgba(6, 224, 249, 0.04) 25%,
                rgba(6, 224, 249, 0.08) 37%,
                rgba(6, 224, 249, 0.04) 63%
            );
            background-size: 800px 100%;
            animation: skeleton-shimmer 1.6s ease-in-out infinite;
            border-radius: 0.5rem;
        }
        .skeleton-text {
            height: 1rem;
            margin-bottom: 0.5rem;
            border-radius: 0.25rem;
        }
        .skeleton-title {
            height: 1.5rem;
            width: 60%;
            margin-bottom: 0.75rem;
            border-radius: 0.25rem;
        }
        .skeleton-card {
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid rgba(6, 224, 249, 0.08);
            background: rgba(255, 255, 255, 0.02);
        }
        .skeleton-avatar {
            width: 3rem;
            height: 3rem;
            border-radius: 9999px;
        }
        .skeleton-btn {
            height: 2.5rem;
            width: 8rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
        }
        .skeleton-image {
            width: 100%;
            aspect-ratio: 16/9;
            border-radius: 0.75rem;
            margin-bottom: 1rem;
        }
        .skeleton-row {
            display: flex;
            gap: 1rem;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Render skeleton placeholder HTML.
 * @param {'card'|'table'|'text'|'product'|'order'} type 
 * @param {number} count — number of skeleton items
 * @returns {string} HTML string
 */
export function renderSkeleton(type = 'card', count = 3) {
    injectSkeletonStyles();

    const generators = {
        card: () => `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="width:80%"></div>
                <div class="skeleton skeleton-text" style="width:55%"></div>
                <div class="skeleton skeleton-btn"></div>
            </div>`,
        product: () => `
            <div class="skeleton-card" style="text-align:center">
                <div class="skeleton" style="width:120px;height:180px;margin:0 auto 1rem;border-radius:0.75rem"></div>
                <div class="skeleton skeleton-title" style="width:70%;margin:0 auto 0.5rem"></div>
                <div class="skeleton skeleton-text" style="width:40%;margin:0 auto 0.75rem"></div>
                <div class="skeleton skeleton-btn" style="margin:0.75rem auto 0"></div>
            </div>`,
        table: () => `
            <div class="skeleton-row">
                <div class="skeleton skeleton-avatar"></div>
                <div style="flex:1">
                    <div class="skeleton skeleton-text" style="width:60%"></div>
                    <div class="skeleton skeleton-text" style="width:30%;height:0.75rem"></div>
                </div>
                <div class="skeleton" style="width:4rem;height:1.5rem;border-radius:9999px"></div>
            </div>`,
        text: () => `
            <div style="margin-bottom:1.5rem">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="width:95%"></div>
                <div class="skeleton skeleton-text" style="width:80%"></div>
                <div class="skeleton skeleton-text" style="width:88%"></div>
            </div>`,
        order: () => `
            <div class="skeleton-card" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem">
                <div class="skeleton" style="width:2.5rem;height:2.5rem;border-radius:0.5rem"></div>
                <div style="flex:1">
                    <div class="skeleton skeleton-text" style="width:45%"></div>
                    <div class="skeleton skeleton-text" style="width:25%;height:0.75rem"></div>
                </div>
                <div class="skeleton" style="width:5rem;height:1.5rem;border-radius:9999px"></div>
                <div class="skeleton" style="width:4rem;height:1.25rem"></div>
            </div>`,
    };

    const gen = generators[type] || generators.card;
    return Array.from({ length: count }, gen).join('\n');
}
