import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { UserRole } from '../../types/hotel';
import {
  Hotel,
  Lock,
  Mail,
  User,
  Shield,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Building2,
  ArrowRight
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { data, loginWithEmail, registerNewUser } = useHotel();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Registration state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Receptionist');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Quick Demo Logins
  const demoAccounts = [
    {
      role: 'Admin',
      name: 'S PATEL (General Manager)',
      email: 's.patel@alkareem.in',
      pass: 'admin123',
      badge: 'Full Root Access',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      role: 'Receptionist',
      name: 'Sunita Deshmukh',
      email: 'sunita.d@alkareem.in',
      pass: 'reception123',
      badge: 'Front Desk & Bookings',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      role: 'Manager',
      name: 'Vikas Yadav',
      email: 'vikas.y@alkareem.in',
      pass: 'manager123',
      badge: 'Operations & Staff',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      role: 'Accountant',
      name: 'Pooja Patel',
      email: 'pooja.patel@alkareem.in',
      pass: 'accounts123',
      badge: 'GST & Invoicing',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      role: 'Housekeeping',
      name: 'Ramesh Kumar',
      email: 'ramesh.k@alkareem.in',
      pass: 'housekeeping123',
      badge: 'Room Cleaning Desk',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      role: 'Restaurant Staff',
      name: 'Chef Manoj Verma',
      email: 'chef.manoj@alkareem.in',
      pass: 'kitchen123',
      badge: 'Dining & Kitchen POS',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await loginWithEmail(email, password, rememberMe);
      if (!res.success) {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await loginWithEmail(demoEmail, demoPass, true);
      if (!res.success) {
        setErrorMsg(res.message || 'Login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerNewUser({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole
      });
      if (!res.success) {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-indigo-500/30 selection:text-white">
      {/* Decorative background ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Brand Panel & Hotel Identity (5 cols on lg) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {/* Hotel Logo Emblem */}
            <div className="flex items-center gap-3">
              {data.settings.logoUrl ? (
                <img
                  src={data.settings.logoUrl}
                  alt="Hotel Logo"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/80 shadow-lg shadow-amber-500/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/20 border border-amber-400/40">
                  <Hotel className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight font-display text-white">
                  {data.settings.hotelName || 'AL-KAREEM'}
                </h2>
                <p className="text-[11px] font-semibold text-amber-300 tracking-wider uppercase">
                  Hotel & Resort • PMS
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-900/80 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-900/80 text-indigo-200 border border-indigo-700/60">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Enterprise Security
              </span>
              <h3 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                Property Management & Front Desk Console
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Secure access for hotel staff, receptionists, managers, accountants, and housekeeping.
              </p>
            </div>

            {/* Feature points */}
            <div className="space-y-2.5 pt-2 text-xs text-indigo-100/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Check-in / Check-out with ID proof</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GST Tax Invoicing & Thermal Payment Receipts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live Google Firebase Cloud Sync</span>
              </div>
            </div>
          </div>

          {/* Footer Contact */}
          <div className="pt-6 border-t border-indigo-900/60 text-[11px] text-indigo-300/70 relative z-10 flex items-center justify-between">
            <span>GSTIN: {data.settings.gstNumber || '27AABCU9603R1ZM'}</span>
            <span className="text-amber-400/90 font-medium">India PMS v2.4</span>
          </div>
        </div>

        {/* Right Side: Login / Register Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            {/* Mode Switch Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In (लॉग इन)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register New Staff (नया खाता)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address or Username (ईमेल / यूज़रनेम)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email-input"
                      type="text"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. s.patel@alkareem.in or admin"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Password (पासवर्ड)
                    </label>
                    <span className="text-[11px] text-indigo-600 font-medium hover:underline cursor-pointer">
                      Default: admin123
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600 font-medium">Remember my session</span>
                  </label>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Log In to Hotel PMS (लॉग इन करें)</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff Full Name (पूरा नाम)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (ईमेल)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="rahul@alkareem.in"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Role (पद / रोल)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <select
                        value={regRole}
                        onChange={e => setRegRole(e.target.value as UserRole)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                      >
                        <option value="Receptionist">Receptionist (Front Desk)</option>
                        <option value="Manager">Manager (Operations)</option>
                        <option value="Accountant">Accountant (Billing & Invoices)</option>
                        <option value="Housekeeping">Housekeeping (Room Turnovers)</option>
                        <option value="Restaurant Staff">Restaurant Staff (POS & Food)</option>
                        <option value="Admin">Admin (Full System Access)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password (पासवर्ड)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={4}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Min 4 characters"
                        className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password (पुष्टि करें)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account & Log In</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Preset 1-Click Demo Logins */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  1-Click Quick Demo Access (डेमो लॉगिन)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Click any to auto-fill & login</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {demoAccounts.map(demo => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleQuickLogin(demo.email, demo.pass)}
                    className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-200 transition-all group shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 truncate">
                        {demo.role}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{demo.email}</p>
                    <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded mt-1 border ${demo.badgeColor}`}>
                      {demo.pass}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-[11px] text-slate-400 border-t border-slate-100 mt-4">
            Protected by AL-KAREEM Hotel Management System & Cloud Security.
          </div>
        </div>

      </div>
    </div>
  );
};
