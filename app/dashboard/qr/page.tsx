'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { Business, QRCodeItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import {
  QrCode,
  Printer,
  Download,
  ArrowLeft,
  Plus,
  Building2,
  Copy,
  Sparkles,
  Check,
  Star,
  Smartphone
} from 'lucide-react';

const HEADLINE_OPTIONS = [
  "We’d Love Your Feedback",
  "Share Your Experience",
  "How Was Your Visit Today?",
  "Rate Your Experience",
];

export default function QRPosterGeneratorPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [qrList, setQrList] = useState<QRCodeItem[]>([]);
  const [selectedQr, setSelectedQr] = useState<QRCodeItem | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedHeadline, setSelectedHeadline] = useState(HEADLINE_OPTIONS[0]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadQRData() {
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
        let qrs = await db.getQRCodesByBusiness(biz.id);
        if (qrs.length === 0) {
          const mainQr = await db.createQRCode(biz.id, 'Main Reception Desk', `${biz.slug}-main`);
          qrs = [mainQr];
        }
        setQrList(qrs);
        setSelectedQr(qrs[0]);
      }
      setLoading(false);
    }

    loadQRData();
  }, []);

  useEffect(() => {
    if (selectedQr && business) {
      const dynamicUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/q/${selectedQr.code}`
        : `https://custo.app/q/${selectedQr.code}`;

      QRCode.toDataURL(dynamicUrl, {
        width: 600,
        margin: 2,
        color: { dark: business.primaryColor || '#005A63', light: '#FFFFFF' }
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [selectedQr, business]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FBFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#005A63] border-t-transparent"></div>
      </div>
    );
  }

  if (!business || !selectedQr) return null;

  const handleCreateNewQR = async () => {
    if (!newCampaignName.trim()) return;
    const newQr = await db.createQRCode(business.id, newCampaignName.trim());
    const updatedList = await db.getQRCodesByBusiness(business.id);
    setQrList(updatedList);
    setSelectedQr(newQr);
    setNewCampaignName('');
    setToastMessage(`New location QR "${newQr.name}" generated!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    if (!selectedQr) return;
    const dynamicUrl = `${window.location.origin}/q/${selectedQr.code}`;
    try {
      await navigator.clipboard.writeText(dynamicUrl);
      setToastMessage('✓ Direct QR Link copied to clipboard!');
    } catch (e) {
      setToastMessage(`QR Link: ${dynamicUrl}`);
    }
  };

  const handleDownloadPoster = async () => {
    if (!qrDataUrl || !business || !selectedQr) return;
    setDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const W = 1200;
      const H = 1697; // A5 aspect ratio 1:1.414 at 300 DPI density
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const brandColor = business.primaryColor || '#005A63';

      // 1. Solid White Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      // Outer Rounded Accent Border
      ctx.strokeStyle = brandColor;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.roundRect(40, 40, W - 80, H - 80, 44);
      ctx.stroke();

      // 2. Top Header - CUSTO.AI (Left) & CUSTOMER REVIEW CARD (Right)
      // Left Icon Badge
      ctx.fillStyle = brandColor;
      ctx.beginPath();
      ctx.roundRect(90, 85, 48, 48, 14);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('C', 114, 119);

      // Left Brand Name
      ctx.fillStyle = brandColor;
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CUSTO.AI', 150, 118);

      // Right Category Label
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('CUSTOMER REVIEW CARD', W - 90, 118);

      // Header Divider Line
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(90, 155);
      ctx.lineTo(W - 90, 155);
      ctx.stroke();

      let currentY = 230;

      // 3. Business Logo or Initial Circle
      if (business.logoUrl) {
        await new Promise<void>((resolve) => {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            const maxW = 300;
            const maxH = 140;
            const aspect = logoImg.width / logoImg.height;
            let drawW = maxW;
            let drawH = maxW / aspect;
            if (drawH > maxH) {
              drawH = maxH;
              drawW = maxH * aspect;
            }
            ctx.drawImage(logoImg, W / 2 - drawW / 2, currentY, drawW, drawH);
            currentY += drawH + 30;
            resolve();
          };
          logoImg.onerror = () => {
            currentY += 20;
            resolve();
          };
          logoImg.src = business.logoUrl!;
        });
      } else {
        ctx.fillStyle = brandColor;
        ctx.beginPath();
        ctx.arc(W / 2, currentY + 45, 55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 52px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(business.name.charAt(0).toUpperCase(), W / 2, currentY + 63);
        currentY += 130;
      }

      // 4. Business Name & Placement Label
      ctx.fillStyle = brandColor;
      ctx.font = '900 52px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(business.name, W / 2, currentY);
      currentY += 45;

      ctx.fillStyle = '#64748B';
      ctx.font = '600 24px sans-serif';
      ctx.fillText(`${selectedQr.campaignName || selectedQr.name}`, W / 2, currentY);
      currentY += 75;

      // 5. Headline, Stars & Subtitle
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 46px sans-serif';
      ctx.fillText(selectedHeadline, W / 2, currentY);
      currentY += 55;

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText('★ ★ ★ ★ ★', W / 2, currentY);
      currentY += 50;

      ctx.fillStyle = '#475569';
      ctx.font = '500 22px sans-serif';
      ctx.fillText('Scan the QR code below with your phone camera', W / 2, currentY);
      currentY += 30;
      ctx.fillText('to share your review with us.', W / 2, currentY);
      currentY += 45;

      // 6. QR Code Dashed Quiet Zone Container Box
      const boxW = 560;
      const boxH = 560;
      const boxX = W / 2 - boxW / 2;
      const boxY = currentY;

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 40);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      await new Promise<void>((resolve) => {
        const qrImg = new Image();
        qrImg.onload = () => {
          const qrSize = 420;
          ctx.drawImage(qrImg, W / 2 - qrSize / 2, boxY + 35, qrSize, qrSize);
          resolve();
        };
        qrImg.src = qrDataUrl;
      });

      // QR Link Subtext below QR code inside box
      ctx.fillStyle = '#94A3B8';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`/q/${selectedQr.code}`, W / 2, boxY + boxH - 35);

      // 7. Footer Divider & Text
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(90, H - 145);
      ctx.lineTo(W - 90, H - 145);
      ctx.stroke();

      if (business.address || business.city) {
        ctx.fillStyle = '#64748B';
        ctx.font = '600 22px sans-serif';
        ctx.fillText(`${business.address ? business.address + ', ' : ''}${business.city || ''}`, W / 2, H - 95);
      }

      ctx.fillStyle = brandColor;
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Powered by Custo.ai • www.custo.ai', W / 2, H - 55);

      // Trigger A5 PNG download
      const posterDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${business.slug}-custo-poster-a5.png`;
      link.href = posterDataUrl;
      link.click();

      setToastMessage('✓ A5 Print-Ready Custo poster downloaded successfully!');
    } catch (err) {
      console.error('Poster generation error:', err);
      setToastMessage('Error downloading poster. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFC] pb-16">
      {/* Printable A5 CSS override */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A5 portrait;
                margin: 0;
              }
              body {
                background: #FFFFFF !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .print\\:hidden {
                display: none !important;
              }
              .print-poster-target {
                box-shadow: none !important;
                border: 8px solid ${business.primaryColor || '#005A63'} !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: none !important;
                border-radius: 0 !important;
                padding: 2.5rem !important;
                margin: 0 !important;
              }
            }
          `,
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 print:hidden">
          <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = '/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
            <h1 className="font-extrabold text-xl text-[#005A63]">Printable QR Poster Generator</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-1.5" /> Copy QR Link
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownloadPoster} disabled={downloading}>
              <Download className="w-4 h-4 mr-1.5" /> {downloading ? 'Preparing...' : 'Download Poster (PNG)'}
            </Button>
            <Button variant="accent" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" /> Print Poster (A5 Page)
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Sidebar */}
          <Card className="p-6 lg:col-span-1 print:hidden space-y-6">
            
            {/* Headline Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Poster Headline Text
              </label>
              <select
                value={selectedHeadline}
                onChange={(e) => setSelectedHeadline(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#005A63]"
              >
                {HEADLINE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Location / Placement QR List */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#005A63]" /> Location / Counter QRs
              </h2>

              <div className="space-y-2 mb-4">
                {qrList.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQr(q)}
                    className={`w-full p-3 text-left rounded-xl border transition-all text-xs flex items-center justify-between ${
                      selectedQr.id === q.id
                        ? 'border-[#005A63] bg-[#E6F4F1] text-[#005A63] font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <span>{q.campaignName || q.name}</span>
                    <Badge variant="accent" size="sm">{q.scanCount || 0} scans</Badge>
                  </button>
                ))}
              </div>

              {/* Add New Location */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Create New Placement QR
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. OPD, Billing, Counter 2"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                  />
                  <Button variant="primary" size="sm" onClick={handleCreateNewQR}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <Button variant="primary" fullWidth size="sm" onClick={handleDownloadPoster} disabled={downloading}>
                <Download className="w-4 h-4 mr-2" /> Download Poster (High-Res PNG)
              </Button>

              <Button variant="outline" fullWidth size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" /> Print Poster (A5 Page)
              </Button>

              <Button variant="secondary" fullWidth size="sm" onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" /> Copy Direct QR Link
              </Button>
            </div>
          </Card>

          {/* Live Poster Preview */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            
            <div className="mb-2 text-xs font-semibold text-gray-500 print:hidden flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Live Print-Ready Poster Preview
            </div>

            <div
              className="print-poster-target w-full max-w-[440px] bg-white rounded-3xl p-7 border-4 shadow-2xl text-center flex flex-col items-center justify-between min-h-[640px] transition-all"
              style={{ borderColor: business.primaryColor || '#005A63' }}
            >
              {/* Custo.ai Header Badge */}
              <div className="w-full flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#005A63] text-white flex items-center justify-center font-extrabold text-xs">
                    C
                  </div>
                  <span className="font-extrabold text-xs tracking-tight text-[#005A63]">CUSTO.AI</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Customer Review Card
                </span>
              </div>

              {/* Business Identity */}
              <div className="mb-2">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={business.name}
                    className="h-14 w-auto mx-auto object-contain mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#005A63] text-white flex items-center justify-center text-xl font-extrabold mx-auto mb-2 shadow-sm">
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h2
                  className="text-2xl font-extrabold tracking-tight mb-0.5"
                  style={{ color: business.primaryColor || '#005A63' }}
                >
                  {business.name}
                </h2>
                <span className="text-xs text-gray-500 font-semibold">{selectedQr.campaignName || selectedQr.name}</span>
              </div>

              {/* Headline & Stars */}
              <div className="my-2">
                <h3 className="text-xl font-black tracking-tight text-gray-900 mb-1">
                  {selectedHeadline}
                </h3>
                <div className="text-2xl text-amber-400 mb-1">★ ★ ★ ★ ★</div>
                <p className="text-xs text-gray-600 font-medium max-w-xs mx-auto leading-relaxed">
                  Scan the QR code below with your phone camera to share your review with us.
                </p>
              </div>

              {/* Large Centered QR Code with Quiet Zone */}
              <div className="p-4 rounded-3xl bg-white border-2 border-dashed border-gray-300 shadow-sm my-3 relative">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="Custo QR Code" className="w-48 h-48 mx-auto" />
                )}
                <div className="mt-2 text-[11px] font-mono text-gray-400 flex items-center justify-center gap-1">
                  <Smartphone className="w-3 h-3 text-[#005A63]" />
                  <span>/q/{selectedQr.code}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-2 pt-3 border-t border-gray-100 w-full text-xs text-gray-500 font-semibold flex flex-col gap-1">
                {business.address && (
                  <span>{business.address}{business.city ? `, ${business.city}` : ''}</span>
                )}
                <span style={{ color: business.primaryColor || '#005A63' }}>
                  Powered by <strong>Custo.ai</strong> • www.custo.ai
                </span>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

