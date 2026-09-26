export type BusinessCategory =
  | 'healthcare'
  | 'dental'
  | 'gym_fitness'
  | 'sports_academy'
  | 'academic_coaching'
  | 'hospitality'
  | 'salon_spa'
  | 'retail'
  | 'automobile'
  | 'hotel_resort'
  | 'real_estate'
  | 'professional_services'
  | 'events_photography'
  | 'services';

export type UserRole = 'super_admin' | 'owner' | 'admin' | 'manager' | 'staff';

export interface Business {
  id: string;
  ownerId?: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  googleReviewUrl: string;
  tagline?: string;
  minGoogleStarsThreshold?: number; // Default 4
  template?: 'modern' | 'classic' | 'minimal' | 'glass' | 'bold';
  themeMode?: 'light' | 'dark';
  fontFamily?: 'inter' | 'outfit' | 'jakarta' | 'playfair' | 'roboto';
  customServices?: string[];
  customAttributes?: { value: string; label: string }[];
  customKeywords?: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
  createdAt?: string;
}

export interface BusinessUser {
  id: string;
  businessId: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

export interface BusinessLocation {
  id: string;
  businessId: string;
  name: string;
  address?: string;
  phone?: string;
  googleReviewUrl?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  locationId: string;
  name: string;
  createdAt: string;
}

export interface Service {
  id: string;
  businessId: string;
  category?: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface FeedbackQuestion {
  id: string;
  businessId: string;
  questionText: string;
  questionType: 'rating' | 'checkbox' | 'text';
  category?: string;
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
  options?: FeedbackOption[];
}

export interface FeedbackOption {
  id: string;
  questionId: string;
  label: string;
  value: string;
  icon?: string;
  sortOrder: number;
}

export interface QRCodeItem {
  id: string;
  businessId: string;
  locationId?: string;
  departmentId?: string;
  campaignName: string;
  name?: string;
  code: string;
  scanCount: number;
  qrCodeUrl?: string;
  active: boolean;
  createdAt: string;
}

export interface QRCodeScan {
  id: string;
  qrCodeId: string;
  businessId: string;
  deviceType?: string;
  createdAt: string;
}

export interface FeedbackResponse {
  id: string;
  businessId: string;
  locationId?: string;
  qrCodeId?: string;
  rating: number;
  customerName?: string;
  customerPhone?: string;
  selectedIssues: string[];
  comments?: string;
  callbackRequested: boolean;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface ReviewGeneration {
  id: string;
  businessId: string;
  rating: number;
  selectedAttributes: string[];
  serviceId?: string;
  tone: string;
  generatedText: string;
  wasEdited: boolean;
  wasCopied: boolean;
  googleClicked: boolean;
  createdAt: string;
}
