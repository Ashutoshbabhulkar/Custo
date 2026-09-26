'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await db.signInUser(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFC] flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#005A63] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            C
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#005A63]">CUSTO</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Welcome Back</h1>
        <p className="text-xs text-gray-500 mt-1">Log in to manage your business review page and feedback.</p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-card">
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="owner@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end text-xs">
            <Link href="/reset-password" className="text-[#005A63] font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Log In'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
          Don't have a business account?{' '}
          <Link href="/signup" className="font-bold text-[#005A63] hover:underline">
            Sign Up Now
          </Link>
        </div>
      </Card>
    </div>
  );
}
