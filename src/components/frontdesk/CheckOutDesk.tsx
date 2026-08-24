import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { StatusBadge } from '../common/Badge';
import {
  LogOut,
  Search,
  Receipt,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Sparkles,
  UtensilsCrossed,
  ConciergeBell,
  BedDouble,
  DollarSign,
  Printer,
  X
} from 'lucide-react';
import { PaymentMethod } from '../../types/hotel';

export const CheckOutDesk: React.FC = () => {
  const {
    data,
    checkOutGuest,
    setSelectedInvoiceBookingId,
    setSelectedReceiptId,
    setActiveTab
  } = useHotel();

  const currency = data.settings.currencySymbol || '$';
  const todayStr = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForCheckOut, setSelectedBookingForCheckOut] = useState<string | null>(null);
  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>('Card');
  const [settlementAmount, setSettlementAmount] = useState<number>(0);
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

  // In-house guests (Checked-in)
  const checkedInBookings = data.bookings.filter(
    b =>
      b.status === 'Checked-in' &&
      (b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const dueTodayCount = checkedInBookings.filter(b => b.checkOutDate <= todayStr).length;

  const handleOpenCheckOutModal = (bookingId: string) => {
    const booking = data.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setSelectedBookingForCheckOut(bookingId);
    setSettlementAmount(booking.pendingAmount);
    setCheckoutNotes('');
  };

  const handleConfirmSettlementAndCheckOut = (bookingId: string) => {
    checkOutGuest(bookingId, settlementAmount, settlementMethod, checkoutNotes);
    setSelectedBookingForCheckOut(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Departures & Folio Settlement
            </span>
            <span className="text-xs font-medium text-slate-500">
              {checkedInBookings.length} In-House Guests • {dueTodayCount} Due Today
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Check-Out & Folio Clearance</h1>
          <p className="text-xs text-slate-500">
            Settle room charges, restaurant tabs, extra services, issue final tax invoices and trigger housekeeping room turnover.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search occupied rooms by guest, room #, booking ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {checkedInBookings.length} Guests In Residence
        </span>
      </div>

      {/* Grid of In-House Guests */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <LogOut className="w-4 h-4 text-indigo-600" />
          <span>Active In-House Guest Folios</span>
        </h3>

        {checkedInBookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <BedDouble className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900">No In-House Guests</h4>
            <p className="text-xs text-slate-500 mt-1">There are currently no guests checked into rooms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkedInBookings.map(b => {
              const isDue = b.checkOutDate <= todayStr;

              return (
                <div
                  key={b.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all ${
                    isDue ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{b.bookingId}</span>
                          {isDue && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                              Due Today
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1.5">{b.guestName}</h4>
                        <p className="text-xs text-slate-500">{b.mobile}</p>
                      </div>
                      <span className="text-xl font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                        #{b.roomNumber}
                      </span>
                    </div>

                    {/* Folio Breakdown */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Room Stay ({b.nights}n):</span>
                        <span className="font-semibold text-slate-900">{currency}{b.roomCharges.toFixed(2)}</span>
                      </div>

                      {b.extraCharges > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span className="flex items-center gap-1">
                            <ConciergeBell className="w-3 h-3 text-indigo-500" />
                            Extras & Room Service:
                          </span>
                          <span className="font-semibold text-slate-900">+{currency}{b.extraCharges.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-600">
                        <span>Tax ({data.settings.taxPercentage}%):</span>
                        <span className="font-semibold text-slate-900">+{currency}{b.tax.toFixed(2)}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                        <span className="text-slate-900">Total Folio:</span>
                        <span className="text-slate-900">{currency}{b.grandTotal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-500">Balance Pending:</span>
                        <span className={b.pendingAmount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {currency}{b.pendingAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedInvoiceBookingId(b.id)}
                      className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Folio</span>
                    </button>

                    <button
                      onClick={() => handleOpenCheckOutModal(b.id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Process Check-Out</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-Out & Settlement Modal */}
      {selectedBookingForCheckOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            {(() => {
              const b = data.bookings.find(item => item.id === selectedBookingForCheckOut);
              if (!b) return null;

              return (
                <>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Final Check-Out Folio</h3>
                        <p className="text-xs text-slate-500">{b.guestName} • Room {b.roomNumber}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedBookingForCheckOut(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Folio Summary */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between text-slate-500">
                        <span>Gross Folio Amount:</span>
                        <span className="text-slate-900 font-semibold">{currency}{b.grandTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Deposits / Already Paid:</span>
                        <span className="text-emerald-600 font-semibold">{currency}{b.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                        <span className="text-slate-900">Outstanding Balance Due:</span>
                        <span className={b.pendingAmount > 0 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                          {currency}{b.pendingAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {b.pendingAmount > 0 && (
                      <div className="space-y-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                        <div>
                          <label className="block font-semibold text-indigo-900 mb-1">
                            Settle Balance Amount ({currency})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={b.pendingAmount}
                            value={settlementAmount}
                            onChange={e => setSettlementAmount(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-indigo-900 mb-1">Payment Method</label>
                          <select
                            value={settlementMethod}
                            onChange={e => setSettlementMethod(e.target.value as PaymentMethod)}
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Card">Credit / Debit Card</option>
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI / Digital QR</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Checkout Feedback / Notes</label>
                      <input
                        type="text"
                        value={checkoutNotes}
                        onChange={e => setCheckoutNotes(e.target.value)}
                        placeholder="Guest feedback, key returned, minibar verified..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                      <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Automated Post Check-Out Workflow:
                      </p>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                        <li>Room {b.roomNumber} transitions to <strong>Cleaning</strong> status</li>
                        <li>Housekeeping turnover task automatically dispatched</li>
                        <li>Final invoice is archived and printable</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedBookingForCheckOut(null)}
                      className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmSettlementAndCheckOut(b.id)}
                      className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                    >
                      {settlementAmount > 0 ? 'Collect Balance & Complete Check-Out' : 'Confirm Check-Out'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
