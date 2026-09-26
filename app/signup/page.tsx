'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon, Building2, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setInfoMessage(null);

    if (!email || !password || !fullName || !businessName) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const user = await db.signUpUser(email, password, fullName);
      if (!user) throw new Error('User signup failed');

      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `biz-${Date.now()}`;

      // Create initial business record bound to the new owner
      await db.createBusiness(
        {
          name: businessName,
          slug,
          category: 'services',
          email,
          phone: '',
          tagline: `⭐ Trusted Service in Your City`,
          description: `Welcome to ${businessName}. We are committed to providing top-quality service.`,
          primaryColor: '#005A63',
          secondaryColor: '#D1ECF1',
          accentColor: '#EA1B23',
          googleReviewUrl: 'https://maps.google.com',
          status: 'published',
        },
        user.id
      );

      const currentUser = await db.getCurrentUser();
      if (currentUser) {
        router.push('/dashboard');
      } else {
        setInfoMessage('Account created successfully! Please check your email to confirm your account, then log in.');
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('rate limit') || msg.includes('429') || msg.includes('29 seconds') || msg.includes('security purposes')) {
        setError('Security rate limit reached. Please wait 30 seconds before trying again.');
      } else if (msg.includes('Email not confirmed')) {
        setInfoMessage('Account created! Please check your email to confirm your account before logging in.');
      } else {
        setError(msg || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFC] flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#005A63] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            C
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#005A63]">CUSTO</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Create Your Business Account</h1>
        <p className="text-xs text-gray-500 mt-1">Collect genuine customer reviews & boost Google ratings.</p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-card">
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-5 p-3.5 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-[#005A63] font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-[#005A63]" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Business Name"
            placeholder="e.g. Apex Dental Care"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />

          <Input
            label="Work Email"
            type="email"
            placeholder="john@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account & Continue'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#005A63] hover:underline">
            Log In Here
          </Link>
        </div>
      </Card>
    </div>
  );
}
