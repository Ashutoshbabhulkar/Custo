'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { uploadBusinessImage } from '@/lib/storage';
import { Business, BusinessCategory } from '@/types';
import { ImageCropModal } from '@/components/ui/ImageCropModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import { Toast } from '@/components/ui/Toast';
import { AIHighlightSuggester } from '@/services/AIHighlightSuggester';
import {
  Sparkles,
  Building2,
  Palette,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Crop,
  Sun,
  Moon,
  Star,
  Plus,
  Trash2,
  Save,
  Globe,
  Eye,
  ExternalLink,
  Phone,
  MapPin,
  AlertCircle,
  Wand2,
} from 'lucide-react';

const FONT_FAMILIES: Record<string, string> = {
  inter: "'Inter', sans-serif",
  outfit: "'Outfit', sans-serif",
  jakarta: "'Plus Jakarta Sans', sans-serif",
  playfair: "'Playfair Display', serif",
  roboto: "'Roboto', sans-serif",
};

export default function ReviewPageEditor() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('healthcare');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [minGoogleStarsThreshold, setMinGoogleStarsThreshold] = useState<number>(4);

  // Branding States
  const [primaryColor, setPrimaryColor] = useState('#005A63');
  const [secondaryColor, setSecondaryColor] = useState('#D1ECF1');
  const [accentColor, setAccentColor] = useState('#EA1B23');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal' | 'glass' | 'bold'>('modern');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [fontFamily, setFontFamily] = useState<'inter' | 'outfit' | 'jakarta' | 'playfair' | 'roboto'>('inter');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Custom Lists
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [customAttributes, setCustomAttributes] = useState<{ value: string; label: string }[]>([]);
  const [newAttrInput, setNewAttrInput] = useState('');

  // Crop Modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'logo' | 'cover'>('cover');

  useEffect(() => {
    async function loadData() {
      const user = await db.getCurrentUser();
      let biz: Business | undefined;

      if (!user) {
        router.push('/login');
        return;
      }

      const owned = await db.getBusinessesByOwnerId(user.id);
      if (!owned || owned.length === 0) {
        router.push('/onboarding');
        return;
      }

      const savedId = typeof window !== 'undefined' ? localStorage.getItem(`custo_active_biz_${user.id}`) : null;
      biz = (savedId && owned.find((b) => b.id === savedId)) || owned[0];

      if (biz) {
        setBusiness(biz);
        setName(biz.name);
        setSlug(biz.slug);
        setCategory(biz.category);
        setTagline(biz.tagline || '');
        setDescription(biz.description || '');
        setPhone(biz.phone || '');
        setEmail(biz.email || '');
        setAddress(biz.address || '');
        setCity(biz.city || '');
        setGoogleReviewUrl(biz.googleReviewUrl);
        setMinGoogleStarsThreshold(biz.minGoogleStarsThreshold || 4);
        setPrimaryColor(biz.primaryColor);
        setSecondaryColor(biz.secondaryColor);
        setAccentColor(biz.accentColor);
        setLogoUrl(biz.logoUrl || '');
        setCoverImageUrl(biz.coverImageUrl || '');
        setTemplate(biz.template || 'modern');
        setThemeMode(biz.themeMode || 'light');
        setFontFamily(biz.fontFamily || 'inter');
        setStatus(biz.status || 'published');
        setCustomServices(biz.customServices || []);
        setCustomAttributes(biz.customAttributes || []);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FBFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#005A63] border-t-transparent"></div>
      </div>
    );
  }

  if (!business) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadBusinessImage(file, `${slug}_${target}`);
    if (res.error) {
      setToastMessage(res.error);
      return;
    }
    if (res.url) {
      if (target === 'logo') setLogoUrl(res.url);
      else setCoverImageUrl(res.url);
      setToastMessage(`${target === 'logo' ? 'Logo' : 'Cover image'} uploaded successfully!`);
    }
  };

  const handleOpenCropModal = (target: 'logo' | 'cover') => {
    setCropTarget(target);
    setCropModalOpen(true);
  };

  const handleSaveCroppedImage = async (croppedUrl: string) => {
    try {
      if (croppedUrl.startsWith('data:')) {
        const fetchRes = await fetch(croppedUrl);
        const blob = await fetchRes.blob();
        const res = await uploadBusinessImage(blob, `${slug}_${cropTarget}`);
        if (res.url) {
          if (cropTarget === 'logo') setLogoUrl(res.url);
          else setCoverImageUrl(res.url);
          setToastMessage(`${cropTarget === 'logo' ? 'Logo' : 'Cover image'} cropped and uploaded!`);
          return;
        }
      }
    } catch (err) {
      console.error('Cropped image upload error:', err);
    }

    if (cropTarget === 'logo') setLogoUrl(croppedUrl);
    else setCoverImageUrl(croppedUrl);
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    setCustomServices([...customServices, newServiceInput.trim()]);
    setNewServiceInput('');
  };

  const handleRemoveService = (index: number) => {
    setCustomServices(customServices.filter((_, i) => i !== index));
  };

  const handleAddAttribute = () => {
    if (!newAttrInput.trim()) return;
    const val = newAttrInput.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setCustomAttributes([...customAttributes, { value: val, label: newAttrInput.trim() }]);
    setNewAttrInput('');
  };

  const handleRemoveAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index));
  };

  const handleAICreateDescriptionOnly = () => {
    const res = AIHighlightSuggester.suggest(category, name || 'Your Business', city || 'Wardha');
    if (res.description) {
      setDescription(res.description);
      setToastMessage('✨ AI auto-generated a tailored business description!');
    }
  };

  const handleAIGenerateSuggestions = () => {
    const res = AIHighlightSuggester.suggest(category, name || 'Your Business', city || 'Wardha');
    if (res.tagline) setTagline(res.tagline);
    if (res.description) setDescription(res.description);
    if (res.services && res.services.length > 0) setCustomServices(res.services);
    if (res.highlights && res.highlights.length > 0) {
      setCustomAttributes(res.highlights);
    }
    setToastMessage('✨ AI updated suggestions, tagline, description, services & highlights!');
  };

  const handleSave = async (newStatus?: 'draft' | 'published') => {
    if (!googleReviewUrl || !googleReviewUrl.startsWith('http')) {
      setToastMessage('Please enter a valid Google Review URL (starting with http:// or https://)');
      return;
    }

    const targetStatus = newStatus || status;

    try {
      setSaving(true);
      await db.updateBusiness(business.id, {
        name,
        slug,
        category,
        tagline,
        description,
        phone,
        email,
        address,
        city,
        googleReviewUrl,
        minGoogleStarsThreshold,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
        coverImageUrl,
        template,
        themeMode,
        fontFamily,
        status: targetStatus,
        customServices,
        customAttributes,
      });

      setStatus(targetStatus);
      setToastMessage(`Page changes saved & ${targetStatus === 'published' ? 'published live' : 'saved as draft'}!`);
    } catch (err: any) {
      setToastMessage('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFC] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
        </div>
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        title={cropTarget === 'logo' ? '✂️ Crop & Adjust Business Logo' : '✂️ Crop & Adjust Cover Image'}
        initialImageUrl={cropTarget === 'logo' ? logoUrl : coverImageUrl}
        aspectRatio={cropTarget === 'logo' ? '1:1' : '16:9'}
        onSave={handleSaveCroppedImage}
      />

      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="font-extrabold text-lg text-[#005A63] leading-none">Review Page Editor</h1>
              <span className="text-[11px] text-gray-500 font-medium">Customize branding & live page controls</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {status === 'published' ? '● Published' : '○ Draft'}
            </span>

            <Button variant="outline" size="sm" onClick={() => handleSave('draft')} disabled={saving}>
              Save Draft
            </Button>

            <Button variant="accent" size="sm" onClick={() => handleSave('published')} disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" /> Publish Live
            </Button>

            <Link href={`/${slug}`} target="_blank">
              <Button variant="secondary" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Screen Editor Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings & Customization Controls (Left Side) */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#005A63]" /> Business Information
                </h2>
              </div>

              <div className="space-y-4">
                <Input label="Business Name" value={name} onChange={(e) => setName(e.target.value)} required />

                <Input label="Public Page Slug (URL)" value={slug} onChange={(e) => setSlug(e.target.value)} required />

                <Input label="Custom Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Business Description
                    </label>
                    <button
                      type="button"
                      onClick={handleAICreateDescriptionOnly}
                      className="text-xs font-bold text-[#005A63] flex items-center gap-1 hover:underline bg-[#D1ECF1]/50 px-2.5 py-1 rounded-lg border border-[#005A63]/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#005A63]" /> AI Write Description
                    </button>
                  </div>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />

                <div>
                  <Input
                    label="Google Review Destination Link"
                    placeholder="https://g.page/r/.../review"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    🔗 Direct link where customers paste and post their review on Google Maps.
                  </p>
                </div>

                {/* Google Review Rating Threshold Selection */}
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl">
                  <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Google Review Redirection Star Threshold
                  </label>
                  <p className="text-[11px] text-amber-800 mb-3 leading-relaxed">
                    Select which star ratings automatically redirect customers to post on Google Reviews versus private internal feedback.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { val: 4, title: '4 & 5 Stars (Default)', desc: 'Redirect 4-5★ to Google, 1-3★ to Feedback' },
                      { val: 5, title: '5 Stars Only (Strict)', desc: 'Redirect 5★ to Google, 1-4★ to Feedback' },
                      { val: 3, title: '3 Stars & Above', desc: 'Redirect 3-5★ to Google, 1-2★ to Feedback' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setMinGoogleStarsThreshold(item.val)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          minGoogleStarsThreshold === item.val
                            ? 'border-[#005A63] bg-white shadow-sm text-[#005A63]'
                            : 'border-amber-200 bg-white/60 text-gray-700 hover:bg-white'
                        }`}
                      >
                        <div className="font-bold text-xs mb-0.5 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.title}
                        </div>
                        <div className="text-[10px] text-gray-500 leading-tight">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Design & Media Storage Card */}
            <Card className="p-6 shadow-card space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#005A63]" /> Branding, Logos & Layouts
              </h2>

              <div className="space-y-5">
                {/* Logo File Upload & Crop */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Business Logo
                  </label>
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-xl border p-1 bg-white" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Logo</div>
                    )}
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                        <Upload className="w-3.5 h-3.5 mr-1.5 text-[#005A63]" /> Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleOpenCropModal('logo')}
                        className="text-xs font-bold text-[#005A63] hover:underline flex items-center gap-1"
                      >
                        <Crop className="w-3 h-3" /> Adjust & Crop Logo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cover File Upload & Crop */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Cover Banner Image
                  </label>
                  <div className="flex items-center gap-3">
                    {coverImageUrl ? (
                      <img src={coverImageUrl} alt="Cover" className="w-24 h-14 object-cover rounded-xl border bg-white" />
                    ) : (
                      <div className="w-24 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Cover</div>
                    )}
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                        <Upload className="w-3.5 h-3.5 mr-1.5 text-[#005A63]" /> Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'cover')} />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleOpenCropModal('cover')}
                        className="text-xs font-bold text-[#005A63] hover:underline flex items-center gap-1"
                      >
                        <Crop className="w-3 h-3" /> Adjust & Crop Cover
                      </button>
                    </div>
                  </div>
                </div>

                {/* Template Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Layout Template
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'modern', name: '✨ Modern' },
                      { id: 'glass', name: '🧊 Glass' },
                      { id: 'classic', name: '🏛️ Classic' },
                      { id: 'minimal', name: '🌿 Minimal' },
                      { id: 'bold', name: '🔥 Bold' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplate(t.id as any)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                          template === t.id
                            ? 'border-[#005A63] bg-[#005A63] text-white shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography & Theme Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 font-semibold"
                    >
                      <option value="inter">Inter (Modern)</option>
                      <option value="outfit">Outfit (Stylish)</option>
                      <option value="jakarta">Plus Jakarta Sans</option>
                      <option value="playfair">Playfair Display (Serif)</option>
                      <option value="roboto">Roboto (Classic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setThemeMode('light')}
                        className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 ${
                          themeMode === 'light' ? 'bg-[#D1ECF1] text-[#005A63] border-[#005A63]' : 'bg-white text-gray-600'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" /> Light
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('dark')}
                        className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 ${
                          themeMode === 'dark' ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-600'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" /> Dark
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Primary Color</label>
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-9 rounded-xl border cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Color</label>
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full h-9 rounded-xl border cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Accent Color</label>
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-9 rounded-xl border cursor-pointer" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Services & Highlights Management Card */}
            <Card className="p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#005A63]" /> Services & Highlight Chips
                </h2>
                <Button variant="outline" size="sm" onClick={handleAIGenerateSuggestions}>
                  <Wand2 className="w-3.5 h-3.5 mr-1 text-amber-600" /> AI Auto-Suggest All
                </Button>
              </div>

              {/* Services Offered */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Services List
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add service (e.g. Root Canal, OPD)"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                  />
                  <Button variant="primary" size="sm" onClick={handleAddService}>
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

              {/* Highlights Chips */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Customer Highlight Chips
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add highlight (e.g. 🩺 Doctor Communication)"
                    value={newAttrInput}
                    onChange={(e) => setNewAttrInput(e.target.value)}
                  />
                  <Button variant="primary" size="sm" onClick={handleAddAttribute}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customAttributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-800">
                      <span>{attr.label}</span>
                      <button onClick={() => handleRemoveAttribute(idx)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth size="lg" onClick={() => handleSave('draft')} disabled={saving}>
                Save as Draft
              </Button>
              <Button variant="accent" fullWidth size="lg" onClick={() => handleSave('published')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> Save & Publish Live
              </Button>
            </div>
          </div>

          {/* Live Mobile Viewport Preview (Right Side) */}
          <div className="lg:col-span-6 sticky top-20">
            <div className="text-center mb-2 font-bold text-xs uppercase tracking-wider text-gray-500">
              📱 Live Customer Mobile Preview
            </div>

            <div className="mx-auto max-w-[340px] border-8 border-gray-900 rounded-[40px] shadow-2xl overflow-hidden bg-black relative">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-gray-900 rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-12 h-1 bg-gray-700 rounded-full" />
              </div>

              <div
                style={{ fontFamily: FONT_FAMILIES[fontFamily] }}
                className={`h-[580px] overflow-y-auto pt-6 px-3 pb-8 transition-all ${
                  themeMode === 'dark' ? 'bg-gray-950 text-white' : 'bg-[#F8FBFC] text-gray-900'
                }`}
              >
                {/* Header Card */}
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

                    {tagline && (
                      <div className="mb-2 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        {tagline}
                      </div>
                    )}

                    <h3 className="text-base font-extrabold mb-1" style={{ color: template === 'bold' ? '#38BDF8' : primaryColor }}>
                      {name || 'Your Business Name'}
                    </h3>

                    <p className={`text-[11px] leading-tight mb-2 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      {description || 'Business description...'}
                    </p>

                    <div className="flex flex-col gap-0.5 text-[10px] font-semibold text-gray-500 items-center">
                      {phone && <span>📞 {phone}</span>}
                      {address && <span>📍 {address}, {city}</span>}
                    </div>
                  </div>
                </div>

                {/* Rating Card */}
                <div className="mt-3 p-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-bold mb-1" style={{ color: primaryColor }}>
                    How Was Your Experience Today?
                  </h4>
                  <RatingStars value={5} onChange={() => {}} size="lg" showLabel={false} />
                </div>

                {/* Highlights Preview */}
                <div className="mt-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
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
      </main>
    </div>
  );
}
