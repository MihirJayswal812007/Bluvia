/**
 * BLUVIA — Contact Page
 * Premium dark glassmorphism design, fully vanilla CSS inline styles.
 */

import { showToast } from '../utils/toast.js';

const GLASS = 'background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);';
const GLOW_GLASS = GLASS + 'box-shadow:0 0 30px rgba(6,224,249,0.08);';
const INPUT_STYLE = 'width:100%;background:rgba(15,23,42,0.6);border:1px solid rgba(100,116,139,0.3);border-radius:12px;padding:14px 18px;color:#e2e8f0;font-size:0.95rem;outline:none;transition:border-color 0.3s,box-shadow 0.3s;';
const INPUT_FOCUS = 'border-color:var(--c-accent);box-shadow:0 0 0 3px rgba(6,224,249,0.15);';

export function render() {
  return `
  <div style="padding:80px 24px 100px;max-width:1200px;margin:0 auto;">

    <!-- Hero -->
    <div style="text-align:center;margin-bottom:64px;">
      <div style="display:inline-block;background:rgba(6,224,249,0.08);border:1px solid rgba(6,224,249,0.2);border-radius:40px;padding:6px 20px;font-size:0.8rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--c-accent);margin-bottom:24px;">
        Contact Us
      </div>
      <h1 style="font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;line-height:1.1;margin-bottom:20px;">
        <span style="background:linear-gradient(135deg,#fff 0%,var(--c-accent) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Get in Touch</span>
      </h1>
      <p style="color:#94a3b8;max-width:600px;margin:0 auto;font-size:1.1rem;line-height:1.7;">
        Experience the future of hydration with Bluvia's premium water solutions. Our dedicated team is here to support your journey.
      </p>
    </div>

    <!-- Quick Contact Cards -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-bottom:64px;">
      <div style="${GLASS}border-radius:16px;padding:36px 28px;text-align:center;transition:transform 0.3s,border-color 0.3s;cursor:pointer;" onmouseenter="this.style.transform='translateY(-4px)';this.style.borderColor='rgba(6,224,249,0.3)'" onmouseleave="this.style.transform='';this.style.borderColor='rgba(255,255,255,0.08)'">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(6,224,249,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
          <span style="font-size:28px;color:var(--c-accent);">💼</span>
        </div>
        <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:8px;color:#f1f5f9;">Sales Inquiries</h3>
        <p style="color:#64748b;font-size:0.9rem;margin-bottom:12px;">For business orders and bulk supply inquiries.</p>
        <a href="mailto:sales@bluvia.in" style="color:var(--c-accent);font-weight:600;text-decoration:none;font-size:0.95rem;">sales@bluvia.in</a>
      </div>
      <div style="${GLASS}border-radius:16px;padding:36px 28px;text-align:center;transition:transform 0.3s,border-color 0.3s;cursor:pointer;" onmouseenter="this.style.transform='translateY(-4px)';this.style.borderColor='rgba(6,224,249,0.3)'" onmouseleave="this.style.transform='';this.style.borderColor='rgba(255,255,255,0.08)'">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(6,224,249,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
          <span style="font-size:28px;color:var(--c-accent);">🛟</span>
        </div>
        <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:8px;color:#f1f5f9;">Technical Support</h3>
        <p style="color:#64748b;font-size:0.9rem;margin-bottom:12px;">Facing issues? Our tech team is ready to help 24/7.</p>
        <a href="mailto:support@bluvia.in" style="color:var(--c-accent);font-weight:600;text-decoration:none;font-size:0.95rem;">support@bluvia.in</a>
      </div>
      <div style="${GLASS}border-radius:16px;padding:36px 28px;text-align:center;transition:transform 0.3s,border-color 0.3s;cursor:pointer;" onmouseenter="this.style.transform='translateY(-4px)';this.style.borderColor='rgba(6,224,249,0.3)'" onmouseleave="this.style.transform='';this.style.borderColor='rgba(255,255,255,0.08)'">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(6,224,249,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
          <span style="font-size:28px;color:var(--c-accent);">🤝</span>
        </div>
        <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:8px;color:#f1f5f9;">Partnership</h3>
        <p style="color:#64748b;font-size:0.9rem;margin-bottom:12px;">Collaborate with us for sustainable water solutions.</p>
        <a href="mailto:partners@bluvia.in" style="color:var(--c-accent);font-weight:600;text-decoration:none;font-size:0.95rem;">partners@bluvia.in</a>
      </div>
    </div>

    <!-- Main Grid: Form + Info Side-by-Side -->
    <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:32px;" id="contact-grid">

      <!-- Contact Form -->
      <div style="${GLOW_GLASS}border-radius:24px;padding:48px 40px;">
        <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:8px;color:#f1f5f9;display:flex;align-items:center;gap:12px;">
          <span style="color:var(--c-accent);font-size:1.4rem;">✉️</span> Send us a Message
        </h2>
        <p style="color:#64748b;font-size:0.9rem;margin-bottom:32px;">We'll get back to you within 24 business hours.</p>
        <form id="contact-form" novalidate>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
            <div>
              <label style="display:block;font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:6px;margin-left:4px;">Full Name</label>
              <input id="c-name" name="name" style="${INPUT_STYLE}" placeholder="John Doe" type="text" required autocomplete="name"
                onfocus="this.style.borderColor='var(--c-accent)';this.style.boxShadow='0 0 0 3px rgba(6,224,249,0.15)'"
                onblur="this.style.borderColor='rgba(100,116,139,0.3)';this.style.boxShadow='none'"/>
            </div>
            <div>
              <label style="display:block;font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:6px;margin-left:4px;">Email Address</label>
              <input id="c-email" name="email" style="${INPUT_STYLE}" placeholder="john@company.com" type="email" required autocomplete="email"
                onfocus="this.style.borderColor='var(--c-accent)';this.style.boxShadow='0 0 0 3px rgba(6,224,249,0.15)'"
                onblur="this.style.borderColor='rgba(100,116,139,0.3)';this.style.boxShadow='none'"/>
            </div>
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:6px;margin-left:4px;">Company (Optional)</label>
            <input name="company" style="${INPUT_STYLE}" placeholder="Acme Inc." type="text"
              onfocus="this.style.borderColor='var(--c-accent)';this.style.boxShadow='0 0 0 3px rgba(6,224,249,0.15)'"
              onblur="this.style.borderColor='rgba(100,116,139,0.3)';this.style.boxShadow='none'"/>
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:6px;margin-left:4px;">Subject</label>
            <input name="subject" style="${INPUT_STYLE}" placeholder="e.g. Bulk order inquiry for 1000 bottles" type="text"
              onfocus="this.style.borderColor='var(--c-accent)';this.style.boxShadow='0 0 0 3px rgba(6,224,249,0.15)'"
              onblur="this.style.borderColor='rgba(100,116,139,0.3)';this.style.boxShadow='none'"/>
          </div>
          <div style="margin-bottom:28px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:6px;margin-left:4px;">Message</label>
            <textarea id="c-message" name="message" style="${INPUT_STYLE}resize:vertical;min-height:140px;" placeholder="Tell us how we can help you..." rows="6" required
              onfocus="this.style.borderColor='var(--c-accent)';this.style.boxShadow='0 0 0 3px rgba(6,224,249,0.15)'"
              onblur="this.style.borderColor='rgba(100,116,139,0.3)';this.style.boxShadow='none'"></textarea>
          </div>
          <button type="submit" id="contact-submit" style="width:100%;background:linear-gradient(135deg,var(--c-accent),#00b4d8);color:var(--c-bg);font-weight:800;font-size:1.05rem;padding:16px;border:none;border-radius:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 25px rgba(6,224,249,0.25);transition:transform 0.2s,box-shadow 0.2s;" onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 35px rgba(6,224,249,0.35)'" onmouseleave="this.style.transform='';this.style.boxShadow='0 8px 25px rgba(6,224,249,0.25)'">
            <span id="contact-btn-text">Send Message</span>
            <span style="font-size:1.2rem;">➤</span>
          </button>
        </form>
      </div>

      <!-- Contact Info Sidebar -->
      <div style="display:flex;flex-direction:column;gap:24px;">

        <!-- Info Card -->
        <div style="${GLASS}border-radius:24px;padding:36px 32px;">
          <h3 style="font-size:1.3rem;font-weight:800;color:var(--c-accent);margin-bottom:28px;letter-spacing:0.5px;">Contact Information</h3>
          <div style="display:flex;flex-direction:column;gap:28px;">
            <div style="display:flex;gap:16px;align-items:flex-start;">
              <div style="width:44px;height:44px;border-radius:12px;background:rgba(6,224,249,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="color:var(--c-accent);font-size:20px;">📍</span>
              </div>
              <div>
                <p style="font-weight:700;font-size:0.95rem;color:#f1f5f9;margin-bottom:4px;">Headquarters</p>
                <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;">Level 15, Blue Ocean Tower,<br/>BKC, Mumbai, MH 400051</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;align-items:flex-start;">
              <div style="width:44px;height:44px;border-radius:12px;background:rgba(6,224,249,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="color:var(--c-accent);font-size:20px;">📞</span>
              </div>
              <div>
                <p style="font-weight:700;font-size:0.95rem;color:#f1f5f9;margin-bottom:4px;">Call Us</p>
                <p style="color:#94a3b8;font-size:0.9rem;">+91 98765 43210</p>
                <p style="color:#64748b;font-size:0.8rem;margin-top:2px;">Toll-free: 1800-BLUVIA</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;align-items:flex-start;">
              <div style="width:44px;height:44px;border-radius:12px;background:rgba(6,224,249,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="color:var(--c-accent);font-size:20px;">🕐</span>
              </div>
              <div>
                <p style="font-weight:700;font-size:0.95rem;color:#f1f5f9;margin-bottom:4px;">Business Hours</p>
                <p style="color:#94a3b8;font-size:0.9rem;">Mon – Sat: 9 AM – 6 PM IST</p>
                <p style="color:#64748b;font-size:0.8rem;margin-top:2px;">Closed on Sundays & Public Holidays</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;align-items:flex-start;">
              <div style="width:44px;height:44px;border-radius:12px;background:rgba(6,224,249,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="color:var(--c-accent);font-size:20px;">✉️</span>
              </div>
              <div>
                <p style="font-weight:700;font-size:0.95rem;color:#f1f5f9;margin-bottom:4px;">General Enquiries</p>
                <a href="mailto:hello@bluvia.in" style="color:var(--c-accent);font-size:0.9rem;text-decoration:none;font-weight:600;">hello@bluvia.in</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div style="${GLASS}border-radius:24px;overflow:hidden;position:relative;min-height:200px;">
          <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(6,224,249,0.08),rgba(0,180,216,0.04));z-index:1;"></div>
          <div style="width:100%;height:200px;background:linear-gradient(180deg,rgba(15,23,42,0.9),rgba(6,224,249,0.05));display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:2;">
            <div style="position:relative;margin-bottom:16px;">
              <div style="width:16px;height:16px;border-radius:50%;background:var(--c-accent);animation:ping 1.5s infinite;position:absolute;opacity:0.4;"></div>
              <div style="width:16px;height:16px;border-radius:50%;background:var(--c-accent);position:relative;box-shadow:0 0 20px rgba(6,224,249,0.6);"></div>
            </div>
            <p style="font-size:0.75rem;font-weight:800;letter-spacing:3px;color:var(--c-accent);text-transform:uppercase;">Bluvia Mumbai</p>
            <p style="font-size:0.7rem;color:#64748b;margin-top:4px;">19.0760° N, 72.8777° E</p>
          </div>
        </div>

        <!-- Social Links -->
        <div style="${GLASS}border-radius:24px;padding:28px 32px;">
          <h4 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin-bottom:16px;">Follow Us</h4>
          <div style="display:flex;gap:12px;">
            <a href="#" style="width:44px;height:44px;border-radius:12px;background:rgba(6,224,249,0.08);display:flex;align-items:center;justify-content:center;color:var(--c-accent);text-decoration:none;font-size:18px;transition:background 0.3s;" onmouseenter="this.style.background='rgba(6,224,249,0.2)'" onmouseleave="this.style.background='rgba(6,224,249,0.08)'">𝕏</a>
            <a href="#" style="width:44px;height:44px;border-radius:12px;background:rgba(6,224,249,0.08);display:flex;align-items:center;justify-content:center;color:var(--c-accent);text-decoration:none;font-size:18px;transition:background 0.3s;" onmouseenter="this.style.background='rgba(6,224,249,0.2)'" onmouseleave="this.style.background='rgba(6,224,249,0.08)'">in</a>
            <a href="#" style="width:44px;height:44px;border-radius:12px;background:rgba(6,224,249,0.08);display:flex;align-items:center;justify-content:center;color:var(--c-accent);text-decoration:none;font-size:18px;transition:background 0.3s;" onmouseenter="this.style.background='rgba(6,224,249,0.2)'" onmouseleave="this.style.background='rgba(6,224,249,0.08)'">📸</a>
            <a href="#" style="width:44px;height:44px;border-radius:12px;background:rgba(6,224,249,0.08);display:flex;align-items:center;justify-content:center;color:var(--c-accent);text-decoration:none;font-size:18px;transition:background 0.3s;" onmouseenter="this.style.background='rgba(6,224,249,0.2)'" onmouseleave="this.style.background='rgba(6,224,249,0.08)'">▶</a>
          </div>
        </div>

      </div>
    </div>

  </div>

  <style>
    @media (max-width: 900px) {
      #contact-grid { grid-template-columns: 1fr !important; }
    }
    @keyframes ping {
      0% { transform: scale(1); opacity: 0.6; }
      75%, 100% { transform: scale(2.5); opacity: 0; }
    }
  </style>
  `;
}

export function init() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit');
    const btnText = document.getElementById('contact-btn-text');

    btn.disabled = true;
    btn.style.opacity = '0.7';
    btnText.textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1500));

    btn.disabled = false;
    btn.style.opacity = '1';
    btnText.textContent = 'Send Message';
    form.reset();
    showToast("Message sent! We'll get back to you within 24 hours.", 'success');
  });
}
