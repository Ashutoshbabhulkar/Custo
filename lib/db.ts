import {
  Business,
  BusinessCategory,
  Service,
  FeedbackResponse,
  ReviewGeneration,
  QRCodeItem,
  QRCodeScan,
  User,
} from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import { businessSchema, feedbackSchema, reviewGenSchema, qrCodeSchema } from './validations';

function setAuthCookie(accessToken?: string) {
  if (typeof document !== 'undefined' && isSupabaseConfigured && accessToken) {
    document.cookie = `sb-access-token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
  }
}

function clearAuthCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number = 5000, errorMsg: string = 'Network operation timed out'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
    Promise.resolve(promise)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Seed Tenants for Instant Offline/Demo Capability (ONLY when Supabase is unconfigured)
export const SEED_TENANTS: Record<string, Business> = {
  'aas-hospital': {
    id: 'b0011223-4455-6677-8899-aabbccddeeff',
    ownerId: 'owner_demo_aas',
    name: 'AAS Hospital & Pathology',
    slug: 'aas-hospital',
    category: 'healthcare',
    logoUrl: '/Aas Logo.png',
    coverImageUrl: '/Aas Hospital Exterior.jpg',
    description: 'Providing advanced diagnostics, expert surgical care, compassionate treatment and trusted healthcare services across Wardha.',
    phone: '+91-7709296776',
    email: 'contact@aashospital.com',
    website: 'https://aashospital.com',
    address: 'Gandhinagar, Arvi Road, Beside Saundarya Tiles',
    city: 'Wardha',
    state: 'Maharashtra',
    country: 'India',
    primaryColor: '#005A63',
    secondaryColor: '#D1ECF1',
    accentColor: '#EA1B23',
    googleReviewUrl: 'https://g.page/r/CQzdArpE6pQyEBM/review',
    tagline: '⭐ Trusted Healthcare & Pathology in Wardha',
    minGoogleStarsThreshold: 4,
    template: 'modern',
    themeMode: 'light',
    fontFamily: 'inter',
    customServices: [
      'General OPD Consultation',
      'Laparoscopic & General Surgery',
      'Pathology & Blood Diagnostics',
      'Endoscopy & Diagnostic Scans',
      '24/7 Pharmacy & Emergency Care',
    ],
    customAttributes: [
      { value: 'doctor', label: '🩺 Doctor Communication & Expertise' },
      { value: 'surgeon', label: '🩻 Surgical Skill & Precision' },
      { value: 'pathology', label: '🔬 Accurate Lab & Pathology Tests' },
      { value: 'staff', label: '👨‍⚕️ Caring & Supportive Staff' },
      { value: 'reports', label: '⚡ Fast & Timely Reports' },
      { value: 'clean', label: '🧹 Clean & Hygienic Premises' },
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'abc-dental': {
    id: 'b9988776-5544-3322-1100-ffeeddccbbaa',
    ownerId: 'owner_demo_abc',
    name: 'ABC Dental Clinic',
    slug: 'abc-dental',
    category: 'healthcare',
    logoUrl: '',
    coverImageUrl: '',
    description: 'Advanced dental care, pain-free root canals, cosmetic dentistry, and dental implants.',
    phone: '+91-9876543210',
    email: 'info@abcdental.com',
    website: 'https://abcdental.com',
    address: '12 Medical Square, Civil Lines',
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    primaryColor: '#0284C7',
    secondaryColor: '#E0F2FE',
    accentColor: '#0D9488',
    googleReviewUrl: 'https://maps.google.com/?q=ABC+Dental+Clinic',
    tagline: '⭐ Pain-Free Dental & Cosmetic Care in Nagpur',
    minGoogleStarsThreshold: 4,
    template: 'glass',
    themeMode: 'light',
    fontFamily: 'outfit',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const SEED_ATTRIBUTES: Record<string, { value: string; label: string }[]> = {
  healthcare: [
    { value: 'doctor', label: '🩺 Doctor Communication' },
    { value: 'surgeon', label: '🩻 Surgical Expertise' },
    { value: 'pathology', label: '🔬 Pathology & Lab Accuracy' },
    { value: 'staff', label: '👨‍⚕️ Friendly & Supportive Staff' },
    { value: 'reports', label: '⚡ Fast & Timely Reports' },
    { value: 'clean', label: '🧹 Cleanliness & Hygiene' },
    { value: 'emergency', label: '🚑 Prompt Emergency Care' },
    { value: 'affordable', label: '💰 Transparent & Affordable' },
    { value: 'friendly', label: '😊 Patient Approachable' },
    { value: 'modern', label: '🏥 Modern Facilities' },
    { value: 'diagnosis', label: '🧠 Accurate Diagnosis' },
    { value: 'care', label: '❤️ Patient-Centered Care' },
  ],
  hospitality: [
    { value: 'taste', label: '🍲 Delicious Food & Taste' },
    { value: 'ambience', label: '✨ Great Ambience & Seating' },
    { value: 'service', label: '🤝 Quick & Friendly Service' },
    { value: 'cleanliness', label: '🧹 Clean Dining Area' },
    { value: 'value', label: '💰 Good Portion & Value' },
  ],
  services: [
    { value: 'professionalism', label: '👔 Professional Staff' },
    { value: 'quality', label: '⭐ High Quality Execution' },
    { value: 'punctuality', label: '⏱️ On-Time Delivery' },
    { value: 'support', label: '📞 Helpful Customer Support' },
  ],
  retail: [
    { value: 'variety', label: '🛍️ Wide Product Variety' },
    { value: 'pricing', label: '🏷️ Great Discounts & Prices' },
    { value: 'helpfulness', label: '😊 Helpful Store Staff' },
  ],
};

class CustoDatabaseService {
  private businesses: Map<string, Business> = new Map();
  private feedbackResponses: FeedbackResponse[] = [];
  private reviewGenerations: ReviewGeneration[] = [];
  private qrCodes: QRCodeItem[] = [];
  private qrScans: QRCodeScan[] = [];
  private currentUser: User | null = null;

  constructor() {
    Object.values(SEED_TENANTS).forEach((b) => this.businesses.set(b.slug, b));
    
    // Seed initial QR codes for unconfigured dev fallback
    this.qrCodes.push(
      {
        id: 'qr_aas_1',
        businessId: SEED_TENANTS['aas-hospital'].id,
        campaignName: 'Reception Desk',
        name: 'Reception Desk',
        code: 'aas-hospital-reception',
        scanCount: 142,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'qr_abc_1',
        businessId: SEED_TENANTS['abc-dental'].id,
        campaignName: 'Billing Counter',
        name: 'Billing Counter',
        code: 'abc-dental-main',
        scanCount: 89,
        active: true,
        createdAt: new Date().toISOString(),
      }
    );

    // Seed mock feedback for unconfigured dev fallback
    this.feedbackResponses.push(
      {
        id: 'f1',
        businessId: SEED_TENANTS['aas-hospital'].id,
        rating: 5,
        selectedIssues: [],
        comments: 'Extremely good treatment by Dr. AAS team.',
        callbackRequested: false,
        status: 'reviewed',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'f2',
        businessId: SEED_TENANTS['aas-hospital'].id,
        rating: 3,
        selectedIssues: ['Waiting Time', 'Report Delay'],
        comments: 'Wait time at OPD was long, but doctor was polite.',
        callbackRequested: true,
        customerName: 'Rahul Verma',
        customerPhone: '+91-9823000000',
        status: 'new',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    );

    this.reviewGenerations.push({
      id: 'r1',
      businessId: SEED_TENANTS['aas-hospital'].id,
      rating: 5,
      selectedAttributes: ['doctor', 'staff', 'clean'],
      tone: 'patient',
      generatedText: 'I recently visited AAS Hospital & Pathology in Wardha...',
      wasEdited: false,
      wasCopied: true,
      googleClicked: true,
      createdAt: new Date().toISOString(),
    });
  }

  // --- AUTHENTICATION METHODS ---

  public async signUpUser(email: string, password: string, fullName: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        console.error('[Supabase Auth Error] signUpUser:', error);
        if (error.message.includes('email rate limit exceeded')) {
          throw new Error('Supabase Email Rate Limit Reached (429): To allow instant signups without hitting email limits, please disable "Confirm Email" in your Supabase Cloud Auth Settings.');
        }
        throw new Error(error.message);
      }
      
      // Ensure session is active for immediate RLS operations
      if (!data.session) {
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInData?.session) {
            setAuthCookie(signInData.session.access_token);
            return signInData.user;
          }
          if (signInError && signInError.message.includes('Email not confirmed')) {
            console.warn('[Supabase Auth Warning] Email confirmation is enabled in Supabase project.');
          }
        } catch (e) {
          console.warn('Auto sign-in after signup skipped:', e);
        }
      } else {
        setAuthCookie(data.session.access_token);
      }

      return data.user;
    }

    // Fallback in-memory user when Supabase is unconfigured
    const mockUser: User = {
      id: `usr_${email.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`,
      email,
      fullName: fullName || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    this.currentUser = mockUser;
    setAuthCookie();
    if (typeof window !== 'undefined') {
      localStorage.setItem('custo_session_user', JSON.stringify(mockUser));
    }
    return mockUser;
  }

  public async signInUser(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[Supabase Auth Error] signInUser:', error);
        throw new Error(error.message);
      }
      setAuthCookie(data.session?.access_token);
      return data.user;
    }

    // Fallback in-memory auth when Supabase is unconfigured
    const mockUser: User = {
      id: `usr_${email.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`,
      email,
      fullName: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    this.currentUser = mockUser;
    setAuthCookie();
    if (typeof window !== 'undefined') {
      localStorage.setItem('custo_session_user', JSON.stringify(mockUser));
    }
    return mockUser;
  }

  public async signOutUser() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    this.currentUser = null;
    clearAuthCookie();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('custo_session_user');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('custo_active_biz_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  public async deleteUserAccount(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // 1. Delete all businesses owned by this user
      const { error: bizErr } = await supabase
        .from('businesses')
        .delete()
        .eq('owner_id', userId);

      if (bizErr) {
        console.error('[Supabase Error] deleteUserAccount (businesses):', bizErr);
        throw new Error(bizErr.message);
      }

      // 2. Sign out user session & clear cookies
      await this.signOutUser();
      return;
    }

    // Fallback in-memory delete
    const allBusinesses = Array.from(this.businesses.values());
    const userBizIds = allBusinesses.filter((b) => b.ownerId === userId).map((b) => b.id);
    for (const [id, biz] of Array.from(this.businesses.entries())) {
      if (biz.ownerId === userId) {
        this.businesses.delete(id);
      }
    }
    this.feedbackResponses = this.feedbackResponses.filter((f) => !userBizIds.includes(f.businessId));
    this.reviewGenerations = this.reviewGenerations.filter((r) => !userBizIds.includes(r.businessId));
    this.qrCodes = this.qrCodes.filter((q) => !userBizIds.includes(q.businessId));
    this.qrScans = this.qrScans.filter((s) => !userBizIds.includes(s.businessId));
    await this.signOutUser();
  }

  public async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('[Supabase Auth Error] getCurrentUser:', error);
        throw new Error(error.message);
      }
      if (data?.user) {
        return {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          createdAt: data.user.created_at,
        };
      }
      return null;
    }

    if (this.currentUser) return this.currentUser;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('custo_session_user');
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
          return this.currentUser;
        } catch (e) {}
      }
    }
    return null;
  }

  // --- BUSINESS TENANT METHODS ---

  public async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    if (isSupabaseConfigured && supabase) {
      // Query restricted public_business_pages view to ensure no owner_id or private columns are exposed
      const { data: publicData } = await supabase
        .from('public_business_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (publicData) {
        return this.mapSupabaseBusiness(publicData);
      }

      // If owner query on businesses table
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('[Supabase Error] getBusinessBySlug:', error);
      }
      return data ? this.mapSupabaseBusiness(data) : undefined;
    }

    // Unconfigured dev fallback only
    return this.businesses.get(slug);
  }

  public async getBusinessById(id: string): Promise<Business | undefined> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[Supabase Error] getBusinessById:', error);
        throw new Error(`Database error fetching business: ${error.message}`);
      }
      return data ? this.mapSupabaseBusiness(data) : undefined;
    }

    // Unconfigured dev fallback only
    return Array.from(this.businesses.values()).find((b) => b.id === id);
  }

  public async getBusinessesByOwnerId(ownerId: string): Promise<Business[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', ownerId);

      if (error) {
        console.error('[Supabase Error] getBusinessesByOwnerId:', error);
        throw new Error(`Database error fetching owner businesses: ${error.message}`);
      }
      return data ? data.map(this.mapSupabaseBusiness) : [];
    }

    // Unconfigured dev fallback only
    return Array.from(this.businesses.values()).filter((b) => b.ownerId === ownerId);
  }

  public async createBusiness(
    businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
    ownerId?: string
  ): Promise<Business> {
    const validated = businessSchema.parse(businessData);
    let targetOwnerId = ownerId || (businessData as any).ownerId;

    if (isSupabaseConfigured && supabase) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        targetOwnerId = userData.user.id;
      }
    }

    const generatedUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'b0000000-0000-4000-8000-000000000000';
    const newBiz: Business = {
      ...validated,
      category: validated.category as any,
      status: validated.status as any,
      template: validated.template as any,
      themeMode: validated.themeMode as any,
      fontFamily: validated.fontFamily as any,
      id: generatedUuid,
      ownerId: targetOwnerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          owner_id: targetOwnerId,
          name: newBiz.name,
          slug: newBiz.slug,
          category: newBiz.category,
          tagline: newBiz.tagline,
          description: newBiz.description,
          phone: newBiz.phone,
          email: newBiz.email,
          address: newBiz.address,
          city: newBiz.city,
          website: newBiz.website,
          google_review_url: newBiz.googleReviewUrl,
          logo_url: newBiz.logoUrl,
          cover_image_url: newBiz.coverImageUrl,
          primary_color: newBiz.primaryColor,
          secondary_color: newBiz.secondaryColor,
          accent_color: newBiz.accentColor,
          template: newBiz.template,
          font_family: newBiz.fontFamily,
          theme_mode: newBiz.themeMode,
          services: newBiz.customServices || [],
          attributes: newBiz.customAttributes || [],
          keywords: newBiz.customKeywords || [],
          status: newBiz.status,
          min_google_stars_threshold: newBiz.minGoogleStarsThreshold,
        }])
        .select()
        .single();

      if (error) {
        console.error('[Supabase Error] createBusiness:', error);
        throw new Error(`Database error creating business: ${error.message}`);
      }

      const created = this.mapSupabaseBusiness(data);
      // Create initial default QR code in database
      await this.createQRCode(created.id, 'Main Reception Desk', `${created.slug}-main`);
      return created;
    }

    // Unconfigured dev fallback only
    this.businesses.set(newBiz.slug, newBiz);
    this.createQRCode(newBiz.id, 'Main Reception Desk', `${newBiz.slug}-main`);
    return newBiz;
  }

  public async updateBusiness(id: string, updates: Partial<Business>): Promise<Business | undefined> {
    if (isSupabaseConfigured && supabase) {
      const supabaseUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.slug !== undefined) supabaseUpdates.slug = updates.slug;
      if (updates.category !== undefined) supabaseUpdates.category = updates.category;
      if (updates.tagline !== undefined) supabaseUpdates.tagline = updates.tagline;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;
      if (updates.address !== undefined) supabaseUpdates.address = updates.address;
      if (updates.city !== undefined) supabaseUpdates.city = updates.city;
      if (updates.website !== undefined) supabaseUpdates.website = updates.website;
      if (updates.googleReviewUrl !== undefined) supabaseUpdates.google_review_url = updates.googleReviewUrl;
      if (updates.logoUrl !== undefined) supabaseUpdates.logo_url = updates.logoUrl;
      if (updates.coverImageUrl !== undefined) supabaseUpdates.cover_image_url = updates.coverImageUrl;
      if (updates.primaryColor !== undefined) supabaseUpdates.primary_color = updates.primaryColor;
      if (updates.secondaryColor !== undefined) supabaseUpdates.secondary_color = updates.secondaryColor;
      if (updates.accentColor !== undefined) supabaseUpdates.accent_color = updates.accentColor;
      if (updates.template !== undefined) supabaseUpdates.template = updates.template;
      if (updates.fontFamily !== undefined) supabaseUpdates.font_family = updates.fontFamily;
      if (updates.themeMode !== undefined) supabaseUpdates.theme_mode = updates.themeMode;
      if (updates.customServices !== undefined) supabaseUpdates.services = updates.customServices;
      if (updates.customAttributes !== undefined) supabaseUpdates.attributes = updates.customAttributes;
      if (updates.customKeywords !== undefined) supabaseUpdates.keywords = updates.customKeywords;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.minGoogleStarsThreshold !== undefined) supabaseUpdates.min_google_stars_threshold = updates.minGoogleStarsThreshold;

      const { data, error } = await supabase
        .from('businesses')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('[Supabase Error] updateBusiness:', error);
        throw new Error(`Database error updating business: ${error.message}`);
      }

      return data ? this.mapSupabaseBusiness(data) : undefined;
    }

    // Unconfigured dev fallback only
    const existing = await this.getBusinessById(id);
    if (!existing) return undefined;
    const updated: Business = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.businesses.set(updated.slug, updated);
    return updated;
  }

  // --- SERVICES & ATTRIBUTES ---

  public async getServices(businessId: string): Promise<Service[]> {
    const b = await this.getBusinessById(businessId);
    if (!b) return [];

    if (b.customServices && b.customServices.length > 0) {
      return b.customServices.map((s, idx) => ({
        id: `cs_${idx}`,
        businessId: b.id,
        name: s,
        active: true,
        createdAt: b.createdAt,
      }));
    }

    return [
      { id: 's_def1', businessId, name: 'General Consultation & Service', active: true, createdAt: new Date().toISOString() }
    ];
  }

  public async getAttributes(category: BusinessCategory, businessId?: string): Promise<{ value: string; label: string }[]> {
    if (businessId) {
      const b = await this.getBusinessById(businessId);
      if (b && b.customAttributes && b.customAttributes.length > 0) {
        return b.customAttributes;
      }
    }
    return SEED_ATTRIBUTES[category] || SEED_ATTRIBUTES['healthcare'];
  }

  // --- FEEDBACK & REVIEWS ---

  public async submitFeedback(feedback: Omit<FeedbackResponse, 'id' | 'createdAt' | 'status'> & { honeypot?: string }): Promise<FeedbackResponse> {
    const validated = feedbackSchema.parse(feedback);
    if (validated.honeypot) {
      throw new Error('Bot submission rejected');
    }

    const generatedUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'f0000000-0000-4000-8000-000000000000';
    const newResponse: FeedbackResponse = {
      ...validated,
      id: generatedUuid,
      selectedIssues: validated.selectedIssues || [],
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('feedback_responses')
        .insert([{
          business_id: validated.businessId,
          rating: validated.rating,
          service_name: (feedback as any).service || '',
          selected_issues: validated.selectedIssues || [],
          comments: validated.comments || '',
          customer_name: validated.customerName || '',
          customer_phone: validated.customerPhone || '',
          callback_requested: validated.callbackRequested || false,
          status: 'new',
        }])
        .select()
        .single();

      if (error) {
        console.error('[Supabase Error] submitFeedback:', error);
        throw new Error(`Database error submitting feedback: ${error.message}`);
      }

      return {
        id: data.id,
        businessId: data.business_id,
        rating: data.rating,
        selectedIssues: data.selected_issues || [],
        comments: data.comments,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        callbackRequested: data.callback_requested,
        status: data.status,
        createdAt: data.created_at,
      };
    }

    // Unconfigured dev fallback only
    this.feedbackResponses.push(newResponse);
    return newResponse;
  }

  public async getFeedbackByBusiness(businessId: string): Promise<FeedbackResponse[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('feedback_responses')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase Error] getFeedbackByBusiness:', error);
        throw new Error(`Database error fetching feedback: ${error.message}`);
      }

      return data ? data.map((f: any) => ({
        id: f.id,
        businessId: f.business_id,
        rating: f.rating,
        selectedIssues: f.selected_issues || [],
        comments: f.comments,
        customerName: f.customer_name,
        customerPhone: f.customer_phone,
        callbackRequested: f.callback_requested,
        status: f.status,
        createdAt: f.created_at,
      })) : [];
    }

    // Unconfigured dev fallback only
    return this.feedbackResponses.filter((f) => f.businessId === businessId);
  }

  public async trackReviewGeneration(gen: Omit<ReviewGeneration, 'id' | 'createdAt'>): Promise<ReviewGeneration> {
    const validated = reviewGenSchema.parse(gen);
    const generatedUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'r0000000-0000-4000-8000-000000000000';
    const newGen: ReviewGeneration = {
      ...validated,
      id: generatedUuid,
      selectedAttributes: validated.selectedAttributes || [],
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('review_generations').insert([{
        business_id: validated.businessId,
        rating: validated.rating,
        selected_attributes: validated.selectedAttributes || [],
        tone: validated.tone,
        generated_text: validated.generatedText,
        was_edited: validated.wasEdited,
        was_copied: validated.wasCopied,
        google_clicked: validated.googleClicked,
      }]).select().single();

      if (error) {
        console.error('[Supabase Error] trackReviewGeneration:', error);
        throw new Error(`Database error logging review generation: ${error.message}`);
      }

      return {
        id: data.id,
        businessId: data.business_id,
        rating: data.rating,
        selectedAttributes: data.selected_attributes || [],
        tone: data.tone,
        generatedText: data.generated_text,
        wasEdited: data.was_edited,
        wasCopied: data.was_copied,
        googleClicked: data.google_clicked,
        createdAt: data.created_at,
      };
    }

    // Unconfigured dev fallback only
    this.reviewGenerations.push(newGen);
    return newGen;
  }

  public async getReviewGenerationsByBusiness(businessId: string): Promise<ReviewGeneration[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('review_generations')
        .select('*')
        .eq('business_id', businessId);

      if (error) {
        console.error('[Supabase Error] getReviewGenerationsByBusiness:', error);
        throw new Error(`Database error fetching review generations: ${error.message}`);
      }

      return data ? data.map((r: any) => ({
        id: r.id,
        businessId: r.business_id,
        rating: r.rating,
        selectedAttributes: r.selected_attributes || [],
        tone: r.tone,
        generatedText: r.generated_text,
        wasEdited: r.was_edited,
        wasCopied: r.was_copied,
        googleClicked: r.google_clicked,
        createdAt: r.created_at,
      })) : [];
    }

    // Unconfigured dev fallback only
    return this.reviewGenerations.filter((r) => r.businessId === businessId);
  }

  // --- DYNAMIC QR & SCAN TRACKING ---

  public async getQRCodesByBusiness(businessId: string): Promise<QRCodeItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('business_id', businessId);

      if (error) {
        console.error('[Supabase Error] getQRCodesByBusiness:', error);
        throw new Error(`Database error fetching QR codes: ${error.message}`);
      }

      return data ? data.map((q: any) => ({
        id: q.id,
        businessId: q.business_id,
        campaignName: q.name,
        name: q.name,
        code: q.code,
        scanCount: q.scan_count || 0,
        active: q.active,
        createdAt: q.created_at,
      })) : [];
    }

    // Unconfigured dev fallback only
    return this.qrCodes.filter((q) => q.businessId === businessId);
  }

  public async createQRCode(businessId: string, campaignName: string, customCode?: string): Promise<QRCodeItem> {
    const code = customCode || `qr_${Math.random().toString(36).substring(2, 9)}`;
    const generatedUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'q0000000-0000-4000-8000-000000000000';
    const newItem: QRCodeItem = {
      id: generatedUuid,
      businessId,
      campaignName,
      code,
      scanCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('qr_codes')
        .insert([{
          business_id: businessId,
          name: campaignName,
          code: newItem.code,
          scan_count: 0,
          active: true,
        }])
        .select()
        .single();

      if (error) {
        console.error('[Supabase Error] createQRCode:', error);
        throw new Error(`Database error creating QR code: ${error.message}`);
      }

      return {
        id: data.id,
        businessId: data.business_id,
        campaignName: data.name,
        name: data.name,
        code: data.code,
        scanCount: data.scan_count || 0,
        active: data.active,
        createdAt: data.created_at,
      };
    }

    // Unconfigured dev fallback only
    this.qrCodes.push(newItem);
    return newItem;
  }

  public async getQRCodeByCode(code: string): Promise<QRCodeItem | undefined> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        console.error('[Supabase Error] getQRCodeByCode:', error);
        throw new Error(`Database error fetching QR code: ${error.message}`);
      }

      return data ? {
        id: data.id,
        businessId: data.business_id,
        campaignName: data.name,
        name: data.name,
        code: data.code,
        scanCount: data.scan_count || 0,
        active: data.active,
        createdAt: data.created_at,
      } : undefined;
    }

    // Unconfigured dev fallback only
    return this.qrCodes.find((q) => q.code === code);
  }

  public async recordQRScan(qrCodeId: string, businessId: string, deviceType: string = 'mobile'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error: scanError } = await supabase.from('qr_scans').insert([{
        qr_code_id: qrCodeId,
        business_id: businessId,
        device_type: deviceType,
      }]);

      if (scanError) {
        console.error('[Supabase Error] recordQRScan insert:', scanError);
        throw new Error(`Database error logging QR scan: ${scanError.message}`);
      }

      const qr = await this.getQRCodeByCode(qrCodeId);
      if (qr) {
        const { error: qrError } = await supabase
          .from('qr_codes')
          .update({ scan_count: (qr.scanCount || 0) + 1 })
          .eq('id', qrCodeId);

        if (qrError) {
          console.error('[Supabase Error] recordQRScan increment count:', qrError);
        }
      }
      return;
    }

    // Unconfigured dev fallback only
    const scan: QRCodeScan = {
      id: `scan_${Date.now()}`,
      qrCodeId,
      businessId,
      deviceType,
      createdAt: new Date().toISOString(),
    };
    this.qrScans.push(scan);
    const localQr = this.qrCodes.find((q) => q.id === qrCodeId);
    if (localQr) localQr.scanCount = (localQr.scanCount || 0) + 1;
  }

  // --- ANALYTICS DASHBOARD ---

  public async getAnalytics(businessId: string) {
    const responses = await this.getFeedbackByBusiness(businessId);
    const reviews = await this.getReviewGenerationsByBusiness(businessId);
    const qrList = await this.getQRCodesByBusiness(businessId);

    // 1. Convert 5-star & 4-star copied Google Reviews into unified log items
    const googleReviewLogs = reviews
      .filter((r) => r.wasCopied || r.googleClicked || r.rating >= 4)
      .map((r) => ({
        id: r.id,
        businessId: r.businessId,
        rating: r.rating || 5,
        type: 'google_review' as const,
        customerName: 'Google Reviewer',
        customerPhone: '',
        selectedIssues: [],
        selectedAttributes: r.selectedAttributes || [],
        comments: r.generatedText || '',
        callbackRequested: false,
        status: 'published' as const,
        createdAt: r.createdAt,
      }));

    // 2. Convert private feedback items into unified log items
    const privateFeedbackLogs = responses.map((f) => ({
      id: f.id,
      businessId: f.businessId,
      rating: f.rating,
      type: 'private_feedback' as const,
      customerName: f.customerName || 'Anonymous Customer',
      customerPhone: f.customerPhone || '',
      selectedIssues: f.selectedIssues || [],
      selectedAttributes: [],
      comments: f.comments || '',
      callbackRequested: f.callbackRequested || false,
      status: f.status,
      createdAt: f.createdAt,
    }));

    // 3. Combine and sort newest first
    const allActivityLogs = [...googleReviewLogs, ...privateFeedbackLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalResponses = allActivityLogs.length;
    const avgRating = totalResponses > 0
      ? (allActivityLogs.reduce((sum, r) => sum + r.rating, 0) / totalResponses).toFixed(1)
      : '5.0';

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allActivityLogs.forEach((r) => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    const callbackRequests = responses.filter((r) => r.callbackRequested).length;
    const totalReviewsGenerated = reviews.length;
    const totalReviewsCopied = reviews.filter((r) => r.wasCopied || r.googleClicked).length;
    const totalQRScans = qrList.reduce((sum, q) => sum + (q.scanCount || 0), 0);

    return {
      totalResponses,
      avgRating,
      ratingDistribution,
      callbackRequests,
      totalReviewsGenerated,
      totalReviewsCopied,
      totalQRScans,
      recentFeedback: allActivityLogs.slice(0, 50),
    };
  }

  private mapSupabaseBusiness(row: any): Business {
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      slug: row.slug,
      category: row.category,
      tagline: row.tagline,
      description: row.description,
      phone: row.phone,
      email: row.email,
      address: row.address,
      city: row.city,
      website: row.website,
      googleReviewUrl: row.google_review_url,
      logoUrl: row.logo_url,
      coverImageUrl: row.cover_image_url,
      primaryColor: row.primary_color || '#005A63',
      secondaryColor: row.secondary_color || '#D1ECF1',
      accentColor: row.accent_color || '#EA1B23',
      template: row.template || 'modern',
      fontFamily: row.font_family || 'inter',
      themeMode: row.theme_mode || 'light',
      minGoogleStarsThreshold: row.min_google_stars_threshold || 4,
      customServices: row.services || [],
      customAttributes: row.attributes || [],
      customKeywords: row.keywords || [],
      status: row.status || 'published',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const db = new CustoDatabaseService();
