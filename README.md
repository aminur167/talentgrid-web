<div align="center">

# 🌐 TalentGrid — Next-Gen Talent Intelligence & SaaS Hiring Platform

**Empowering modern tech teams and elite talent with real-time job matching, automated workflows, and enterprise RBAC.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📌 Overview

**TalentGrid Web** is a production-grade, full-stack recruitment frontend engineered with **Next.js 16 (Turbopack)**, **React 19**, and **Tailwind CSS 4**. Designed for scale and performance, it features instant cache hydration, multi-tenant role-based routing, interactive job discovery with real-time indexing, and seamless Stripe checkout integration.

---

## 🚀 Key Features

- **⚡ 0ms Instant Cache Hydration:** Sub-millisecond route transitions and client-side prefetching with zero loading spinners.
- **👥 Multi-Tenant Role-Based Architecture (RBAC):**
  - **Job Seeker Dashboard:** Application quota tracking, live progress meter (3 Free Applications Engine), company verification badges, and comprehensive submission history.
  - **Recruiter Dashboard:** Real-time job posting metrics, talent applicant screening pipeline, and company profile management.
  - **Admin Control Center:** Platform-wide oversight, user directory moderation, and one-click company approval/rejection workflows.
- **🔍 Advanced Job Discovery & Smart Filters:**
  - Real-time keyword search, category taxonomy, and salary brackets.
  - `@remote` contextual tagging and instant count indexing across employment types (Full-Time, Part-Time, Contract, Internship, Remote).
- **💳 Stripe Subscription & Quota Engine:**
  - Dynamic monthly/yearly billing switcher with 25% discount logic.
  - Tiered plan access (Starter $0, Growth $17, Premium $99) directly unlocking unlimited job applications.
- **🔒 Enterprise Security & 404 Route Protection:**
  - HttpOnly JWT cookie authorization (`hl_token`).
  - Strict edge layout route guards preventing cross-role privilege escalation.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3.1 (App Router & Turbopack) |
| **UI Library** | React 19.2, Tailwind CSS 4, HeroUI v3 |
| **Icons** | Gravity UI Icons (`@gravity-ui/icons`) |
| **Authentication** | Better-Auth + JWT (HttpOnly & Secure Cookies) |
| **Payments** | Stripe Checkout API |

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── (auth)/             # Authentication flows (Sign In, Sign Up)
│   ├── dashboard/
│   │   ├── admin/          # Admin Control Center (Users, Companies, Jobs)
│   │   ├── recruiter/      # Recruiter Management Suite
│   │   └── seeker/         # Seeker Workspace & Applications
│   ├── jobs/               # Public Job Index, [id] Details & Apply Flow
│   └── plans/              # Stripe Pricing & Subscription Tiers
├── components/
│   ├── dashboard/          # Specialized Sidebars (Seeker, Recruiter, Admin)
│   ├── Navbar.jsx          # Role-aware Dynamic Navigation
│   └── Footer.jsx          # Global Footer & Resource Hub
└── lib/
    ├── auth-client.js      # Better-Auth Client instance
    └── stripe.js           # Stripe Integration Helpers
```

---

## ⚙️ Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/aminur167/talentgrid-web.git
cd talentgrid-web
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
