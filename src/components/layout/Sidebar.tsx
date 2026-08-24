import React from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  CalendarRange,
  BedDouble,
  Layers,
  Sparkles,
  Users,
  UtensilsCrossed,
  ConciergeBell,
  Receipt,
  Wallet,
  UserCheck,
  BarChart3,
  ShieldCheck,
  Settings,
  Database,
  X,
  Hotel
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, data, metrics } = useHotel();

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const groups: NavGroup[] = [
    {
      title: 'Front Desk',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />
        },
        {
          id: 'checkin',
          label: 'Check-in Desk',
          icon: <LogIn className="w-4 h-4" />,
          badge: metrics.todaysCheckInsCount > 0 ? metrics.todaysCheckInsCount : undefined,
          badgeColor: 'bg-sky-100 text-sky-700 border border-sky-200 font-bold'
        },
        {
          id: 'checkout',
          label: 'Check-out / Folio',
          icon: <LogOut className="w-4 h-4" />,
          badge: metrics.todaysCheckOutsCount > 0 ? metrics.todaysCheckOutsCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-700 border border-amber-200 font-bold'
        },
        {
          id: 'reservations',
          label: 'Reservations',
          icon: <CalendarRange className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Room Operations',
      items: [
        {
          id: 'rooms',
          label: 'Rooms',
          icon: <BedDouble className="w-4 h-4" />,
          badge: `${metrics.availableRooms} free`,
          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
        },
        {
          id: 'room-types',
          label: 'Room Types',
          icon: <Layers className="w-4 h-4" />
        },
        {
          id: 'housekeeping',
          label: 'Housekeeping',
          icon: <Sparkles className="w-4 h-4" />,
          badge: metrics.cleaningRooms > 0 ? `${metrics.cleaningRooms} dirty` : undefined,
          badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200 font-bold'
        }
      ]
    },
    {
      title: 'Guest & Services',
      items: [
        {
          id: 'guests',
          label: 'Guest Directory',
          icon: <Users className="w-4 h-4" />
        },
        {
          id: 'restaurant',
          label: 'Restaurant & POS',
          icon: <UtensilsCrossed className="w-4 h-4" />
        },
        {
          id: 'services',
          label: 'Extra Services',
          icon: <ConciergeBell className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Financials',
      items: [
        {
          id: 'billing',
          label: 'Billing & Invoices',
          icon: <Receipt className="w-4 h-4" />
        },
        {
          id: 'expenses',
          label: 'Expenses',
          icon: <Wallet className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Administration',
      items: [
        {
          id: 'staff',
          label: 'Staff Management',
          icon: <UserCheck className="w-4 h-4" />
        },
        {
          id: 'reports',
          label: 'Reports & Analytics',
          icon: <BarChart3 className="w-4 h-4" />
        },
        {
          id: 'users',
          label: 'User Roles & Access',
          icon: <ShieldCheck className="w-4 h-4" />
        },
        {
          id: 'settings',
          label: 'Hotel Settings',
          icon: <Settings className="w-4 h-4" />
        },
        {
          id: 'backup',
          label: 'Backup & Restore',
          icon: <Database className="w-4 h-4" />
        }
      ]
    }
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col text-slate-700 shadow-xs transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header section */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            {data.settings.logoUrl ? (
              <img
                src={data.settings.logoUrl}
                alt="AL-KAREEM Logo"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl object-cover border border-amber-300 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20 shrink-0">
                <Hotel className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-base font-extrabold tracking-tight text-slate-900 block truncate uppercase font-display">
                {data.settings.hotelName || 'AL-KAREEM'}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold block -mt-0.5 tracking-wider uppercase">
                Hotel & Resort
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {group.title}
              </h5>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600 rounded-l-none shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer user profile & occupancy widget */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 overflow-hidden flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
              {data.currentUser.fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{data.currentUser.fullName}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium truncate">
                {data.currentUser.role}
              </p>
            </div>
          </div>

          <div className="px-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Occupancy</span>
              <span className="font-bold text-slate-900">{metrics.occupancyRate}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.occupancyRate)}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
