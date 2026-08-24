import React, { useState, useRef, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  Bell,
  Search,
  PlusCircle,
  LogIn,
  Moon,
  Sun,
  Shield,
  UserCheck,
  ChevronDown,
  Check,
  Building2,
  Menu,
  ExternalLink,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { UserRole } from '../../types/hotel';

interface HeaderProps {
  onToggleSidebarMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebarMobile }) => {
  const {
    data,
    setActiveTab,
    setIsGlobalSearchOpen,
    theme,
    toggleTheme,
    switchRole,
    markNotificationRead,
    markAllNotificationsRead,
    firebaseSyncStatus,
    forceSyncToFirebase
  } = useHotel();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = data.notifications.filter(n => !n.read);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'Admin', label: 'Admin (David Miller)', desc: 'Full System Access & Financials' },
    { role: 'Manager', label: 'Manager (Alex Vance)', desc: 'Operations & Staff Oversight' },
    { role: 'Receptionist', label: 'Receptionist (Sarah Jenkins)', desc: 'Front Desk, Bookings & Guests' },
    { role: 'Accountant', label: 'Accountant (Rajesh Kumar)', desc: 'Invoices, Expenses & P&L' },
    { role: 'Housekeeping', label: 'Housekeeping (Maria Rodriguez)', desc: 'Room Sanitization & Turnover' },
    { role: 'Restaurant Staff', label: 'Restaurant / Chef (Antoine)', desc: 'Kitchen & Room Service Orders' }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-slate-200 shadow-sm">
      {/* Left branding & mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group lg:hidden"
        >
          {data.settings.logoUrl ? (
            <img
              src={data.settings.logoUrl}
              alt="AL-KAREEM Logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-amber-300 shadow-sm group-hover:scale-105 transition-transform shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 uppercase font-display">
              {data.settings.hotelName || 'AL-KAREEM'}
            </span>
          </div>
        </div>
      </div>

      {/* Center Global Search bar trigger */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block">
        <button
          type="button"
          onClick={() => setIsGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-4 py-1.5 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-full transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
            <span className="truncate text-xs">Search guests, rooms, booking IDs, invoices...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded-full shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right actions: Date/Time, Quick booking, Notifications, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-time Google Firebase Cloud Database Sync Indicator */}
        <button
          onClick={() => forceSyncToFirebase()}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
            firebaseSyncStatus === 'synced'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : firebaseSyncStatus === 'syncing'
              ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
          title="Google Firebase Firestore Cloud Database. Click to force cloud backup."
        >
          <Cloud className={`w-3.5 h-3.5 ${firebaseSyncStatus === 'syncing' ? 'animate-spin text-amber-600' : 'text-emerald-600'}`} />
          <span>
            {firebaseSyncStatus === 'synced'
              ? 'Firebase Cloud: Synced'
              : firebaseSyncStatus === 'syncing'
              ? 'Saving to Firebase...'
              : 'Firebase Connected'}
          </span>
        </button>

        {/* Date & Time Widget from Bento Grid */}
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Quick Check-in Button */}
        <button
          onClick={() => setActiveTab('checkin')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full transition-colors"
        >
          <LogIn className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Check-In</span>
        </button>

        {/* New Reservation Button */}
        <button
          onClick={() => setActiveTab('reservations')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm shadow-indigo-200 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Booking</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800">System Alerts</h4>
                  {unreadNotifs.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {data.notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications at this time.
                  </div>
                ) : (
                  data.notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkTab) setActiveTab(notif.linkTab);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${!notif.read ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pl-2.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-full transition-all"
            title="Switch User Role"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold hidden sm:inline text-slate-800">{data.currentUser.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Active Operator
                </p>
                <p className="text-xs font-bold text-slate-800 truncate">{data.currentUser.fullName}</p>
              </div>

              <div className="space-y-1">
                {roles.map(item => {
                  const isActive = data.currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchRole(item.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-900 font-medium border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
