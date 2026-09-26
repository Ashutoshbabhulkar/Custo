import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, MessageSquare, QrCode, Sparkles, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#005A63] flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              C
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#005A63]">CUSTO</span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-[#EA1B23]">Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/aas-hospital">
              <Button variant="outline" size="sm">
                View AAS Hospital Demo
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="accent" size="sm">
                Onboard Business
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center">
        <Badge variant="primary" className="mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Customer Feedback & Reputation Platform
        </Badge>

        <h1 className="text-4xl md:text-6xl font-extrabold text-[#005A63] tracking-tight leading-tight max-w-3xl mb-6">
          Know what your <span className="text-[#EA1B23]">customers think.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed mb-10">
          Custo helps businesses collect genuine feedback, empowers customers to write polished reviews in seconds, and delivers actionable customer experience insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-16">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" fullWidth>
              Setup Your Business <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" fullWidth>
              View Admin Dashboard
            </Button>
          </Link>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <Card className="hover:shadow-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#D1ECF1] text-[#005A63] flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant QR Feedback</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Place mobile-first QR codes across departments, reception, or billing to collect immediate, genuine feedback in under 30 seconds.
            </p>
          </Card>

          <Card className="hover:shadow-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#EA1B23] flex items-center justify-center mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Custo Review Assistant</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Help real customers articulate genuine experiences without fabrication. Varied sentence structures, local SEO context, and one-click Google posting.
            </p>
          </Card>

          <Card className="hover:shadow-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Experience Analytics</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Track ratings, feedback categories, private issue trends, and location performance in a real-time multi-tenant admin dashboard.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-[#005A63]">CUSTO</strong> Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/aas-hospital" className="hover:text-[#005A63]">AAS Hospital Demo</Link>
            <Link href="/dashboard" className="hover:text-[#005A63]">Dashboard</Link>
            <Link href="/onboarding" className="hover:text-[#005A63]">Onboarding</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
