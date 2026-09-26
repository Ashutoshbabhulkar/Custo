-- CUSTO DATABASE SCHEMA (PostgreSQL / Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'healthcare',
    tagline TEXT,
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    primary_color VARCHAR(20) DEFAULT '#005A63',
    secondary_color VARCHAR(20) DEFAULT '#D1ECF1',
    accent_color VARCHAR(20) DEFAULT '#EA1B23',
    google_review_url TEXT NOT NULL DEFAULT 'https://maps.google.com',
    logo_url TEXT,
    cover_image_url TEXT,
    min_google_stars_threshold INT DEFAULT 4,
    template VARCHAR(50) DEFAULT 'modern',
    theme_mode VARCHAR(20) DEFAULT 'light',
    font_family VARCHAR(50) DEFAULT 'inter',
    services JSONB DEFAULT '[]'::jsonb,
    attributes JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FEEDBACK RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.feedback_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    service_name VARCHAR(255),
    selected_issues JSONB DEFAULT '[]'::jsonb,
    comments TEXT,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    callback_requested BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REVIEW GENERATIONS TABLE
CREATE TABLE IF NOT EXISTS public.review_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    rating INT DEFAULT 5,
    selected_attributes JSONB DEFAULT '[]'::jsonb,
    tone VARCHAR(50) DEFAULT 'patient',
    generated_text TEXT NOT NULL,
    was_edited BOOLEAN DEFAULT FALSE,
    was_copied BOOLEAN DEFAULT FALSE,
    google_clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QR CODES TABLE
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Main QR',
    code VARCHAR(100) UNIQUE NOT NULL,
    scan_count INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QR SCANS LOG TABLE
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    device_type VARCHAR(100) DEFAULT 'mobile',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST MULTI-TENANT LOOKUPS
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_feedback_business ON public.feedback_responses(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.review_generations(business_id);
CREATE INDEX IF NOT EXISTS idx_qrcodes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qrcodes_business ON public.qr_codes(business_id);

-- RESTRICTED VIEW FOR PUBLIC CUSTOMER REVIEW PAGES (Excludes owner_id, internal auth metadata)
CREATE OR REPLACE VIEW public.public_business_pages AS
SELECT 
    id,
    slug,
    name,
    category,
    tagline,
    description,
    phone,
    email,
    website,
    address,
    city,
    google_review_url,
    logo_url,
    cover_image_url,
    primary_color,
    secondary_color,
    accent_color,
    min_google_stars_threshold,
    template,
    theme_mode,
    font_family,
    services,
    attributes,
    status
FROM public.businesses
WHERE status = 'published';

-- Grant SELECT on public_business_pages view to anonymous and authenticated users
GRANT SELECT ON public.public_business_pages TO anon, authenticated;

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Businesses Policies (Owner Isolation ONLY - Raw table SELECT is owner-restricted)
CREATE POLICY "Owners can view own business" ON public.businesses
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can update own business" ON public.businesses
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert business" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete business" ON public.businesses
    FOR DELETE USING (auth.uid() = owner_id);

-- Feedback Policies (Public can insert for published business, Owner can view/update/delete)
CREATE POLICY "Public can insert feedback for published businesses" ON public.feedback_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = feedback_responses.business_id
            AND businesses.status = 'published'
        )
    );

CREATE POLICY "Owners can view feedback" ON public.feedback_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = feedback_responses.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update feedback" ON public.feedback_responses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = feedback_responses.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete feedback" ON public.feedback_responses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = feedback_responses.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- Review Generation Policies (Public can insert for published business, Owner can view/delete)
CREATE POLICY "Public can insert review logs for published businesses" ON public.review_generations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = review_generations.business_id
            AND businesses.status = 'published'
        )
    );

CREATE POLICY "Owners can view reviews" ON public.review_generations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = review_generations.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete reviews" ON public.review_generations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = review_generations.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- QR Code Policies
CREATE POLICY "Public can view active QR codes" ON public.qr_codes
    FOR SELECT USING (active = true);

CREATE POLICY "Owners can manage QR codes" ON public.qr_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = qr_codes.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- QR Scans Policies (Public can insert for published business, Owner can view)
CREATE POLICY "Public can insert QR scans for published businesses" ON public.qr_scans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = qr_scans.business_id
            AND businesses.status = 'published'
        )
    );

CREATE POLICY "Owners can view QR scans" ON public.qr_scans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = qr_scans.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- SUPABASE STORAGE BUCKET FOR LOGOS & COVER IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('custo-assets', 'custo-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public Read Access for Assets
CREATE POLICY "Public Read Access for Assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'custo-assets');

-- Tenant-Aware Upload Policy (Enforces owner_id folder namespace)
CREATE POLICY "Owner Upload Assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'custo-assets' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Tenant-Aware Update Policy
CREATE POLICY "Owner Update Assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'custo-assets' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Tenant-Aware Delete Policy
CREATE POLICY "Owner Delete Assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'custo-assets' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
