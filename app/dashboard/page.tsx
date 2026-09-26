'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Business, FeedbackResponse, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import {
  BarChart3,
  Star,
  MessageSquare,
  Phone,
  QrCode,
  Filter,
  ExternalLink,
  Edit3,
  LogOut,
  User as UserIcon,
  Building2,
  Sparkles,
  AlertTriangle,
  Trash2,
  ShieldAlert,
} from 'lucide-react';

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [ownerBusinesses, setOwnerBusinesses] = useState<Business[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile & Delete Modal States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const user = await db.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const owned = await db.getBusinessesByOwnerId(user.id);
      if (!owned || owned.length === 0) {
        router.push('/onboarding');
        return;
      }

      setOwnerBusinesses(owned);

      const savedId = typeof window !== 'undefined' ? localStorage.getItem(`custo_active_biz_${user.id}`) : null;
      const active = (savedId && owned.find((b) => b.id === savedId)) || owned[0];
      setBusiness(active);

      const data = await db.getAnalytics(active.id);
      setAnalytics(data);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const handleSelectBusiness = async (selectedId: string) => {
    const selected = ownerBusinesses.find((b) => b.id === selectedId);
    if (selected && currentUser) {
      localStorage.setItem(`custo_active_biz_${currentUser.id}`, selected.id);
      setBusiness(selected);
      setLoading(true);
      const data = await db.getAnalytics(selected.id);
      setAnalytics(data);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await db.signOutUser();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      setDeletingAccount(true);
      await db.deleteUserAccount(currentUser.id);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`custo_active_biz_${currentUser.id}`);
      }
      router.push('/login');
    } catch (err: any) {
      console.error('Delete account error:', err);
      setToastMessage('Failed to delete account. Please try again.');
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FBFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#005A63] border-t-transparent"></div>
      </div>
    );
  }

  if (!business || !analytics) return null;

  const filteredFeedback = (analytics.recentFeedback || []).filter((f: any) =>
    filterRating === 0 ? true : f.rating === filterRating
  );

  return (
    <div className="min-h-screen bg-[#F8FBFC] pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005A63] text-white flex items-center justify-center font-extrabold text-xl">
              C
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-[#005A63] leading-none">Custo Admin</h1>
              {ownerBusinesses.length > 1 ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#005A63]" />
                  <select
                    value={business.id}
                    onChange={(e) => handleSelectBusiness(e.target.value)}
                    className="text-xs font-bold text-[#005A63] bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 focus:outline-none cursor-pointer"
                  >
                    {ownerBusinesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-xs text-gray-500 font-medium">{business.name}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/review-page">
              <Button variant="outline" size="sm">
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Review Page
              </Button>
            </Link>

            <Link href="/dashboard/qr">
              <Button variant="accent" size="sm">
                <QrCode className="w-4 h-4 mr-1.5" /> QR & Poster
              </Button>
            </Link>

            <Link href={`/${business.slug}`} target="_blank">
              <Button variant="secondary" size="sm">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setProfileModalOpen(true)}>
                  <UserIcon className="w-3.5 h-3.5 mr-1.5 text-[#005A63]" /> Profile & Account
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} title="Log Out">
                  <LogOut className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">Log In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Business Status & Quick Action Banner */}
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider ${
                business.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {business.status === 'published' ? '● Live & Published' : '○ Private Draft'}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {business.status === 'published'
                ? `Active workspace for ${business.name}. Review flow live & accepting customer responses.`
                : 'Page is in draft mode. Click Publish Live in the editor when ready.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/${business.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                View Live Customer Page <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Responses</span>
              <MessageSquare className="w-5 h-5 text-[#005A63]" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{analytics.totalResponses}</div>
            <span className="text-xs text-emerald-600 font-medium">Recorded via QR & Review Flow</span>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Rating</span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{analytics.avgRating} <span className="text-lg font-normal text-gray-400">/ 5</span></div>
            <span className="text-xs text-gray-500 font-medium">Customer Sentiment Score</span>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Callback Requests</span>
              <Phone className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#EA1B23]">{analytics.callbackRequests}</div>
            <span className="text-xs text-gray-500 font-medium">Private Feedback Needing Action</span>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">5★ Google Reviews Copied</span>
              <QrCode className="w-5 h-5 text-[#005A63]" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{analytics.totalReviewsCopied || 0}</div>
            <span className="text-xs text-gray-500 font-medium">{analytics.totalQRScans || 0} Total QR Scans</span>
          </Card>
        </div>

        {/* Feedback & Review Activity Logs Section */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customer Feedback & Google Review Logs</h2>
              <p className="text-xs text-gray-500">Live response activity stream for <strong className="text-[#005A63]">{business.name}</strong>.</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <span className="text-xs font-bold text-gray-500 px-2 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {[0, 5, 4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRating(r)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterRating === r ? 'bg-[#005A63] text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r === 0 ? 'All' : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Logs Table & Empty State */}
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-2xl bg-[#D1ECF1]/60 text-[#005A63] flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">No activity recorded for this rating filter</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4 leading-relaxed">
                Display your QR poster at your reception desk. When customers scan, copy 5-star reviews, or submit feedback, it will appear here.
              </p>
              <Link href="/dashboard/qr">
                <Button variant="accent" size="sm">
                  <QrCode className="w-4 h-4 mr-1.5" /> Get Printable QR Poster
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Rating & Source</th>
                    <th className="p-3.5">Customer / Highlights</th>
                    <th className="p-3.5">Review Text / Issues</th>
                    <th className="p-3.5">Callback Needed</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFeedback.map((f: any) => (
                    <tr key={f.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-extrabold text-amber-500 text-sm flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{f.rating} ★</span>
                        </div>
                        {f.type === 'google_review' ? (
                          <Badge variant="primary" size="sm">
                            Google Review Copied ↗
                          </Badge>
                        ) : (
                          <Badge variant="accent" size="sm">
                            Private Note 🔒
                          </Badge>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-gray-900">{f.customerName}</div>
                        {f.customerPhone && (
                          <div className="text-gray-400 font-mono text-[11px]">{f.customerPhone}</div>
                        )}
                        {f.selectedAttributes && f.selectedAttributes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {f.selectedAttributes.map((attr: string) => (
                              <span key={attr} className="text-[10px] bg-teal-50 text-[#005A63] font-semibold px-2 py-0.5 rounded-md border border-teal-200">
                                ✓ {attr}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 max-w-sm text-gray-700 font-medium">
                        {f.selectedIssues && f.selectedIssues.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {f.selectedIssues.map((issue: string) => (
                              <Badge key={issue} variant="accent" size="sm">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="leading-relaxed text-xs italic bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                          &ldquo;{f.comments || 'No written text provided'}&rdquo;
                        </p>
                      </td>

                      <td className="p-3.5">
                        {f.callbackRequested ? (
                          <Badge variant="accent" size="sm">YES — Call Requested</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="p-3.5 text-gray-400 font-mono text-[11px]">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
        </div>
      )}

      {/* Profile & Account Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="👤 Profile & Account Settings"
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#005A63] text-white flex items-center justify-center font-bold text-lg">
              {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">{currentUser?.fullName || 'User'}</h3>
              <p className="text-xs text-gray-600">{currentUser?.email}</p>
              <span className="text-[10px] text-gray-400 font-medium">Account ID: {currentUser?.id}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#005A63]" /> My Businesses ({ownerBusinesses.length})
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {ownerBusinesses.map((b) => (
                <div key={b.id} className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-800">{b.name}</div>
                    <div className="text-gray-500 font-mono text-[10px]">{b.slug}</div>
                  </div>
                  <Badge variant="primary">{b.category.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Button variant="outline" fullWidth onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <h4 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Danger Zone — Delete Account
              </h4>
              <p className="text-[11px] text-red-700 mb-3 leading-relaxed">
                Permanently delete your user account and all associated business pages, reviews, QR codes, and feedback data.
              </p>
              <Button
                variant="accent"
                size="sm"
                className="bg-red-600 hover:bg-red-700 border-red-600 text-white"
                onClick={() => {
                  setProfileModalOpen(false);
                  setDeleteConfirmModalOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete Account & Data
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmModalOpen}
        onClose={() => setDeleteConfirmModalOpen(false)}
        title="⚠️ Confirm Permanent Account Deletion"
        maxWidth="md"
      >
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Are you absolutely sure?</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
              This action <strong className="text-red-600">CANNOT BE UNDONE</strong>. It will permanently remove your account (<strong>{currentUser?.email}</strong>), along with all owned business pages, Google review generations, and customer feedback.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteConfirmModalOpen(false)} disabled={deletingAccount}>
              Cancel
            </Button>
            <Button
              variant="accent"
              fullWidth
              className="bg-red-600 hover:bg-red-700 border-red-600 text-white"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? 'Deleting...' : 'Yes, Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
