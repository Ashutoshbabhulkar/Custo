# CUSTO — Migration Plan Document

## 1. Audit Summary of Existing Prototype (`hospital-review`)

### Current Files & Inventory:
- `index.html` (754 lines): Single-page landing and star rating card for AAS Hospital & Pathology (Wardha).
- `feedback.html` (465 lines): Private feedback form for ratings 1-4, sending POST requests to Google Apps Script.
- `review-generator.html` (1715 lines): 5-star review generator engine containing 200+ healthcare sentence templates, SEO terms, brand phrases, and tone variations for AAS Hospital.
- `Aas Logo.png` & `Aas Hospital Exterior.jpg`: Assets for AAS Hospital.

### Extracted Core Logic to Preserve:
1. **Review Generator Sentence Libraries**:
   - 40 Opening sentences (`openings`)
   - 40 Closing sentences (`closings`)
   - 25 Brand variation phrases (`brands`)
   - 10 Wardha local SEO phrases (`seoMentions`, `localServiceMentions`)
   - 20 Laparoscopic sentences & SEO terms
   - 20 Pathology laboratory SEO terms
   - 12 Attribute sentence pools (20 sentences per attribute: doctor, surgeon, pathology, staff, reports, clean, emergency, affordable, friendly, modern, diagnosis, care)
   - 6 Tone sentence banks (patient, grateful, professional, family, surgery, diagnostic)
   - Combinator algorithm (`randomStructure`, `pick`, `shuffle`, tone weights).
2. **User Flows & UX Micro-Interactions**:
   - Star rating hover & color transitions.
   - Dual confetti triggers on 5-star rating.
   - Clipboard auto-copy modal and step-by-step Google Review posting instructions.
   - Immediate feedback submission state for 1-4 stars with callback request capability.

---

## 2. Phase-by-Phase Migration Strategy

### Phase 0: Audit & Specification (COMPLETED)
- Inspect existing codebase (`index.html`, `feedback.html`, `review-generator.html`).
- Produce `ARCHITECTURE.md` and `MIGRATION_PLAN.md`.

### Phase 1: Stack Modernization & Project Setup
- Initialize Next.js app with TypeScript, Tailwind CSS, App Router.
- Set up directory structure, design tokens, and base UI component library.
- Configure `.env.local` and `.env.example`.

### Phase 2: Multi-Tenant Database & Schema Implementation
- Set up PostgreSQL schema with Supabase or Prisma/Kysely migrations.
- Implement business, user, service, QR code, feedback, and review tables.
- Add Row Level Security (RLS) policies and tenant isolation helpers.

### Phase 3: Dynamic Customer Feedback Flow (`/[businessSlug]`)
- Build public dynamic customer page loading business branding, logo, colors, services, and questions.
- Implement rating selection, feedback form submission, callback requests.
- Remove hard-coded gating (allow both public review assistance and private feedback options).

### Phase 4: Generalized Custo Review Assistant Service
- Extract and refactor `review-generator.html` into a modular `ReviewEngine` class.
- Parameterize business name, location, category, attributes, and services.
- Build responsive Review Assistant UI with review regeneration, tone tweaks, copy-to-clipboard modal, and Google Review CTA.

### Phase 5: Business Onboarding Wizard (`/onboarding`)
- Build 5-step wizard for new business onboarding (Details, Branding, Google URL, Questions, Services).
- Auto-generate initial business QR code.

### Phase 6: Business Admin Dashboard (`/dashboard`)
- Overview metrics: total responses, average rating, review generator conversion, callback requests.
- Feedback table with filters (date, rating, service, category).
- Reviews analytics and settings management.

### Phase 7: Multi-Location & QR Poster Generator
- Support creation of multiple QR codes per business (by location/department).
- Built-in printable poster generator (A4/A5 PDF/SVG exporter).

### Phase 8: AAS Hospital Migration (First Tenant)
- Populate database with AAS Hospital & Pathology configuration, services, attributes, and branding.
- Verify 100% feature parity and experience enhancement for AAS Hospital.

### Phase 9: Multi-Tenant Generalization Test (Second Tenant)
- Create second test business (e.g., "ABC Dental Clinic").
- Confirm zero code modifications are needed to onboard and operate a different business category.

### Phase 10: Security, Validation & E2E Testing
- Implement server-side authorization, input validation (Zod), rate limiting.
- Automated tests for review engine, multi-tenancy, and customer journey.

### Phase 11: Production Polish & Documentation
- Finalize documentation (`README.md`, `SECURITY.md`, `DEPLOYMENT.md`, `REVIEW_ENGINE.md`).
- Environment variable verification and production build check.
