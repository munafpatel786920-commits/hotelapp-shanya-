import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { HotelSettings, UserRole, AppUser } from '../../types/hotel';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Settings,
  Building2,
  Shield,
  Database,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  KeyRound,
  UserPlus,
  Trash2,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Percent,
  FileText,
  Cloud,
  Check
} from 'lucide-react';
import { INDIAN_STATES } from '../../utils/indiaUtils';

export const SettingsManagement: React.FC = () => {
  const {
    data,
    updateSettings,
    exportDataAsJSON,
    importDataFromJSON,
    resetToDefaultData,
    clearAllOperationalData,
    switchRole,
    firebaseSyncStatus,
    lastSyncedAt,
    forceSyncToFirebase
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'backup'>('profile');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearDataConfirmOpen, setIsClearDataConfirmOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<HotelSettings>({ ...data.settings });

  // Keep settingsForm synchronized whenever data.settings changes or loads
  useEffect(() => {
    setSettingsForm({ ...data.settings });
  }, [data.settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataFromJSON(content);
      if (!success) {
        setImportError('Invalid backup file format. Please upload a valid JSON backup.');
      } else {
        setSaveSuccessMsg(true);
        setTimeout(() => setSaveSuccessMsg(false), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              System Configuration (India)
            </span>
            <span className="text-xs text-slate-500">GST Compliance & Master Preferences</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Hotel Settings & Administration</h1>
          <p className="text-xs text-slate-500">Configure Indian hotel business profile, GSTIN, FSSAI license, state rules, user roles, and backups.</p>
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Property Profile & GST</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>User Roles & Access Control</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup, Restore & Reset</span>
        </button>
      </div>

      {/* TAB 1: Hotel Profile & Taxes */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">General Property Information (India)</h3>
              <p className="text-xs text-slate-500">Printed on guest tax invoices, registration forms, and receipts.</p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          {/* Logo Showcase & Brand Emblem */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Logo Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center gap-4">
              {settingsForm.logoUrl ? (
                <img
                  src={settingsForm.logoUrl}
                  alt="AL-KAREEM Logo"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/60 shadow-lg shadow-amber-500/20 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-800 border border-indigo-700 flex items-center justify-center text-white shrink-0">
                  <Building2 className="w-8 h-8 text-amber-400" />
                </div>
              )}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Official Hotel Logo</span>
                <h4 className="text-base font-black tracking-tight text-white uppercase font-display truncate">{settingsForm.hotelName || 'AL-KAREEM'}</h4>
                <p className="text-xs text-indigo-200/80 truncate">{settingsForm.tagline || 'Luxury Indian Hospitality & Comfort'}</p>
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] text-indigo-300 font-semibold mb-1">Logo URL</label>
                <input
                  type="text"
                  value={settingsForm.logoUrl || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                  placeholder="Logo URL..."
                  className="w-full sm:w-36 px-2.5 py-1.5 bg-indigo-900/60 border border-indigo-700 rounded-xl text-xs text-white placeholder:text-indigo-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Authorized Signatory Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center gap-4 border border-indigo-800/40">
              {settingsForm.signatureUrl ? (
                <div className="w-20 h-16 bg-white rounded-2xl flex items-center justify-center p-1.5 border-2 border-amber-400/60 shadow-lg shrink-0">
                  <img
                    src={settingsForm.signatureUrl}
                    alt="Authorized Signatory"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-20 h-16 rounded-2xl bg-indigo-900 border border-indigo-700 flex items-center justify-center text-white shrink-0">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
              )}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Authorized Signatory</span>
                <h4 className="text-sm font-black tracking-tight text-white uppercase font-display truncate">{settingsForm.signatoryTitle || 'S PATEL (General Manager)'}</h4>
                <p className="text-[11px] text-emerald-400 font-medium">Included on all Tax Invoices & Receipts</p>
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] text-indigo-300 font-semibold mb-1">Signatory Title</label>
                <input
                  type="text"
                  value={settingsForm.signatoryTitle || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, signatoryTitle: e.target.value })}
                  placeholder="e.g. S PATEL (General Manager)"
                  className="w-full sm:w-44 px-2.5 py-1.5 bg-indigo-900/60 border border-indigo-700 rounded-xl text-xs text-white placeholder:text-indigo-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hotel / Resort Name *</label>
              <input
                type="text"
                required
                value={settingsForm.hotelName}
                onChange={e => setSettingsForm({ ...settingsForm, hotelName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Tagline / Slogan</label>
              <input
                type="text"
                value={settingsForm.tagline}
                onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City & State (Place of Supply)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settingsForm.city}
                  onChange={e => setSettingsForm({ ...settingsForm, city: e.target.value })}
                  placeholder="City (e.g. Mumbai)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={settingsForm.state}
                  onChange={e => setSettingsForm({ ...settingsForm, state: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {INDIAN_STATES.map(st => (
                    <option key={st.code} value={st.name}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PIN Code & Country</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settingsForm.pincode || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, pincode: e.target.value })}
                  placeholder="PIN Code (e.g. 400001)"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <input
                  type="text"
                  value={settingsForm.country}
                  onChange={e => setSettingsForm({ ...settingsForm, country: e.target.value })}
                  placeholder="India"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telephone / Reception Mobile</label>
              <input
                type="text"
                value={settingsForm.mobile}
                onChange={e => setSettingsForm({ ...settingsForm, mobile: e.target.value })}
                placeholder="+91 22 2288 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={settingsForm.email}
                onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hotel GSTIN (15-digit)</label>
              <input
                type="text"
                value={settingsForm.gstNumber}
                onChange={e => setSettingsForm({ ...settingsForm, gstNumber: e.target.value.toUpperCase() })}
                placeholder="27AAAAA0000A1Z5"
                maxLength={15}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN Card Number</label>
              <input
                type="text"
                value={settingsForm.panNumber || ''}
                onChange={e => setSettingsForm({ ...settingsForm, panNumber: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">FSSAI License No. (Restaurant/Food)</label>
              <input
                type="text"
                value={settingsForm.fssaiNumber || ''}
                onChange={e => setSettingsForm({ ...settingsForm, fssaiNumber: e.target.value })}
                placeholder="14-digit FSSAI number (e.g. 11522000000000)"
                maxLength={14}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Room GST Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settingsForm.taxPercentage}
                onChange={e => setSettingsForm({ ...settingsForm, taxPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard Indian Hotel GST: 12% (Rooms ₹1000-₹7500) or 18% (Rooms &gt;₹7500)</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settingsForm.currencySymbol}
                onChange={e => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Check-In & Check-Out Policy</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settingsForm.checkInTime}
                  onChange={e => setSettingsForm({ ...settingsForm, checkInTime: e.target.value })}
                  placeholder="Check-in 14:00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={settingsForm.checkOutTime}
                  onChange={e => setSettingsForm({ ...settingsForm, checkOutTime: e.target.value })}
                  placeholder="Check-out 11:00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Invoice Disclaimer & Terms (Indian Compliance)</label>
              <textarea
                rows={2}
                value={settingsForm.termsAndConditions}
                onChange={e => setSettingsForm({ ...settingsForm, termsAndConditions: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Authorized Signatory Stamp & Signature URL</label>
              <input
                type="text"
                value={settingsForm.signatureUrl || ''}
                onChange={e => setSettingsForm({ ...settingsForm, signatureUrl: e.target.value })}
                placeholder="https://... or signature image data URL"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">This signature appears on all generated Tax Invoices, Guest Folios, and Payment Receipts.</span>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: User Roles & Access Control */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Active System Operator Roles</h3>
            <p className="text-xs text-slate-500">
              Role-based access matrix (Admin, Manager, Receptionist, Accountant, Housekeeping, Restaurant Staff).
            </p>
          </div>

          {/* Current user switch selector */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px]">Current Active Session:</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{data.currentUser.fullName} ({data.currentUser.username})</h4>
              <p className="text-slate-500">Role: <strong className="text-indigo-600">{data.currentUser.role}</strong> • Email: {data.currentUser.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-semibold">Switch Role Profile:</span>
              <select
                value={data.currentUser.role}
                onChange={e => switchRole(e.target.value as UserRole)}
                className="px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 font-bold rounded-xl focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Accountant">Accountant</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Restaurant Staff">Restaurant Staff</option>
              </select>
            </div>
          </div>

          {/* System Accounts Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Registered System Operator Accounts (लॉगिन विवरण)</h4>
              <span className="text-[11px] text-slate-500 font-medium">Use these emails and passwords to sign in</span>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="p-3 font-semibold">User / Name</th>
                    <th className="p-3 font-semibold">Login Email ID</th>
                    <th className="p-3 font-semibold">Assigned Role</th>
                    <th className="p-3 font-semibold">Default Password</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{u.fullName}</td>
                      <td className="p-3 font-mono text-indigo-600 font-semibold">{u.email || `${u.username}@alkareem.in`}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {u.password || 'admin123'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Google Firebase Live Cloud Sync Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-700/50 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Google Firebase Firestore (Live Cloud Database)</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      firebaseSyncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {firebaseSyncStatus === 'synced' ? 'Connected & Synced' : 'Syncing...'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl">
                    All AL-KAREEM hotel bookings, guest directories, payments, restaurant POS orders, room statuses, and settings are automatically synchronized to Google Cloud Firestore in real-time.
                  </p>
                  {lastSyncedAt && (
                    <p className="text-[11px] text-amber-300/80 mt-1">
                      Last Cloud Synchronization: {lastSyncedAt.toLocaleTimeString()} ({lastSyncedAt.toLocaleDateString()})
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => forceSyncToFirebase()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 ${firebaseSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sync Now to Firebase</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export JSON */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Export Database Backup (JSON)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Download a full standalone JSON export of all hotel rooms, reservations, guest ledgers, staff records, restaurant orders, and financial history.
                </p>
              </div>

              <button
                onClick={exportDataAsJSON}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Database JSON Backup</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Restore Database from JSON</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select a previously exported hotel database JSON file to restore all reservations and hotel operational records instantly.
                </p>
              </div>

              <div>
                {importError && (
                  <p className="text-xs text-rose-600 font-semibold mb-2">{importError}</p>
                )}
                <label className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Choose Backup File (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Clear Operational Sample Data */}
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-amber-900">Clear All Operational Data (Fresh Start)</h3>
                <p className="text-xs text-amber-700/90 mt-1">
                  Removes all sample bookings, guest profiles, payment receipts, dining orders, housekeeping tasks, and expense vouchers. Keeps room catalog, master staff, and menu items ready for live operations.
                </p>
              </div>

              <button
                onClick={() => setIsClearDataConfirmOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          {/* Reset to Default */}
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-rose-900">Reset Application to Initial State</h3>
                <p className="text-xs text-rose-700/80 mt-1">
                  Resets room statuses to Available/Clean, clears all bookings, guests, expenses and restores default settings.
                </p>
              </div>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Operational Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearDataConfirmOpen}
        title="Clear All Bookings & Guest Data?"
        message="Are you sure you want to clear all operational sample data? This will remove all bookings, guest KYC records, billing receipts, restaurant orders, and expenses. Your rooms and hotel settings will remain intact."
        confirmLabel="Yes, Clear All Data"
        isDestructive={true}
        onConfirm={() => {
          clearAllOperationalData();
          setIsClearDataConfirmOpen(false);
        }}
        onCancel={() => setIsClearDataConfirmOpen(false)}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset All Hotel Data?"
        message="Are you sure you want to restore default initial state? All operational records will be cleared and settings restored to default."
        confirmLabel="Confirm Reset"
        isDestructive={true}
        onConfirm={() => {
          resetToDefaultData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
