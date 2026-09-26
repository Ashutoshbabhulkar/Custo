'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    try {
      setLoading(true);
      if (isSupabaseConfigured && supabase) {
        const { error: updateErr } = await supabase.auth.updateUser({
          password,
        });
        if (updateErr) throw updateErr;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || 'Failed to update password. Recovery link may be expired.');
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
        <h1 className="text-2xl font-extrabold text-gray-900">Set New Password</h1>
        <p className="text-xs text-gray-500 mt-1">Create a new secure password for your Custo business account.</p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-card">
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-bounce" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Password Updated!</h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Your password has been changed successfully. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Updating Password...' : 'Save New Password'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
