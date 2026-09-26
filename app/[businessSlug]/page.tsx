'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/db';
import { Business, Service } from '@/types';
import { ReviewEngine } from '@/services/ReviewEngine';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import { Toast } from '@/components/ui/Toast';
import {
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
  Copy,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  Check,
  ShieldCheck,
  ThumbsUp,
  HeartHandshake
} from 'lucide-react';

interface PageProps {
  params: {
    businessSlug: string;
  };
}

const FONT_FAMILIES: Record<string, string> = {
  inter: "'Inter', sans-serif",
  outfit: "'Outfit', sans-serif",
  jakarta: "'Plus Jakarta Sans', sans-serif",
  playfair: "'Playfair Display', serif",
  roboto: "'Roboto', sans-serif",
};

const TONE_OPTIONS: { id: 'patient' | 'grateful' | 'professional' | 'family'; label: string; icon: string }[] = [
  { id: 'patient', label: 'Friendly & Warm', icon: '😊' },
  { id: 'grateful', label: 'Thankful & Pleased', icon: '🙏' },
  { id: 'professional', label: 'Professional & Detailed', icon: '💼' },
  { id: 'family', label: 'Family-Friendly', icon: '👨‍👩‍👧‍👦' },
];

export default function CustomerBusinessPage({ params }: PageProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [attributes, setAttributes] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Flow States
  const [rating, setRating] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'google' | 'private'>('google');

  // Private Feedback States
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [comments, setComments] = useState('');
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Review Assistant States
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<'patient' | 'grateful' | 'professional' | 'family'>('patient');
  const [generatedReview, setGeneratedReview] = useState<string>('');
  const [reviewCopied, setReviewCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPageData() {
      try {
        const b = await db.getBusinessBySlug(params.businessSlug);
        if (!b) {
          setLoading(false);
          return;
        }
        setBusiness(b);
        const sList = await db.getServices(b.id);
        setServices(sList);
        const attrs = await db.getAttributes(b.category, b.id);
        setAttributes(attrs);
      } catch (err) {
        console.error('Error loading business page:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, [params.businessSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FBFC] px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#005A63] border-t-transparent"></div>
          <p className="text-sm font-semibold text-gray-600 animate-pulse">Loading review experience...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FBFC] px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#005A63] mb-2">Business Page Not Found</h1>
        <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
          The requested review page does not exist or has been removed.
        </p>
        <Button onClick={() => (window.location.href = '/')}>Return Home</Button>
      </div>
    );
  }

  // Draft Mode handling for public customers
  if (business.status === 'draft') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FBFC] px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{business.name}</h1>
        <Badge variant="accent" className="mb-4">Page Under Setup / Draft Mode</Badge>
        <p className="text-sm text-gray-600 max-w-md leading-relaxed mb-6">
          This review page is currently being configured by the business owner and will be published live soon.
        </p>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>Return Home</Button>
      </div>
    );
  }

  const threshold = business.minGoogleStarsThreshold || 4;
  const tmpl = business.template || 'modern';
  const fontFam = FONT_FAMILIES[business.fontFamily || 'inter'] || FONT_FAMILIES.inter;
  const isDark = business.themeMode === 'dark' || tmpl === 'bold';

  // Generate review text dynamically
  const generateReviewText = (
    attrsToUse: string[],
    serviceChoice: string,
    toneChoice: 'patient' | 'grateful' | 'professional' | 'family'
  ) => {
    if (!business) return;
    const finalAttrs = attrsToUse.length > 0 ? attrsToUse : (attributes.length > 0 ? [attributes[0].value] : []);
    const res = ReviewEngine.generate({
      business: {
        name: business.name,
        city: business.city,
        category: business.category,
        googleReviewUrl: business.googleReviewUrl,
      },
      serviceName: serviceChoice,
      selectedAttributes: finalAttrs,
      tone: toneChoice,
    });
    setGeneratedReview(res.reviewText);
    setReviewCopied(false);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setReviewCopied(false);

    if (newRating >= threshold) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [business.primaryColor || '#005A63', business.accentColor || '#F7B500', '#F7B500'],
      });
    }

    const initialAttrs = selectedAttrs.length > 0 ? selectedAttrs : (attributes.length > 0 ? [attributes[0].value] : []);
    if (selectedAttrs.length === 0 && attributes.length > 0) {
      setSelectedAttrs(initialAttrs);
    }
    generateReviewText(initialAttrs, selectedService, selectedTone);
  };

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const toggleAttribute = (attr: string) => {
    const nextAttrs = selectedAttrs.includes(attr)
      ? selectedAttrs.filter((a) => a !== attr)
      : [...selectedAttrs, attr];
    setSelectedAttrs(nextAttrs);
    generateReviewText(nextAttrs, selectedService, selectedTone);
  };

  const handleServiceChange = (serviceName: string) => {
    setSelectedService(serviceName);
    generateReviewText(selectedAttrs, serviceName, selectedTone);
  };

  const handleToneChange = (toneChoice: 'patient' | 'grateful' | 'professional' | 'family') => {
    setSelectedTone(toneChoice);
    generateReviewText(selectedAttrs, selectedService, toneChoice);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await db.submitFeedback({
        businessId: business.id,
        rating: rating || 3,
        customerName,
        customerPhone,
        selectedIssues,
        comments,
        callbackRequested,
      });
      setFeedbackSubmitted(true);
      setToastMessage('Thank you! Your private note has been shared directly with management.');
    } catch (err) {
      console.error('Feedback submit error:', err);
      setToastMessage('We could not save your feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCopyReview = async () => {
    const textToCopy = generatedReview || `Great experience at ${business.name}! Highly recommended.`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setReviewCopied(true);
      setToastMessage('✓ Review copied to clipboard! Tap "Open Google Reviews" below to paste.');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      setToastMessage('Could not auto-copy. Please select and copy text manually.');
    }
  };

  const handleCopyAndOpenGoogle = () => {
    const textToCopy = generatedReview || `Great experience at ${business.name}! Highly recommended.`;

    // 1. Auto copy text to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch((err) => {
        console.error('Clipboard copy failed:', err);
      });
    }

    setReviewCopied(true);

    // 2. Track review generation in background
    db.trackReviewGeneration({
      businessId: business.id,
      rating: rating || 5,
      selectedAttributes: selectedAttrs,
      tone: selectedTone,
      generatedText: textToCopy,
      wasEdited: false,
      wasCopied: true,
      googleClicked: true,
    }).catch((err) => {
      console.error('Track review generation error:', err);
    });

    if (!business.googleReviewUrl) {
      setToastMessage('Google Review link is not configured for this business.');
      return;
    }

    setToastMessage('✓ Review copied to clipboard! Opening Google Reviews...');
    window.open(business.googleReviewUrl, '_blank');
  };

  const hasGoogleUrl = Boolean(business.googleReviewUrl && business.googleReviewUrl.trim().length > 0);

  return (
    <div
      style={{ fontFamily: fontFam }}
      className={`min-h-screen pb-16 transition-colors ${
        tmpl === 'glass'
          ? 'bg-gradient-to-b from-[#005A63]/15 via-teal-900/10 to-[#F8FBFC] text-gray-900'
          : tmpl === 'bold'
          ? 'bg-slate-950 text-white'
          : tmpl === 'classic'
          ? 'bg-[#FDFBF7] text-gray-900'
          : isDark
          ? 'bg-gray-950 text-white'
          : 'bg-[#F8FBFC] text-gray-900'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
        </div>
      )}

      {/* Main Container - Mobile Centric */}
      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        
        {/* Cover & Brand Banner */}
        <Card
          className={`overflow-hidden p-0 transition-all ${
            tmpl === 'glass'
              ? 'rounded-3xl backdrop-blur-md bg-white/80 border border-white/60 shadow-xl'
              : tmpl === 'classic'
              ? 'rounded-xl border-2 border-[#005A63]/40 bg-white shadow-md'
              : tmpl === 'minimal'
              ? 'rounded-none border-b-2 border-gray-200 bg-white shadow-none'
              : tmpl === 'bold'
              ? 'rounded-3xl border-4 border-[#005A63] bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl'
              : `rounded-2xl border-t-8 shadow-card ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}`
          }`}
          style={{ borderTopColor: tmpl === 'modern' ? business.primaryColor : undefined }}
        >
          {business.coverImageUrl ? (
            <div className="relative h-36 sm:h-48 w-full bg-gray-100 overflow-hidden">
              <img
                src={business.coverImageUrl}
                alt={business.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ) : (
            <div className="h-20 w-full flex items-center justify-center" style={{ backgroundColor: business.secondaryColor || '#E6F4F1' }}>
              <Sparkles className="w-8 h-8 opacity-30" style={{ color: business.primaryColor || '#005A63' }} />
            </div>
          )}

          <div className="p-5 text-center relative">
            {business.logoUrl && (
              <div className="mb-3 inline-block p-2 rounded-2xl bg-white shadow-md -mt-12 relative z-10 border border-gray-100">
                <img src={business.logoUrl} alt={business.name} className="h-14 w-auto object-contain mx-auto" />
              </div>
            )}

            <h1
              className="text-2xl font-extrabold tracking-tight mb-1"
              style={{ color: tmpl === 'bold' ? '#38BDF8' : (isDark ? '#FFFFFF' : business.primaryColor || '#005A63') }}
            >
              {business.name}
            </h1>

            {business.tagline ? (
              <p className="text-xs font-semibold text-gray-500 mb-2">{business.tagline}</p>
            ) : (
              <p className="text-xs font-semibold text-gray-400 mb-2">
                {business.category} {business.city ? `• ${business.city}` : ''}
              </p>
            )}

            {business.description && (
              <p className={`text-xs leading-relaxed max-w-md mx-auto mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {business.description}
              </p>
            )}

            {(business.phone || business.address) && (
              <div className={`flex flex-wrap items-center justify-center gap-3 text-xs font-medium pt-2 border-t border-gray-100 ${isDark ? 'text-gray-400 border-gray-800' : 'text-gray-500'}`}>
                {business.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#005A63]" />
                    <span>{business.phone}</span>
                  </div>
                )}
                {business.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#005A63]" />
                    <span>{business.address}{business.city ? `, ${business.city}` : ''}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* STEP 1: Star Rating Selection Card */}
        <Card
          className={`text-center p-6 transition-all ${
            tmpl === 'glass'
              ? 'rounded-3xl backdrop-blur-md bg-white/80 border border-white/60 shadow-xl'
              : tmpl === 'bold'
              ? 'rounded-3xl border-2 border-amber-400 bg-gray-900 text-white shadow-lg'
              : tmpl === 'minimal'
              ? 'rounded-none border-b border-gray-200 bg-white shadow-none'
              : isDark
              ? 'bg-gray-900 border border-gray-800 rounded-2xl shadow-card'
              : 'bg-white shadow-card rounded-2xl'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-3">
            <span>Step 1 of 3</span>
          </div>

          <h2 className="text-xl font-extrabold mb-1" style={{ color: tmpl === 'bold' ? '#FACC15' : (isDark ? '#FFFFFF' : business.primaryColor || '#005A63') }}>
            How Was Your Experience Today?
          </h2>
          <p className={`text-xs mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Tap stars below to rate {business.name}
          </p>

          <RatingStars value={rating} onChange={handleRatingChange} size="xl" showLabel={true} />
        </Card>

        {/* AFTER RATING: REVIEW GENERATOR & PRIVATE FEEDBACK */}
        {rating > 0 && (
          <div className="space-y-4 animate-fade-in">
            {/* GOOGLE REVIEW PATH (For ratings >= owner threshold) */}
            {rating >= threshold && (
              <Card className={`p-6 shadow-card ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}`}>
                
                {/* STEP 2: Highlight Selection */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#005A63] text-xs font-bold">
                      <span>Step 2 of 3</span>
                    </div>
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>What stood out to you?</h3>
                  </div>
                  <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select things that best describe your experience to generate your review text.
                  </p>

                  {/* Optional Service Selector */}
                  {services.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Service Received (Optional)
                      </label>
                      <select
                        value={selectedService}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#005A63] text-gray-800"
                      >
                        <option value="">-- Select Service --</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Highlights Grid */}
                  {attributes.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        Key Highlights
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attributes.map((attr) => {
                          const isSelected = selectedAttrs.includes(attr.value);
                          return (
                            <button
                              key={attr.value}
                              type="button"
                              onClick={() => toggleAttribute(attr.value)}
                              className={`px-3.5 py-3 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between min-h-[44px] ${
                                isSelected
                                  ? 'border-[#005A63] bg-[#E6F4F1] text-[#005A63] shadow-xs'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <span>{attr.label}</span>
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-[#005A63] shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tone Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                      Review Style & Tone
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TONE_OPTIONS.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToneChange(t.id)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                            selectedTone === t.id
                              ? 'border-[#005A63] bg-[#005A63] text-white shadow-xs'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{t.icon}</span>
                          <span className="truncate">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* STEP 3: Review Text Area & Single Auto-Copy Action */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <span>Step 3 of 3</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#005A63]">Your Review Text</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => generateReviewText(selectedAttrs, selectedService, selectedTone)}
                      className="text-xs text-[#005A63] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    Feel free to edit anything below before posting to Google:
                  </p>

                  <Textarea
                    value={generatedReview}
                    onChange={(e) => {
                      setGeneratedReview(e.target.value);
                      setReviewCopied(false);
                    }}
                    className="bg-gray-50/90 border-[#005A63]/30 font-sans text-sm leading-relaxed text-gray-900 rounded-xl"
                    rows={4}
                  />

                  {/* Copy Status Badge */}
                  {reviewCopied && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Review text automatically copied! Paste it into your Google Review.</span>
                    </div>
                  )}

                  {!hasGoogleUrl && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Google Review link is being configured by the business owner.</span>
                    </div>
                  )}

                  {/* SINGLE AUTOMATIC COPY & OPEN GOOGLE REVIEWS BUTTON */}
                  <div className="mt-5">
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      disabled={!hasGoogleUrl}
                      onClick={handleCopyAndOpenGoogle}
                      className="font-bold flex items-center justify-center gap-2 py-4 shadow-lg text-base"
                    >
                      <span>Copy & Open Google Reviews</span>
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* PRIVATE FEEDBACK FORM (For ratings < owner threshold) */}
            {rating > 0 && rating < threshold && (
              <Card className={`p-6 shadow-card ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white'}`}>
                {feedbackSubmitted ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-teal-50 text-[#005A63] flex items-center justify-center mx-auto mb-3">
                      <HeartHandshake className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#005A63] mb-2">Thank You For Your Feedback</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-6 max-w-sm mx-auto">
                      Your feedback has been recorded safely and shared privately with the management of {business.name}.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setFeedbackSubmitted(false)}>
                      Submit Additional Notes
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-5 h-5 text-[#005A63]" />
                      <h3 className="text-base font-bold text-gray-900">Send Private Note to Owner</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      Your response goes directly to business management to help resolve your concern.
                    </p>

                    {/* Common Issues Selector */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        What could be improved? (Optional)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Waiting Time',
                          'Staff Behaviour',
                          'Billing Process',
                          'Cleanliness',
                          'Service Delay',
                          'Communication',
                          'Facility Quality',
                          'Other Issue',
                        ].map((issue) => {
                          const isChecked = selectedIssues.includes(issue);
                          return (
                            <button
                              key={issue}
                              type="button"
                              onClick={() => toggleIssue(issue)}
                              className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold border transition-all min-h-[40px] ${
                                isChecked
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {isChecked ? '✓ ' : '+ '}{issue}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <Textarea
                        label="Describe your experience"
                        placeholder="Tell us what happened so we can make it right..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={3}
                      />

                      <Input
                        label="Name (Optional)"
                        placeholder="Enter your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />

                      <Input
                        label="Phone Number (Optional for callback)"
                        placeholder="Enter contact number"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>

                    {/* Callback Checkbox */}
                    <div className="mb-5 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={callbackRequested}
                          onChange={(e) => setCallbackRequested(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#005A63] rounded"
                        />
                        <span className="text-xs text-amber-900 font-medium leading-tight">
                          <strong>Request a Call Back</strong>. I would like management to contact me directly about this issue.
                        </span>
                      </label>
                    </div>

                    <Button variant="primary" fullWidth size="lg" type="submit" disabled={submittingFeedback}>
                      {submittingFeedback ? 'Sending Feedback...' : 'Submit Private Note'}
                    </Button>
                  </form>
                )}
              </Card>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
