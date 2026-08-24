import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { StatusBadge } from '../common/Badge';
import {
  LogIn,
  Search,
  UserPlus,
  BedDouble,
  CreditCard,
  CheckCircle,
  Calendar,
  Phone,
  Key,
  Receipt,
  Sparkles,
  X,
  QrCode
} from 'lucide-react';
import { PaymentMethod, IdProofType } from '../../types/hotel';
import { formatINR, INDIAN_STATES } from '../../utils/indiaUtils';

export const CheckInDesk: React.FC = () => {
  const {
    data,
    checkInGuest,
    createBooking,
    setSelectedInvoiceBookingId,
    setActiveTab
  } = useHotel();

  const todayStr = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Express Walk-in Check-in State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    idProofType: 'Aadhaar' as IdProofType,
    idProofNumber: '',
    state: data.settings.state || 'Maharashtra',
    city: data.settings.city || 'Mumbai',
    gstin: '',
    companyName: '',
    roomId: data.rooms.find(r => r.status === 'Available')?.id || data.rooms[0]?.id || '',
    nights: 1,
    adults: 2,
    deposit: 0,
    paymentMethod: 'UPI' as PaymentMethod
  });

  // Ready for checkin list (Confirmed bookings)
  const readyBookings = data.bookings.filter(
    b =>
      b.status === 'Confirmed' &&
      (b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCheckedIn = data.bookings.filter(b => b.status === 'Checked-in');

  const handleConfirmCheckIn = (bookingId: string) => {
    checkInGuest(bookingId, depositAmount > 0 ? depositAmount : undefined, paymentMethod);
    setSelectedBookingForCheckIn(null);
    setDepositAmount(0);
  };

  const handleExpressWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInForm.fullName.trim() || !walkInForm.mobile.trim() || !walkInForm.roomId) return;

    const room = data.rooms.find(r => r.id === walkInForm.roomId);
    if (!room) return;

    const checkInDate = todayStr;
    const checkOutDate = new Date(Date.now() + walkInForm.nights * 86400000).toISOString().split('T')[0];

    const newBooking = createBooking({
      newGuest: {
        fullName: walkInForm.fullName.trim(),
        mobile: walkInForm.mobile.trim(),
        email: walkInForm.email.trim() || `${walkInForm.fullName.toLowerCase().replace(/\s+/g, '')}@guest.in`,
        idProofType: walkInForm.idProofType,
        idProofNumber: walkInForm.idProofNumber || 'ID-WALKIN',
        address: 'Walk-in Registration',
        city: walkInForm.city || 'Mumbai',
        state: walkInForm.state || 'Maharashtra',
        country: 'India',
        gstin: walkInForm.gstin || undefined,
        companyName: walkInForm.companyName || undefined,
        gender: 'Male'
      },
      roomId: room.id,
      checkInDate,
      checkInTime: data.settings.checkInTime || '14:00',
      checkOutDate,
      checkOutTime: data.settings.checkOutTime || '11:00',
      adults: walkInForm.adults,
      children: 0,
      roomRate: room.price,
      discount: 0,
      advancePayment: walkInForm.deposit,
      paymentMethod: walkInForm.paymentMethod,
      specialRequests: 'Walk-in direct front desk registration'
    });

    // Check-in immediately
    checkInGuest(newBooking.id);
    setIsWalkInModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Arrivals & Key Desk
            </span>
            <span className="text-xs font-medium text-slate-500">
              {readyBookings.length} Expected Arrivals • {activeCheckedIn.length} Active in Residence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Front Desk Check-In</h1>
          <p className="text-xs text-slate-500">Process guest arrivals, issue key cards, verify identity and collect security deposits.</p>
        </div>

        <button
          onClick={() => setIsWalkInModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Express Walk-in Check-in</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search arrivals by name, reservation #, room #..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {readyBookings.length} pending arrivals
        </span>
      </div>

      {/* Grid of Confirmed Bookings awaiting arrival */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <LogIn className="w-4 h-4 text-indigo-600" />
          <span>Expected Arrivals (Confirmed Reservations)</span>
        </h3>

        {readyBookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900">All Arrivals Processed!</h4>
            <p className="text-xs text-slate-500 mt-1">There are no remaining confirmed reservations waiting for check-in.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyBookings.map(b => (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{b.bookingId}</span>
                      <h4 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-indigo-600 transition-colors">
                        {b.guestName}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {b.mobile}
                      </p>
                    </div>
                    <span className="text-xl font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      #{b.roomNumber}
                    </span>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Room Category:</span>
                      <span className="font-semibold text-slate-900">{b.roomTypeName}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Stay Duration:</span>
                      <span className="font-semibold text-slate-900">{b.nights} night{b.nights > 1 ? 's' : ''} ({b.checkInDate} to {b.checkOutDate})</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Folio:</span>
                      <span className="font-bold text-slate-900">{formatINR(b.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Balance Pending:</span>
                      <span className={b.pendingAmount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                        {formatINR(b.pendingAmount)}
                      </span>
                    </div>
                  </div>

                  {b.specialRequests && (
                    <p className="mt-3 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                      &ldquo;{b.specialRequests}&rdquo;
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedInvoiceBookingId(b.id)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium"
                  >
                    View Bill
                  </button>

                  <button
                    onClick={() => {
                      setSelectedBookingForCheckIn(b.id);
                      setDepositAmount(0);
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Process Check-In</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-In Confirmation & Deposit Modal */}
      {selectedBookingForCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            {(() => {
              const b = data.bookings.find(item => item.id === selectedBookingForCheckIn);
              if (!b) return null;

              return (
                <>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <LogIn className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Check-in Guest</h3>
                        <p className="text-xs text-slate-500">{b.guestName} • Room {b.roomNumber}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedBookingForCheckIn(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>Total Stay Cost:</span>
                        <span className="text-slate-900 font-semibold">{formatINR(b.grandTotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Currently Paid:</span>
                        <span className="text-emerald-600 font-semibold">{formatINR(b.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Remaining Balance:</span>
                        <span className="text-rose-600 font-bold">{formatINR(b.pendingAmount)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Collect Deposit / Payment Now (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={b.pendingAmount}
                        value={depositAmount}
                        onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)}
                        placeholder="₹0.00"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    </div>

                    {depositAmount > 0 && (
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                        >
                          <option value="UPI">UPI / QR Code (GPay, PhonePe, Paytm)</option>
                          <option value="Card">Card (RuPay, Visa, Mastercard)</option>
                          <option value="Cash">Cash (INR)</option>
                          <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                        </select>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800">
                      <p className="font-semibold">Confirming Check-In will:</p>
                      <ul className="list-disc list-inside mt-1 text-[11px] text-slate-600 space-y-0.5">
                        <li>Update Room {b.roomNumber} status to <strong>Occupied</strong></li>
                        <li>Activate guest room service & GST billing folio</li>
                        <li>Record advance receipt (if deposit collected)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedBookingForCheckIn(null)}
                      className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmCheckIn(b.id)}
                      className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                    >
                      Issue Key & Complete Check-In
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Express Walk-in Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Express Walk-in Check-in</h3>
                  <p className="text-xs text-slate-500">Quick guest arrival registration for India</p>
                </div>
              </div>
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpressWalkIn} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    value={walkInForm.fullName}
                    onChange={e => setWalkInForm({ ...walkInForm, fullName: e.target.value })}
                    placeholder="Full name as per Aadhaar / ID"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number (India) *</label>
                  <input
                    type="tel"
                    required
                    value={walkInForm.mobile}
                    onChange={e => setWalkInForm({ ...walkInForm, mobile: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email ID</label>
                  <input
                    type="email"
                    value={walkInForm.email}
                    onChange={e => setWalkInForm({ ...walkInForm, email: e.target.value })}
                    placeholder="guest@mail.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State of Residence</label>
                  <select
                    value={walkInForm.state}
                    onChange={e => setWalkInForm({ ...walkInForm, state: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st.code} value={st.name}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    value={walkInForm.city}
                    onChange={e => setWalkInForm({ ...walkInForm, city: e.target.value })}
                    placeholder="City name"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Govt ID Proof Type *</label>
                  <select
                    value={walkInForm.idProofType}
                    onChange={e => setWalkInForm({ ...walkInForm, idProofType: e.target.value as IdProofType })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                    <option value="PAN Card">PAN Card (Income Tax)</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID (Election Commission)</option>
                    <option value="Other">Other ID</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Proof Number *</label>
                  <input
                    type="text"
                    required
                    value={walkInForm.idProofNumber}
                    onChange={e => setWalkInForm({ ...walkInForm, idProofNumber: e.target.value })}
                    placeholder="e.g. 12-digit Aadhaar / PAN"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name (Optional)</label>
                  <input
                    type="text"
                    value={walkInForm.companyName}
                    onChange={e => setWalkInForm({ ...walkInForm, companyName: e.target.value })}
                    placeholder="For B2B Corporate billing"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guest GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={walkInForm.gstin}
                    onChange={e => setWalkInForm({ ...walkInForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="15-digit GSTIN (e.g. 27AAAAA0000A1Z5)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white uppercase font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Select Available Room *</label>
                  <select
                    value={walkInForm.roomId}
                    onChange={e => setWalkInForm({ ...walkInForm, roomId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    {data.rooms
                      .filter(r => r.status === 'Available')
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          Room {r.roomNumber} - {r.roomTypeName} ({formatINR(r.price)} / night)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nights</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={walkInForm.nights}
                    onChange={e => setWalkInForm({ ...walkInForm, nights: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adults</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={walkInForm.adults}
                    onChange={e => setWalkInForm({ ...walkInForm, adults: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advance Payment (INR ₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={walkInForm.deposit}
                    onChange={e => setWalkInForm({ ...walkInForm, deposit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={walkInForm.paymentMethod}
                    onChange={e => setWalkInForm({ ...walkInForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="UPI">UPI / QR (GPay, PhonePe, Paytm)</option>
                    <option value="Cash">Cash (INR)</option>
                    <option value="Card">Card (RuPay, Visa, Mastercard)</option>
                    <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Confirm Walk-In & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
