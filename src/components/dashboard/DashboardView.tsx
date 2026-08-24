import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/Badge';
import { formatINR } from '../../utils/indiaUtils';
import {
  BedDouble,
  DoorOpen,
  CalendarCheck,
  DollarSign,
  Receipt,
  PlusCircle,
  LogIn,
  LogOut,
  Sparkles,
  ArrowUpRight,
  UtensilsCrossed,
  ArrowRight,
  CreditCard,
  Building,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { data, metrics, setActiveTab, setSelectedInvoiceBookingId, setSelectedReceiptId } = useHotel();
  const currency = data.settings.currencySymbol || '$';

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's arrivals
  const todaysArrivals = data.bookings.filter(
    b => b.checkInDate === todayStr && (b.status === 'Confirmed' || b.status === 'Checked-in')
  );

  // Today's departures
  const todaysDepartures = data.bookings.filter(
    b => b.checkOutDate === todayStr && b.status === 'Checked-in'
  );

  // Recent bookings
  const recentBookings = data.bookings.slice(0, 5);

  // Recent transactions
  const recentPayments = data.payments.slice(0, 4);

  // Status distributions
  const roomStatusBreakdown = [
    { label: 'Available', count: metrics.availableRooms, color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Occupied', count: metrics.occupiedRooms, color: 'bg-indigo-600', barColor: 'bg-indigo-600' },
    { label: 'Reserved', count: metrics.reservedRooms, color: 'bg-sky-500', barColor: 'bg-sky-500' },
    { label: 'Cleaning', count: metrics.cleaningRooms, color: 'bg-amber-500', barColor: 'bg-amber-500' },
    { label: 'Maintenance', count: metrics.maintenanceRooms, color: 'bg-rose-500', barColor: 'bg-rose-500' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Welcome and Fast Shortcuts in Bento theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
              Live Operations
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Hotel Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{data.currentUser.fullName}</span>. Overview for {data.settings.hotelName}.
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('checkin')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200 transition-colors"
          >
            <LogIn className="w-4 h-4 text-indigo-600" />
            <span>Walk-in Check-In</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-full shadow-sm shadow-indigo-200 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
          <button
            onClick={() => setActiveTab('restaurant')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4 text-slate-600" />
            <span>Room Dining POS</span>
          </button>
        </div>
      </div>

      {/* Row 1: Primary Bento Metrics (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          id="stat-total-rooms"
          title="Total Rooms"
          value={metrics.totalRooms}
          subtitle={`${metrics.availableRooms} rooms free for booking`}
          icon={<Building className="w-5 h-5" />}
          colorScheme="slate"
          trend={{ value: `${metrics.occupancyRate}% Occ`, isPositive: true }}
          onClick={() => setActiveTab('rooms')}
        />
        <StatCard
          id="stat-available-rooms"
          title="Available Rooms"
          value={metrics.availableRooms}
          subtitle="Clean & ready for check-in"
          icon={<DoorOpen className="w-5 h-5" />}
          colorScheme="emerald"
          trend={{ value: 'Ready', isPositive: true }}
          onClick={() => setActiveTab('rooms')}
        />
        <StatCard
          id="stat-occupied-rooms"
          title="Occupied Rooms"
          value={metrics.occupiedRooms}
          subtitle={`Current in-house guest count`}
          icon={<BedDouble className="w-5 h-5" />}
          colorScheme="indigo"
          trend={{ value: `${metrics.occupiedRooms} Active`, isPositive: true }}
          onClick={() => setActiveTab('rooms')}
        />
        <StatCard
          id="stat-todays-revenue"
          title="Today's Revenue"
          value={formatINR(metrics.todaysRevenue)}
          subtitle="Settled collections today"
          icon={<DollarSign className="w-5 h-5" />}
          colorScheme="emerald"
          trend={{ value: 'Live', isPositive: true }}
          onClick={() => setActiveTab('billing')}
        />
      </div>

      {/* Row 2: Bento Grid Layout (8 cols Table + 4 cols Indigo Accent Bento Card) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Bento Card: Recent Bookings & Arrivals (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Reservations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live bookings, guest info, and stay details</p>
            </div>
            <button
              onClick={() => setActiveTab('reservations')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              <span>View All ({data.bookings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Guest & Booking</th>
                  <th className="px-4 py-3.5">Room</th>
                  <th className="px-4 py-3.5">Stay Dates</th>
                  <th className="px-4 py-3.5">Total / Due</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-normal">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                          <CalendarCheck className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-slate-700 text-sm">No Reservations Yet</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          Ready for operations. Click "New Reservation" or "Walk-in Check-In" to check-in your first guest.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                            {b.guestName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{b.guestName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{b.bookingId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800">Room {b.roomNumber}</p>
                        <p className="text-[10px] text-slate-400">{b.roomTypeName}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-medium text-slate-700">{b.checkInDate}</p>
                        <p className="text-[10px] text-slate-400">to {b.checkOutDate} ({b.nights}n)</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900">{formatINR(b.grandTotal)}</p>
                        {b.pendingAmount > 0 ? (
                          <span className="text-[10px] font-semibold text-rose-600">Due: {formatINR(b.pendingAmount)}</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600">Paid in Full</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedInvoiceBookingId(b.id)}
                          className="px-3 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Bento Card: Indigo Accent Summary (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 p-6 text-white relative overflow-hidden flex flex-col justify-between">
          {/* Subtle glow decorative bubbles */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -right-4 top-12 w-20 h-20 bg-white/5 rounded-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-indigo-200 font-bold">
                Operations Summary
              </span>
              <span className="text-xs bg-indigo-500/50 text-indigo-100 px-2.5 py-0.5 rounded-full font-medium">
                Real-time
              </span>
            </div>

            <div className="my-5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight">
                  {currency}{metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-indigo-200">total gross inflow</span>
              </div>
              <p className="text-xs text-indigo-100 mt-1">
                Net Operating Profit: <span className="font-bold text-white">{currency}{metrics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs py-2 border-b border-indigo-500/50">
                <span className="text-indigo-100 flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5" /> Expected Check-Ins
                </span>
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">{metrics.todaysCheckInsCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-indigo-500/50">
                <span className="text-indigo-100 flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5" /> Due Check-Outs
                </span>
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">{metrics.todaysCheckOutsCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-indigo-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Rooms in Cleaning
                </span>
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">{metrics.cleaningRooms}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-500/60 flex items-center justify-between">
            <span className="text-xs text-indigo-200 font-medium">Pending stay balances:</span>
            <span className="text-xs font-bold text-amber-200">{currency}{metrics.pendingPaymentsTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Secondary Bento Cards (Inventory Status + Housekeeping / Payments + Today's Flow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Card 1: Inventory & Occupancy Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Room Status Matrix</h3>
                <p className="text-xs text-slate-500">Live room allocation status</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 px-2.5 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full">
                {metrics.occupancyRate}% Occupied
              </span>
            </div>

            {/* Custom Multi-Color Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 mb-5">
              {roomStatusBreakdown.map((item, idx) => {
                const pct = metrics.totalRooms > 0 ? (item.count / metrics.totalRooms) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={idx}
                    className={`h-full ${item.barColor} first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${item.label}: ${item.count} rooms`}
                  />
                );
              })}
            </div>

            {/* Status list */}
            <div className="space-y-2.5">
              {roomStatusBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.count} rooms</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('rooms')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Room Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Card 2: Today's Arrivals & Departures */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Today's Schedule</h3>
                <p className="text-xs text-slate-500">Expected arrivals and departures</p>
              </div>
              <span className="text-xs font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-full">
                {todaysArrivals.length + todaysDepartures.length} Total
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5 text-indigo-600" /> Arrivals Expected
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-full shadow-2xs font-bold text-indigo-700">
                    {todaysArrivals.length}
                  </span>
                </div>
                {todaysArrivals.length > 0 ? (
                  <div className="space-y-1 mt-2">
                    {todaysArrivals.slice(0, 2).map(a => (
                      <p key={a.id} className="text-[11px] text-slate-600 truncate">
                        • {a.guestName} (Room {a.roomNumber})
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No remaining check-ins today</p>
                )}
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5 text-amber-600" /> Departures Due
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-full shadow-2xs font-bold text-amber-700">
                    {todaysDepartures.length}
                  </span>
                </div>
                {todaysDepartures.length > 0 ? (
                  <div className="space-y-1 mt-2">
                    {todaysDepartures.slice(0, 2).map(d => (
                      <p key={d.id} className="text-[11px] text-slate-600 truncate">
                        • {d.guestName} (Room {d.roomNumber})
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No pending departures today</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => setActiveTab('checkin')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Front Desk Desk
            </button>
            <button
              onClick={() => setActiveTab('checkout')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Check-Outs
            </button>
          </div>
        </div>

        {/* Bento Card 3: Recent Payment Receipts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Payments</h3>
                <p className="text-xs text-slate-500">Live cashier collection stream</p>
              </div>
              <button
                onClick={() => setActiveTab('billing')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                All Receipts
              </button>
            </div>

            <div className="space-y-2.5">
              {recentPayments.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">No Payments Recorded</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Advance deposits and settled invoices will appear here.</p>
                </div>
              ) : (
                recentPayments.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedReceiptId(p.id)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.guestName}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {p.paymentMethod} • Room {p.roomNumber}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-emerald-600">+{formatINR(p.amount)}</p>
                      <p className="text-[9px] text-slate-400">{p.date.split(' ')[0]}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('billing')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cashiering & Invoicing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
