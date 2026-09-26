'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { uploadBusinessImage } from '@/lib/storage';
import { BusinessCategory } from '@/types';
import { AIHighlightSuggester } from '@/services/AIHighlightSuggester';
import { ImageCropModal } from '@/components/ui/ImageCropModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import {
  Sparkles,
  Building2,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Plus,
  Trash2,
  QrCode as QrIcon,
  Download,
  Phone,
  MapPin,
  Moon,
  Sun,
  Crop,
  Upload,
  AlertCircle,
  Star,
  RefreshCw,
  Edit3,
} from 'lucide-react';

const FONT_FAMILIES: Record<string, string> = {
  inter: "'Inter', sans-serif",
  outfit: "'Outfit', sans-serif",
  jakarta: "'Plus Jakarta Sans', sans-serif",
  playfair: "'Playfair Display', serif",
  roboto: "'Roboto', sans-serif",
};

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Step 1: Details & Tagline (Clean empty initial state for fresh owners)
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('healthcare');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');

  // Step 2: Highlights, Services, Keywords & Threshold
  const [minGoogleStarsThreshold, setMinGoogleStarsThreshold] = useState<number>(4);
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');

  const [customAttributes, setCustomAttributes] = useState<{ value: string; label: string }[]>([]);
  const [newAttrInput, setNewAttrInput] = useState('');

  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // Step 3: Branding, Templates, Fonts & Themes
  const [primaryColor, setPrimaryColor] = useState('#005A63');
  const [secondaryColor, setSecondaryColor] = useState('#D1ECF1');
  const [accentColor, setAccentColor] = useState('#EA1B23');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');

  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal' | 'glass' | 'bold'>('modern');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState<'inter' | 'outfit' | 'jakarta' | 'playfair' | 'roboto'>('inter');

  // Image Crop Modal & File Upload state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'logo' | 'cover'>('cover');
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadOnboarding = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadBusinessImage(file, `${slug || 'new'}_${target}`);
    if (res.url) {
      if (target === 'logo') setLogoUrl(res.url);
      else setCoverImageUrl(res.url);
      // Auto open crop modal so user sees the full image and can adjust if desired
      setCropTarget(target);
      setCropModalOpen(true);
    }
  };

  // Step 4: Final QR Code
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  // AI Auto Generator for Tagline, Description, Highlights, Services & Keywords
  const handleAIGenerateSuggestions = () => {
    const suggestions = AIHighlightSuggester.suggest(category, name, city);
    setTagline(suggestions.tagline);
    setDescription(suggestions.description);
    setCustomAttributes(suggestions.highlights);
    setCustomServices(suggestions.services);
    setKeywords(suggestions.keywords);
  };

  const handleAICreateDescriptionOnly = () => {
    const suggestions = AIHighlightSuggester.suggest(category, name, city);
    setDescription(suggestions.description);
  };

  const handleCategoryChange = (newCat: BusinessCategory) => {
    setCategory(newCat);
    const suggestions = AIHighlightSuggester.suggest(newCat, name, city);
    setTagline(suggestions.tagline);
    setDescription(suggestions.description);
    setCustomAttributes(suggestions.highlights);
    setCustomServices(suggestions.services);
    setKeywords(suggestions.keywords);
  };

  // Service Management
  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    setCustomServices([...customServices, newServiceInput.trim()]);
    setNewServiceInput('');
  };

  const handleRemoveService = (index: number) => {
    setCustomServices(customServices.filter((_, i) => i !== index));
  };

  // Highlights Management
  const handleAddAttribute = () => {
    if (!newAttrInput.trim()) return;
    const val = newAttrInput.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setCustomAttributes([...customAttributes, { value: val, label: newAttrInput.trim() }]);
    setNewAttrInput('');
  };

  const handleRemoveAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index));
  };

  // Keywords Management
  const handleAddKeyword = () => {
    if (!newKeywordInput.trim()) return;
    setKeywords([...keywords, newKeywordInput.trim()]);
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleOpenCropModal = (target: 'logo' | 'cover') => {
    setCropTarget(target);
    setCropModalOpen(true);
  };

  const handleSaveCroppedImage = (croppedUrl: string) => {
    if (cropTarget === 'logo') {
      setLogoUrl(croppedUrl);
    } else {
      setCoverImageUrl(croppedUrl);
    }
  };

  // Generate QR Code when reaching step 4
  useEffect(() => {
    if (step === 4) {
      const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug || 'my-business'}` : `https://custo.app/${slug}`;
      QRCode.toDataURL(pageUrl, { width: 400, margin: 2, color: { dark: primaryColor, light: '#FFFFFF' } })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [step, slug, primaryColor]);

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `${slug || 'custo'}-qr-code.png`;
    a.click();
  };

  const handleCompleteOnboarding = async () => {
    const user = await db.getCurrentUser();
    const newBiz = await db.createBusiness(
      {
        name: name || 'My Business',
        slug: slug || `biz-${Date.now()}`,
        category,
        phone,
        email,
        address,
        city,
        description,
        tagline,
        minGoogleStarsThreshold,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        coverImageUrl,
        googleReviewUrl: googleReviewUrl || 'https://maps.google.com',
        template,
        themeMode,
        fontFamily,
        customServices,
        customAttributes,
        customKeywords: keywords,
        status: 'published',
      },
      user?.id
    );

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FBFC] py-8 px-4">
      {/* Image Crop & Adjustment Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        title={cropTarget === 'logo' ? '✂️ Crop & Adjust Business Logo' : '✂️ Crop & Adjust Cover Image'}
        initialImageUrl={cropTarget === 'logo' ? logoUrl : coverImageUrl}
        aspectRatio={cropTarget === 'logo' ? '1:1' : '16:9'}
        onSave={handleSaveCroppedImage}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge variant="primary" className="mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Step {step} of 4 — Business Setup
          </Badge>
          <h1 className="text-3xl font-extrabold text-[#005A63]">Onboard Your Business</h1>
          <p className="text-sm text-gray-600">Customize review flows, services, highlights, themes, and QR codes.</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-xl mx-auto flex items-center justify-between mb-8 px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= i ? 'bg-[#005A63] text-white shadow-md' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
              {i < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    step > i ? 'bg-[#005A63]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business Details & Tagline */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 shadow-card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#005A63]" /> Business Details & Tagline
                </h2>
                <Button variant="accent" size="sm" onClick={handleAIGenerateSuggestions}>
                  <Wand2 className="w-3.5 h-3.5 mr-1" /> AI Auto-Suggest All
                </Button>
              </div>

              <div className="space-y-4">
                <Input label="Business Name" placeholder="e.g., Wellness Gym & Fitness" value={name} onChange={handleNameChange} required />

                <Input label="Business URL Slug" placeholder="e.g., wellness-gym" value={slug} onChange={(e) => setSlug(e.target.value)} />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Business Category</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as BusinessCategory)}
                    className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#005A63] font-medium"
                  >
                    <option value="gym_fitness">🏋️ Gym & Fitness Club (Crossfit, Bodybuilding, Yoga)</option>
                    <option value="sports_academy">⚽ Sports Academy & Coaching (Cricket, Badminton, Turf)</option>
                    <option value="academic_coaching">📚 Academic Classes & Coaching Institute (Tuition, JEE/NEET)</option>
                    <option value="hospitality">🍽️ Restaurant, Cafe & Food Joint (Dining, Fast Food)</option>
                    <option value="healthcare">🏥 Healthcare, Hospital & Pathology Diagnostics</option>
                    <option value="dental">🦷 Dental Clinic & Dentistry</option>
                    <option value="salon_spa">✂️ Salon, Spa & Beauty Parlor</option>
                    <option value="retail">🛍️ Retail Store, Supermarket & Boutique</option>
                    <option value="automobile">🚗 Automobile, Garage & Car Wash</option>
                    <option value="hotel_resort">🏨 Hotel, Resort & Homestay</option>
                    <option value="real_estate">🏢 Real Estate & Property Consultants</option>
                    <option value="professional_services">💼 Professional Services (CA, Legal, Tech, Architecture)</option>
                    <option value="events_photography">🎉 Event Management & Photography Studio</option>
                    <option value="services">🛠️ General Services / Other Business</option>
                  </select>
                </div>

                <Input
                  label="Custom Tagline (Appears below logo)"
                  placeholder="e.g., ⭐ High-Energy Fitness & Certified Coaching in Wardha"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Phone Number" placeholder="+91-9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input label="City" placeholder="Wardha" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                {/* AI Written Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Short Business Description (Written by AI)
                    </label>
                    <button
                      type="button"
                      onClick={handleAICreateDescriptionOnly}
                      className="text-xs font-bold text-[#005A63] flex items-center gap-1 hover:underline bg-[#D1ECF1]/50 px-2.5 py-1 rounded-lg border border-[#005A63]/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#005A63]" /> AI Write Description
                    </button>
                  </div>
                  <Textarea
                    placeholder="Describe your services or let AI generate it for you..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    ✨ AI automatically tailors this description according to your business name and category.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button variant="primary" size="lg" onClick={() => setStep(2)}>
                  Next: Services & Highlights <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Highlights, Services, Keywords & Rating Threshold */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 shadow-card animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#005A63]" /> Services, Highlights & Google Rating Rule
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Auto-customized for <strong className="capitalize text-[#005A63]">{category.replace('_', ' ')}</strong>
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleAIGenerateSuggestions}>
                  <Wand2 className="w-3.5 h-3.5 mr-1 text-amber-600" /> Refresh AI Suggestions
                </Button>
              </div>

              {/* Google Review Rating Threshold */}
              <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl">
                <label className="block text-sm font-bold text-amber-900 mb-2">
                  ⭐ Google Review Redirection Star Threshold
                </label>
                <p className="text-xs text-amber-800 mb-4 leading-relaxed">
                  Select which star ratings automatically redirect customers to post on Google Reviews versus private internal feedback.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: 4, title: '4 & 5 Stars (Default)', desc: 'Redirect 4-5★ to Google, 1-3★ to Feedback' },
                    { val: 5, title: '5 Stars Only (Strict)', desc: 'Redirect 5★ to Google, 1-4★ to Feedback' },
                    { val: 3, title: '3 Stars & Above', desc: 'Redirect 3-5★ to Google, 1-2★ to Feedback' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setMinGoogleStarsThreshold(item.val)}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        minGoogleStarsThreshold === item.val
                          ? 'border-[#005A63] bg-white shadow-md text-[#005A63]'
                          : 'border-amber-200 bg-white/60 text-gray-700 hover:bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs mb-1 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {item.title}
                      </div>
                      <div className="text-[11px] text-gray-500 leading-tight">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Services Offered
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a service (e.g. Personal Training, Cardio Zone)"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                  />
                  <Button variant="primary" onClick={handleAddService}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customServices.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D1ECF1]/60 text-[#005A63] font-semibold text-xs border border-[#005A63]/20">
                      {s}
                      <button onClick={() => handleRemoveService(idx)} className="hover:text-red-600">
                        <Trash2 className="w-3 h-3 ml-1" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights & Strengths */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Highlights & Key Strengths Chips
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add highlight (e.g. 🏋️ Certified Personal Trainers)"
                    value={newAttrInput}
                    onChange={(e) => setNewAttrInput(e.target.value)}
                  />
                  <Button variant="primary" onClick={handleAddAttribute}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customAttributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-800 shadow-xs">
                      <span>{attr.label}</span>
                      <button onClick={() => handleRemoveAttribute(idx)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  SEO & Review Keywords
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add keyword (e.g. Best Gym in Wardha)"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                  />
                  <Button variant="primary" onClick={handleAddKeyword}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      #{kw}
                      <button onClick={() => handleRemoveKeyword(idx)} className="hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between pt-4 border-t border-gray-100">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button variant="primary" size="lg" onClick={() => setStep(3)}>
                  Next: Design & Live Preview <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Design, Templates, Themes & Split-Screen Live Preview */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Customization Controls */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="p-6 shadow-card">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#005A63]" /> Page Styling & Templates
                </h2>

                <div className="space-y-5">
                  {/* Template Picker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Page Layout Template
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'modern', name: '✨ Modern' },
                        { id: 'glass', name: '🧊 Glass' },
                        { id: 'classic', name: '🏛️ Classic' },
                        { id: 'minimal', name: '🌿 Minimal' },
                        { id: 'bold', name: '🔥 Bold' },
                      ].map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setTemplate(tmpl.id as any)}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                            template === tmpl.id
                              ? 'border-[#005A63] bg-[#005A63] text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {tmpl.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Mode Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Color Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setThemeMode('light')}
                        className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          themeMode === 'light'
                            ? 'border-[#005A63] bg-[#D1ECF1] text-[#005A63]'
                            : 'border-gray-200 bg-white text-gray-600'
                        }`}
                      >
                        <Sun className="w-4 h-4" /> Light Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('dark')}
                        className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          themeMode === 'dark'
                            ? 'border-gray-800 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white text-gray-600'
                        }`}
                      >
                        <Moon className="w-4 h-4" /> Dark Mode
                      </button>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Typography Font
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#005A63] font-medium"
                    >
                      <option value="inter">Inter (Modern Clean)</option>
                      <option value="outfit">Outfit (Stylish Geometric)</option>
                      <option value="jakarta">Plus Jakarta Sans (Corporate Premium)</option>
                      <option value="playfair">Playfair Display (Serif Luxury)</option>
                      <option value="roboto">Roboto (Classic Universal)</option>
                    </select>
                  </div>

                  {/* Media Assets with File Upload & Crop & Adjust Option */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">Logo Photo / Image</label>
                      <button
                        type="button"
                        onClick={() => handleOpenCropModal('logo')}
                        className="text-xs font-bold text-[#005A63] flex items-center gap-1 hover:underline"
                      >
                        <Crop className="w-3.5 h-3.5" /> Adjust & Crop Logo
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={(e) => handleFileUploadOnboarding(e, 'logo')}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="/Aas Logo.png or Image URL"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="shrink-0"
                      >
                        <Upload className="w-4 h-4 mr-1 text-[#005A63]" /> Upload Logo File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">Cover Photo / Image</label>
                      <button
                        type="button"
                        onClick={() => handleOpenCropModal('cover')}
                        className="text-xs font-bold text-[#005A63] flex items-center gap-1 hover:underline"
                      >
                        <Crop className="w-3.5 h-3.5" /> Adjust & Crop Cover
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      onChange={(e) => handleFileUploadOnboarding(e, 'cover')}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="/Aas Hospital Exterior.jpg or Image URL"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="shrink-0"
                      >
                        <Upload className="w-4 h-4 mr-1 text-[#005A63]" /> Upload Cover File
                      </Button>
                    </div>
                  </div>

                  {/* Center photo guidance note */}
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>💡 Important Photo Suggestion:</strong> Keep the main subject or building centered in your cover image to avoid key elements from being cropped on mobile screens.
                    </span>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Primary Color</label>
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-gray-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Color</label>
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-gray-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Accent Color</label>
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-gray-200" />
                    </div>
                  </div>

                  <Input
                    label="Google Business Review Link"
                    placeholder="https://g.page/r/.../review"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  />
                </div>

                <div className="mt-8 flex justify-between pt-4 border-t border-gray-100">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={() => setStep(4)}>
                    Next: Finalize & Generate QR <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Live Mobile Screen Preview (Reflecting Template & Font!) */}
            <div className="lg:col-span-6 sticky top-6">
              <div className="text-center mb-2 font-bold text-xs uppercase tracking-wider text-gray-500">
                📱 Live Customer Page Mobile View
              </div>
              <div className="mx-auto max-w-[340px] border-8 border-gray-900 rounded-[40px] shadow-2xl overflow-hidden bg-black relative">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-gray-900 rounded-b-2xl z-30 flex items-center justify-center">
                  <div className="w-12 h-1 bg-gray-700 rounded-full" />
                </div>

                {/* Mobile Preview Viewport with Font & Template Styling */}
                <div
                  style={{ fontFamily: FONT_FAMILIES[fontFamily] }}
                  className={`h-[560px] overflow-y-auto pt-6 px-3 pb-8 transition-all ${
                    themeMode === 'dark' ? 'bg-gray-950 text-white' : 'bg-[#F8FBFC] text-gray-900'
                  }`}
                >
                  {/* Dynamic Template Header Rendering */}
                  <div
                    className={`overflow-hidden transition-all ${
                      template === 'glass'
                        ? 'rounded-3xl backdrop-blur-md bg-white/70 border border-white/40 shadow-xl'
                        : template === 'classic'
                        ? 'rounded-xl border-2 border-[#005A63]/40 bg-white shadow-md'
                        : template === 'minimal'
                        ? 'rounded-none border-b-2 border-gray-200 bg-white shadow-none'
                        : template === 'bold'
                        ? 'rounded-3xl border-4 border-[#005A63] bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl'
                        : 'rounded-2xl overflow-hidden shadow-sm border-t-4 bg-white'
                    }`}
                    style={{ borderTopColor: template === 'modern' ? primaryColor : undefined }}
                  >
                    {coverImageUrl ? (
                      <img src={coverImageUrl} alt="Cover" className="h-28 w-full object-cover" />
                    ) : (
                      <div className="h-16 w-full flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
                        <Sparkles className="w-6 h-6 opacity-30" style={{ color: primaryColor }} />
                      </div>
                    )}

                    <div className="p-4 text-center">
                      {logoUrl && (
                        <div className="inline-block p-1.5 rounded-xl bg-white shadow-sm -mt-10 mb-2 relative z-10 border border-gray-100">
                          <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain mx-auto" />
                        </div>
                      )}

                      {tagline ? (
                        <div
                          className={`mb-2 inline-block px-2.5 py-0.5 text-[10px] font-bold ${
                            template === 'bold'
                              ? 'rounded-2xl bg-amber-400 text-black uppercase tracking-wide'
                              : template === 'glass'
                              ? 'rounded-xl bg-white/80 backdrop-blur-xs text-amber-900 border border-amber-300/50'
                              : template === 'classic'
                              ? 'rounded-md bg-[#005A63] text-white'
                              : 'rounded-full bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {tagline}
                        </div>
                      ) : (
                        <Badge variant="primary" className="mb-2 text-[10px]">
                          ⭐ Trusted {category} in {city || 'Wardha'}
                        </Badge>
                      )}

                      <h3 className="text-base font-extrabold mb-1" style={{ color: template === 'bold' ? '#38BDF8' : primaryColor }}>
                        {name || 'Your Business'}
                      </h3>

                      <p className={`text-[11px] leading-tight mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {description || 'Business description preview...'}
                      </p>

                      <div className={`flex flex-col gap-0.5 text-[10px] font-semibold items-center ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" style={{ color: primaryColor }} />
                            <span>{phone}</span>
                          </div>
                        )}
                        {address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" style={{ color: primaryColor }} />
                            <span>{address}, {city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Card */}
                  <div
                    className={`mt-3 p-4 text-center ${
                      template === 'glass'
                        ? 'rounded-3xl backdrop-blur-md bg-white/60 border border-white/30'
                        : template === 'bold'
                        ? 'rounded-3xl border-2 border-amber-400 bg-gray-900 text-white'
                        : template === 'minimal'
                        ? 'rounded-none border-b border-gray-200 bg-white'
                        : themeMode === 'dark'
                        ? 'bg-gray-900 rounded-2xl border border-gray-800'
                        : 'bg-white rounded-2xl shadow-sm'
                    }`}
                  >
                    <h4 className="text-xs font-bold mb-1" style={{ color: template === 'bold' ? '#FACC15' : primaryColor }}>
                      How Was Your Experience Today?
                    </h4>
                    <p className={`text-[10px] mb-3 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Select rating to test flow
                    </p>
                    <RatingStars value={5} onChange={() => {}} size="lg" showLabel={false} />
                  </div>

                  {/* Highlights Preview */}
                  <div
                    className={`mt-3 p-4 ${
                      template === 'glass'
                        ? 'rounded-3xl backdrop-blur-md bg-white/60 border border-white/30'
                        : template === 'bold'
                        ? 'rounded-3xl border-2 border-cyan-500 bg-gray-900 text-white'
                        : template === 'minimal'
                        ? 'rounded-none border-b border-gray-200 bg-white'
                        : themeMode === 'dark'
                        ? 'bg-gray-900 rounded-2xl border border-gray-800'
                        : 'bg-white rounded-2xl shadow-sm'
                    }`}
                  >
                    <h4 className="text-xs font-bold mb-2">What impressed you today?</h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {customAttributes.slice(0, 4).map((attr, idx) => (
                        <div key={idx} className="px-2.5 py-2 rounded-xl text-[10px] font-semibold border border-[#005A63]/30 bg-[#D1ECF1]/40 text-[#005A63]">
                          ✓ {attr.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final QR Code & Launch */}
        {step === 4 && (
          <div className="max-w-xl mx-auto">
            <Card className="p-8 shadow-card text-center animate-pop-in">
              <div className="w-16 h-16 rounded-3xl bg-[#D1ECF1] text-[#005A63] flex items-center justify-center mx-auto mb-4">
                <QrIcon className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-extrabold text-[#005A63] mb-2">
                Your Custo QR Code is Ready!
              </h2>

              <p className="text-xs text-gray-600 mb-6">
                Scan or print this QR code for your reception desk, gym floor, dining tables, or billing counter.
              </p>

              {/* Display Generated QR Code */}
              {qrCodeDataUrl ? (
                <div className="bg-white p-4 inline-block rounded-3xl shadow-md border border-gray-200 mb-6">
                  <img src={qrCodeDataUrl} alt="Business QR Code" className="w-56 h-56 mx-auto object-contain" />
                  <span className="block text-[11px] font-mono font-bold text-gray-500 mt-2">
                    /{slug || 'my-business'}
                  </span>
                </div>
              ) : (
                <div className="py-12 text-sm text-gray-400">Generating high-resolution QR code...</div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" fullWidth size="lg" onClick={handleDownloadQR}>
                  <Download className="w-4 h-4 mr-2" /> Download QR Code Poster
                </Button>
                <Button variant="accent" fullWidth size="lg" onClick={handleCompleteOnboarding}>
                  Launch Business Page 🚀
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
