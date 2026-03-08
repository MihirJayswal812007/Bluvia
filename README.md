# 💧 Bluvia — Premium Water Bottle Supply Platform

<div align="center">

![Bluvia Banner](https://img.shields.io/badge/Bluvia-Premium%20Water%20Supply-00e5ff?style=for-the-badge&logo=water&logoColor=white)

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A full-stack premium packaged water supply management platform.**  
Dark glassmorphism UI · MySQL backend · JWT Auth · Real-time order management

[Live Demo](#) · [Report Bug](https://github.com/Devam510/Bluvia/issues) · [Request Feature](https://github.com/Devam510/Bluvia/issues)

</div>

---

## 📸 Screenshots

| Home | Products | Admin Panel |
|------|----------|-------------|
| Dark particle-animated hero | 3D tilt product cards | Full order & inventory management |

---

## ✨ Features

- **🎨 Premium Dark UI** — Glassmorphism design with GSAP animations and Three.js particle backgrounds
- **🛒 Product Catalogue** — 200ml, 500ml, 1L water bottles with live stock tracking
- **🔐 JWT Authentication** — Secure signup/login with bcrypt password hashing
- **📦 Order Management** — Place orders with GST calculation, inventory deduction via MySQL transactions
- **⚙️ Admin Panel** — Manage orders, inventory, and users with live stats
- **📱 Fully Responsive** — Works on mobile, tablet, and desktop
- **🗄️ MySQL Backend** — Express REST API connected to MySQL (WAMP-compatible)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Vanilla JavaScript** (ES Modules) | All application logic, SPA routing |
| **Vite 5** | Build tool & dev server |
| **Vanilla CSS** | Dark glassmorphism styling, animations |
| **GSAP** | Scroll-triggered animations, counters |
| **Three.js** | 3D animated particle background |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | REST API server (port 3001) |
| **MySQL 8 / WAMP** | Database |
| **mysql2** | MySQL driver with connection pooling |
| **jsonwebtoken** | JWT session tokens |
| **bcryptjs** | Password hashing |
| **cors** | Cross-origin requests |

---

## 📁 Project Structure

```
Bluvia/
├── 📂 src/                     # Frontend source
│   ├── main.js                 # App entry point, router
│   ├── auth.js                 # JWT auth client
│   ├── api.js                  # Centralised API fetch client
│   ├── db.js                   # LocalStorage fallback (offline mode)
│   ├── router.js               # Client-side SPA router
│   ├── style.css               # Global styles & design tokens
│   ├── 📂 pages/               # Page modules
│   │   ├── home.js             # Landing page with particle hero
│   │   ├── products.js         # Product catalogue
│   │   ├── checkout.js         # Order placement
│   │   ├── orders.js           # User order history
│   │   ├── dashboard.js        # Business overview
│   │   ├── admin.js            # Admin panel
│   │   ├── login.js            # Login page
│   │   ├── signup.js           # Signup page
│   │   ├── contact.js          # Contact page
│   │   └── about.js            # About page
│   ├── 📂 components/          # Shared UI components
│   │   ├── navbar.js
│   │   ├── footer.js
│   │   ├── skeleton.js
│   │   └── particles.js        # Three.js particle system
│   └── 📂 utils/               # Helpers
│       ├── cart.js
│       ├── toast.js
│       ├── format.js
│       └── razorpay.js
│
├── 📂 server/                  # Backend (Express + MySQL)
│   ├── index.js                # Express app entry point
│   ├── db.js                   # MySQL connection pool
│   ├── schema.sql              # Database schema + seed data
│   ├── .env                    # Environment variables (not committed)
│   ├── 📂 middleware/
│   │   └── auth.js             # JWT requireAuth / requireAdmin
│   └── 📂 routes/
│       ├── auth.js             # POST /api/auth/signup, /login, /me
│       ├── products.js         # GET/POST/PATCH /api/products
│       ├── orders.js           # POST/GET /api/orders
│       └── admin.js            # GET /api/admin/stats, users, inventory
│
├── index.html                  # SPA shell
├── vite.config.js              # Vite config
└── package.json                # Frontend dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org)
- **WAMP Server** or any MySQL installation — [Download WAMP](https://www.wampserver.com)
- **Git** — [Download](https://git-scm.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/MihirJayswal812007/Bluvia.git
cd Bluvia
```

---

### 2. Set Up the Database (WAMP)

#### A. Install WAMP Server

1. Download **WAMP Server** from [https://www.wampserver.com](https://www.wampserver.com)
2. Run the installer and follow the on-screen instructions (default installation path: `C:\wamp64`)
3. Launch WAMP from the Start Menu or desktop shortcut

#### B. Verify Services Are Running

- Look for the **WAMP tray icon** in your system taskbar (bottom-right)
- The icon should be **green** ✅ — this means Apache and MySQL are both running
- If it's **orange** or **red**, left-click the icon → hover over **MySQL** → click **Start/Resume Service**

> 💡 If port 3306 is blocked, left-click the WAMP icon → **MySQL** → **MySQL console** to confirm MySQL is active.

#### C. Import the Database Schema

1. Open **phpMyAdmin** in your browser: `http://localhost/phpmyadmin`
   - Default credentials: Username `root`, Password *(leave blank)*
2. Click the **SQL** tab in the top navigation bar
3. Open `server/schema.sql` from the project folder, copy its entire contents, and paste them into the SQL text box
4. Click **Go** — this will:
   - Create the `bluvia` database
   - Create all required tables (`users`, `products`, `inventory`, `orders`, `order_items`)
   - Insert seed data including the admin account and 3 sample products

> ✅ You should see a success message. You can verify by clicking **bluvia** in the left sidebar and confirming the tables exist.

---

### 3. Configure the Backend

```bash
cd server
```

Create/edit `server/.env`:

```env
# MySQL / WAMP Settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Leave empty for default WAMP setup
DB_NAME=bluvia

# Server
PORT=3001

# JWT Secret — change this in production!
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
```

Install dependencies and start:

```bash
npm install
npm run dev
```

You should see:
```
✅ MySQL connected successfully
🚀 Bluvia API server running at http://localhost:3001
```

---

### 4. Start the Frontend

Open a **new terminal** in the project root:

```bash
cd ..          # Go back to Bluvia root
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Default Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@bluvia.com` |
| Password | `admin123` |

> ⚠️ Change the admin password after first login in production.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET`  | `/api/auth/me` | Get current user (auth required) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/products` | List all active products |
| `GET`    | `/api/products/:id` | Get single product |
| `POST`   | `/api/products` | Create product (admin) |
| `PATCH`  | `/api/products/:id` | Update product (admin) |
| `PATCH`  | `/api/products/:id/stock` | Update inventory (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`  | `/api/orders` | Place new order (auth) |
| `GET`   | `/api/orders` | Get my orders (auth) |
| `GET`   | `/api/orders/all` | Get all orders (admin) |
| `PATCH` | `/api/orders/:id/status` | Update status (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/api/admin/stats` | Dashboard statistics |
| `GET`   | `/api/admin/users` | All users |
| `GET`   | `/api/admin/inventory` | Current stock levels |
| `PATCH` | `/api/admin/users/:id/role` | Change user role |

---

## 🗄️ Database Schema

```
users          → id, full_name, email, password_hash, role, created_at
products       → id, name, description, price_paise, volume_ml, specs, active
inventory      → id, product_id, stock_quantity, reorder_threshold
orders         → id, user_id, total_paise, shipping_address, status, created_at
order_items    → id, order_id, product_id, quantity, unit_price_paise
```

---

## 🔧 Available Scripts

### Frontend (root directory)
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Build for production → dist/
npm run preview  # Preview production build
```

### Backend (`server/` directory)
```bash
npm run dev      # Start with hot reload (node --watch)
npm start        # Start without hot reload (production)
```

---

## 🔮 Future Plans

- [ ] Razorpay payment gateway integration
- [ ] Email notifications for orders (Nodemailer)
- [ ] SMS alerts via Twilio
- [ ] Product image upload
- [ ] Delivery tracking with Google Maps
- [ ] Export orders to Excel/PDF
- [ ] PWA support (offline mode)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Made with 💙 by [Devam](https://github.com/Devam510)

**Bluvia** — *Pure Water, Every Drop*

</div>
