# CUSTO — Platform Architecture Document

## 1. System Overview
**CUSTO** is a multi-tenant SaaS Customer Feedback, Review Assistance, and Reputation Management Platform. It transforms single-business feedback workflows into a multi-tenant, configurable platform designed to serve businesses across Healthcare, Hospitality, Services, and retail sectors.

```
+-------------------------------------------------------------------------------+
|                                 CUSTO CLIENTS                                 |
+-----------------------------------+-------------------------------------------+
| Customer Mobile QR Flow           | Business Admin Dashboard & Onboarding      |
| Endpoint: /[slug] or /[slug]/qr   | Endpoint: /dashboard, /onboarding, /admin |
+-----------------------------------+-------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------------+
|                            NEXT.JS APP ROUTER LAYER                           |
|  - Server-Side Rendering (SSR) & Dynamic Routing                              |
|  - API Routes / Server Actions with Zod Validation                            |
|  - Auth Middleware (Supabase Auth / Session management)                        |
|  - Multi-Tenant Isolation Middleware (Tenant context extraction by slug/ID)    |
+-----------------------------------+-------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------------+
|                            CORE SERVICE SERVICES                              |
|  - ReviewEngine Service (Template & Rules-based review generation)            |
|  - FeedbackEngine Service (Collection, classification & callback triggers)     |
|  - QREngine Service (Multi-location, department-level QR generation & SVG/PNG)|
|  - AIProvider Abstraction (Future OpenAI/Gemini integration for insights)    |
+-----------------------------------+-------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------------+
|                       DATABASE & SECURITY (PostgreSQL)                        |
|  - Row Level Security (RLS) policies keyed by tenant_id / business_id        |
|  - UUID Primary Keys & Indexing on business_id, location_id, created_at        |
|  - Audit logs & Encryption at Rest / in Transit                               |
+-------------------------------------------------------------------------------+
```

---

## 2. Multi-Tenant Architecture & Data Isolation

### 2.1 Multi-Tenant Model
- **Logical Data Isolation**: Every business-owned record contains a mandatory `business_id` (foreign key referencing `businesses.id`).
- **Server-Side Enforcement**: All queries executed on behalf of authenticated business users strictly filter on `business_id`. Client-supplied tenant IDs are never trusted.
- **Row Level Security (RLS)**: PostgreSQL RLS policies enforce `business_id = (auth.jwt() ->> 'business_id')::uuid` for multi-tenant data access.
- **Public Customer Access**: Public feedback submissions (`POST /[slug]/feedback`) validate business existence and rate-limits by `business_id` without exposing administrative permissions.

---

## 3. Database Schema Blueprint (PostgreSQL)

```sql
-- CORE ENTITIES

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- healthcare, hospitality, services
    logo_url TEXT,
    cover_image_url TEXT,
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    primary_color VARCHAR(20) DEFAULT '#005A63',
    secondary_color VARCHAR(20) DEFAULT '#D1ECF1',
    accent_color VARCHAR(20) DEFAULT '#EA1B23',
    google_review_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- owner, admin, manager, staff
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

CREATE TABLE business_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., Wardha Main Branch, OPD Unit
    address TEXT,
    phone VARCHAR(50),
    google_review_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES business_locations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., OPD, Pathology, Pharmacy, Billing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    category VARCHAR(100), -- e.g., General Consultation, Surgery, Pathology
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feedback_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- rating, checkbox, text
    category VARCHAR(100),
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feedback_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES feedback_questions(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    sort_order INT DEFAULT 0
);

CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    location_id UUID REFERENCES business_locations(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    campaign_name VARCHAR(255), -- e.g., Reception Desk, OPD Gate
    qr_code_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feedback_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    location_id UUID REFERENCES business_locations(id) ON DELETE SET NULL,
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    selected_issues TEXT[], -- array of issues selected
    comments TEXT,
    callback_requested BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'new', -- new, reviewed, resolved
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    rating INT DEFAULT 5,
    selected_attributes TEXT[],
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    tone VARCHAR(50) DEFAULT 'patient',
    generated_text TEXT NOT NULL,
    was_edited BOOLEAN DEFAULT FALSE,
    was_copied BOOLEAN DEFAULT FALSE,
    google_clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Reusable Custo Review Engine Architecture

The Review Engine is designed as a standalone, deterministic service layer with dynamic template interpolation:

```typescript
interface ReviewEngineInput {
  business: {
    name: string;
    city: string;
    category: string;
  };
  service?: string;
  selectedAttributes: string[]; // e.g. ['doctor', 'staff', 'clean']
  tone?: 'patient' | 'grateful' | 'professional' | 'family' | 'surgery' | 'diagnostic';
  customContext?: string;
}

interface ReviewEngineOutput {
  reviewText: string;
  wordCount: number;
  attributesUsed: string[];
}
```

### Engine Features:
- **No Hallucination Policy**: Reviews only synthesize factual context (business name, location, service) and customer-selected attributes.
- **Dynamic Template Library**: sentence banks organized by category (Healthcare, Hospitality, Services).
- **Varied Sentence Combinations**: Randomized structures using weighted tone selectors, custom openings/closings, brand mentions, and localized SEO descriptors without artificial keyword stuffing.

---

## 5. Security & Privacy Design

- **Server-Side Authorization**: Enforced on all dashboard, API, and setup routes.
- **Healthcare Data Minimization**: Strict policy against requesting or storing clinical data, diagnoses, medical records, or sensitive patient health information (PHI).
- **Abuse Prevention**: IP-based rate limiting, CSRF protections, sanitized text areas to prevent XSS attacks, and submission throttling on public feedback routes.
- **Upload Controls**: MIME type checks and strict image size caps for logo/cover uploads.

---

## 6. Business Onboarding & QR Poster System

- **5-Step Onboarding**:
  1. Business Details & Category selection
  2. Branding & Live Preview
  3. Google Review Link Integration + Verification
  4. Dynamic Feedback Questions & Service Selection
  5. Automatic QR Code & Printable Poster (A4/A5 PDF/SVG) Generation.

---

## 7. Technology Stack
- **Framework**: Next.js 14+ (App Router, TypeScript, React 18)
- **Styling**: Vanilla CSS / Tailwind CSS for responsive components
- **Database & Auth**: PostgreSQL / Supabase
- **Icons & Graphics**: Lucide Icons, Canvas Confetti, QRCode generator
