'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);

    try {
      setLoading(true);
      if (isSupabaseConfigured && supabase) {
        const redirectTo = `${window.location.origin}/reset-password/update`;
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (resetErr) throw resetErr;
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to send password reset link. Please try again.');
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
        <h1 className="text-2xl font-extrabold text-gray-900">Reset Password</h1>
        <p className="text-xs text-gray-500 mt-1">Enter your registered email to receive a password reset link.</p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-card text-center">
        {submitted ? (
          <div className="py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Check Your Inbox</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
            </p>
            <Link href="/login">
              <Button variant="outline" fullWidth size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 text-left">
            <Input
              label="Account Email"
              type="email"
              placeholder="owner@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button variant="primary" fullWidth size="lg" type="submit">
              Send Reset Link
            </Button>

            <div className="pt-4 text-center">
              <Link href="/login" className="text-xs text-gray-500 hover:text-[#005A63] inline-flex items-center">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
