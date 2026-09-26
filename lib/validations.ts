import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  category: z.string().min(1).max(50),
  tagline: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  website: z.string().max(500).optional(),
  address: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
  googleReviewUrl: z
    .string()
    .url('Google Review URL must be a valid URL starting with http:// or https://'),
  logoUrl: z.string().max(2000).optional(),
  coverImageUrl: z.string().max(2000).optional(),
  minGoogleStarsThreshold: z.number().int().min(1).max(5).default(4),
  template: z.enum(['modern', 'classic', 'minimal', 'glass', 'bold']).default('modern'),
  themeMode: z.enum(['light', 'dark']).default('light'),
  fontFamily: z.enum(['inter', 'outfit', 'jakarta', 'playfair', 'roboto']).default('inter'),
  primaryColor: z.string().max(50).default('#3B82F6'),
  secondaryColor: z.string().max(50).default('#1E40AF'),
  accentColor: z.string().max(50).default('#F59E0B'),
  customServices: z.array(z.string().max(255)).optional(),
  customAttributes: z
    .array(
      z.object({
        value: z.string().max(100),
        label: z.string().max(255),
      })
    )
    .optional(),
  customKeywords: z.array(z.string().max(100)).optional(),
  status: z.enum(['draft', 'published']).default('published'),
});

export const feedbackSchema = z.object({
  businessId: z.string().uuid('Invalid business ID format'),
  rating: z.number().int().min(1).max(5),
  selectedIssues: z.array(z.string().max(255)).max(10).optional(),
  comments: z.string().max(2000, 'Comments cannot exceed 2000 characters').optional(),
  customerName: z.string().max(255).optional(),
  customerPhone: z.string().max(50).optional(),
  callbackRequested: z.boolean().default(false),
  honeypot: z.string().max(0, 'Bot submission rejected').optional(),
});

export const reviewGenSchema = z.object({
  businessId: z.string().uuid('Invalid business ID format'),
  rating: z.number().int().min(1).max(5).default(5),
  selectedAttributes: z.array(z.string().max(255)).max(20).optional(),
  tone: z.string().max(50).default('patient'),
  generatedText: z.string().min(1).max(4000),
  wasEdited: z.boolean().default(false),
  wasCopied: z.boolean().default(false),
  googleClicked: z.boolean().default(false),
});

export const qrCodeSchema = z.object({
  businessId: z.string().uuid('Invalid business ID format'),
  campaignName: z.string().min(1).max(255),
  customCode: z.string().max(100).optional(),
});
