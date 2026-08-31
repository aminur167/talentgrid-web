<div align="center">

# 🌐 TalentGrid — Next-Gen Talent Intelligence & SaaS Hiring Platform

**Empowering modern engineering teams and elite talent with real-time job discovery, automated workflows, and enterprise RBAC.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-talentgrid--app.vercel.app-6254f5?style=for-the-badge&logo=vercel)](https://talentgrid-app.vercel.app)
[![API Server](https://img.shields.io/badge/API_Server-talentgrid--api.vercel.app-10b981?style=for-the-badge&logo=fastapi)](https://talentgrid-api.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📌 Executive Summary

**TalentGrid Web** is a production-grade, full-stack recruitment frontend engineered with **Next.js 16 (Turbopack)**, **React 19**, and **Tailwind CSS 4**. Designed for scale and performance, it features instant cache hydration, multi-tenant role-based routing, interactive job discovery with real-time indexing, fixed-locked dashboard navigation, theme switching, and seamless Stripe checkout integration.

---

## 🚀 Key Features

### ⚡ 1. Performance & UI Architecture
- **0ms Instant Cache Hydration:** Sub-millisecond route transitions and client-side prefetching with zero loading layout shifts.
- **Fixed Sticky Sidebars:** Independent locked navigation panel with isolated scrollable content workspace.
- **Dynamic Theme Engine:** Instant theme switcher (Pro Dark / Midnight / Light) with client `localStorage` synchronization.

### 👥 2. Multi-Tenant Role-Based Access Control (RBAC)
- **Job Seeker Suite (`/dashboard/seeker`):**
  - Application quota tracking with interactive 3-free-applications progress meter.
  - Applied company history with verified employer badges, logo cards, and real-time status markers.
  - Complete submissions table with status filtering (`Pending`, `Shortlisted`, `Interviewing`, `Rejected`, `Hired`).
- **Recruiter Workspace (`/dashboard/recruiter`):**
  - Real-time job posting metrics and candidate volume counters.
  - Rich applicant pipeline review suite with cover letter modals and 1-click status transitions.
  - Company brand management with pending admin review workflows.
- **Admin Control Center (`/dashboard/admin`):**
  - Platform-wide telemetry (Total Users, Active Jobs, Pending Approvals).
  - User directory audit and moderation table.
  - 1-click company profile approval and rejection moderation.

### 🔍 3. Advanced Job Discovery Engine
- **Live Search & Taxonomy:** Real-time keyword search across titles, descriptions, and companies.
- **Dynamic Type Indexing:** Real-time count badges on filter tabs (`Full-Time`, `Part-Time`, `Contract`, `Internship`, `Remote`).
- **`@remote` Contextual Geolocation:** Location search keyword parsing and visual tag indicators.

### 💳 4. Stripe Subscription & Quota Engine
- **Flexible Billing:** Monthly vs. annual billing switcher with automatic 25% discount computation.
- **Tiered Access Tiers:** Starter ($0), Growth ($17), and Premium ($99).
- **Direct Quota Unlocking:** Auto-redirect on 4th application attempt with instant payment verification.

### 🔒 5. Enterprise Security & Barrier Guards
- **HttpOnly JWT Cookie Authorization:** Session persistence via `hl_token`.
- **404 Route Protection:** Layout-level edge guards preventing unauthorized cross-role access.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3.1 (App Router & Turbopack) |
| **UI Library** | React 19.2, Tailwind CSS 4, HeroUI v3 |
| **Icons** | Gravity UI Icons (`@gravity-ui/icons`) |
| **Authentication** | Better-Auth + JWT (HttpOnly & Secure Cookies) |
| **Payments** | Stripe Checkout API |
| **Hosting** | Vercel Serverless Platform |

---

## 📁 Project Structure

```
talentgrid-web/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Authentication flows (Sign In, Sign Up)
│   │   ├── dashboard/
│   │   │   ├── admin/          # Admin Control Center (Users, Companies, Jobs, Settings)
│   │   │   ├── recruiter/      # Recruiter ATS Suite (Jobs, Applicants, Company, Settings)
│   │   │   └── seeker/         # Seeker Workspace (Overview, Applications, Settings)
│   │   ├── jobs/               # Public Job Index, [id] Details & Apply Flow
│   │   ├── plans/              # Stripe Pricing & Tiered Subscriptions
│   │   ├── company/            # Verified Employers Directory
│   │   ├── layout.js           # Root layout with Geist font tokens
│   │   └── page.js             # High-converting SaaS Homepage
│   ├── components/
│   │   ├── dashboard/          # Fixed Locked Sidebars (Seeker, Recruiter, Admin)
│   │   ├── Navbar.jsx          # Role-aware Navigation with Theme Toggle
│   │   └── Footer.jsx          # Platform Resource Hub
│   ├── context/
│   │   └── ThemeContext.jsx    # Theme Provider (Dark / Midnight / Light)
│   └── lib/
│       ├── auth-client.js      # Better-Auth Client instance
│       └── stripe.js           # Stripe Integration Helpers
```

---

## ⚙️ Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/aminur167/talentgrid-web.git
cd talentgrid-web
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_BASE_URL=https://talentgrid-api.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret
MONGODB_URI=your_mongodb_connection_string
AUTH_DB_NAME=hireloop_db
NEXT_PUBLIC_IMAGE_API=your_imgbb_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

---

## 📄 License
Open-source under the [MIT License](LICENSE).
