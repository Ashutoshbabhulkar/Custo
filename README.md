# CUSTO — Customer Feedback & Reputation Platform

> **Know what your customers think.**

Custo helps businesses collect genuine customer feedback, make it extremely easy for customers to write a polished review, understand customer experience through analytics, and improve their business using actionable insights.

---

## 🌟 Key Features

1. **Mobile-First Customer QR Experience (`/[businessSlug]`)**
   - 1–5 Star Rating selector with smooth animations and canvas confetti.
   - Non-gated feedback policy (Private feedback & Callback request for all ratings; Review Assistant for public posting).

2. **Custo Review Assistant (`services/ReviewEngine.ts`)**
   - Refactored review generation engine preserving 200+ sentence templates.
   - Zero hallucination guarantee: Synthesizes only customer-selected attributes and factual business context.
   - Dynamic tone choices (Patient, Grateful, Professional, Family).
   - One-click clipboard copy + step-by-step modal guide + direct Google Review CTA.

3. **Multi-Tenant Architecture (`lib/db.ts`)**
   - Strict logical data isolation by `business_id`.
   - Dynamic business branding (colors, logos, cover images, address, phone).
   - Supports Healthcare, Hospitality, Services, and Retail sectors.

4. **Business Setup Wizard (`/onboarding`)**
   - 4-step setup: Business Details, Branding & Live Preview, Google Review URL, and Launch.
   - Zero developer involvement required for new business onboarding.

5. **Business Dashboard (`/dashboard`)**
   - Real-time metrics: Total responses, average rating, callback requests, review assistant conversion.
   - Multi-tenant switcher to test multiple businesses seamlessly.
   - Filterable feedback logs.

6. **QR Code & Poster Generator (`/dashboard/qr`)**
   - Dynamic QR code generation for reception, OPD, billing, or custom campaign locations.
   - Built-in printable A4/A5 poster generator with download options.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/custo.git
cd custo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Key Routes
- **Platform Home**: `/`
- **Tenant 1 (AAS Hospital)**: `/aas-hospital`
- **Tenant 2 (ABC Dental Clinic)**: `/abc-dental`
- **Business Onboarding**: `/onboarding`
- **Business Admin Dashboard**: `/dashboard`
- **QR Poster Generator**: `/dashboard/qr`

---

## 📚 Documentation
- [`ARCHITECTURE.md`](file:///d:/Softwares/Custo/ARCHITECTURE.md) — System design & database blueprint
- [`MIGRATION_PLAN.md`](file:///d:/Softwares/Custo/MIGRATION_PLAN.md) — Phased migration strategy
- [`REVIEW_ENGINE.md`](file:///d:/Softwares/Custo/REVIEW_ENGINE.md) — Review generator logic & sentence libraries
- [`SECURITY.md`](file:///d:/Softwares/Custo/SECURITY.md) — Multi-tenancy & data protection policies
- [`ONBOARDING.md`](file:///d:/Softwares/Custo/ONBOARDING.md) — Business onboarding guide
- [`ROADMAP.md`](file:///d:/Softwares/Custo/ROADMAP.md) — Product roadmap (V1 to Enterprise)