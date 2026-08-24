import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Booking, BookingStatus, PaymentMethod } from '../../types/hotel';
import { StatusBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  X,
  FileText,
  CreditCard,
  User,
  BedDouble,
  DollarSign,
  AlertCircle,
  Eye,
  LogOut,
  Sparkles
} from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';

export const ReservationManagement: React.FC = () => {
  const {
    data,
    createBooking,
    updateBooking,
    cancelBooking,
    checkInGuest,
    checkOutGuest,
    setSelectedInvoiceBookingId,
    setActiveTab
  } = useHotel();

  const currency = data.settings.currencySymbol || '$';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Reservation Modal
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // New Booking Form State
  const [bookingForm, setBookingForm] = useState({
    guestMode: 'new' as 'new' | 'existing',
    existingGuestId: '',
    guestName: '',
    mobile: '',
    email: '',
    roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: '14:00',
    checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    checkOutTime: '11:00',
    adults: 2,
    children: 0,
    advancePayment: 0,
    paymentMethod: 'Card' as PaymentMethod,
    discount: 0,
    specialRequests: ''
  });

  const filteredBookings = useMemo(() => {
    return data.bookings.filter(b => {
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchSearch =
        b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.mobile.includes(searchQuery);

      return matchStatus && matchSearch;
    });
  }, [data.bookings, statusFilter, searchQuery]);

  // Selected Room for pricing preview
  const selectedRoom = data.rooms.find(r => r.id === bookingForm.roomId) || data.rooms[0];

  // Duration calculation
  const calculatedNights = useMemo(() => {
    const d1 = new Date(bookingForm.checkInDate).getTime();
    const d2 = new Date(bookingForm.checkOutDate).getTime();
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingForm.checkInDate, bookingForm.checkOutDate]);

  const estimatedRoomTotal = selectedRoom ? selectedRoom.price * calculatedNights : 0;
  const estimatedTax = (estimatedRoomTotal * (data.settings.taxPercentage || 12)) / 100;
  const estimatedGrandTotal = Math.max(0, estimatedRoomTotal + estimatedTax - bookingForm.discount);

  const handleOpenNewModal = () => {
    const defaultRoom = data.rooms.find(r => r.status === 'Available') || data.rooms[0];
    setBookingForm({
      guestMode: 'new',
      existingGuestId: '',
      guestName: '',
      mobile: '',
      email: '',
      roomId: defaultRoom ? defaultRoom.id : '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkInTime: '14:00',
      checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      checkOutTime: '11:00',
      adults: 2,
      children: 0,
      advancePayment: 0,
      paymentMethod: 'Card',
      discount: 0,
      specialRequests: ''
    });
    setIsNewBookingModalOpen(true);
  };

  const handleExistingGuestSelect = (guestId: string) => {
    const g = data.guests.find(item => item.id === guestId);
    if (g) {
      setBookingForm(prev => ({
        ...prev,
        existingGuestId: g.id,
        guestName: g.fullName,
        mobile: g.mobile,
        email: g.email
      }));
    }
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.roomId) return;

    if (bookingForm.guestMode === 'existing') {
      createBooking({
        guestId: bookingForm.existingGuestId,
        roomId: bookingForm.roomId,
        checkInDate: bookingForm.checkInDate,
        checkInTime: bookingForm.checkInTime,
        checkOutDate: bookingForm.checkOutDate,
        checkOutTime: bookingForm.checkOutTime,
        adults: bookingForm.adults,
        children: bookingForm.children,
        roomRate: selectedRoom?.price,
        discount: bookingForm.discount,
        advancePayment: bookingForm.advancePayment,
        paymentMethod: bookingForm.paymentMethod,
        specialRequests: bookingForm.specialRequests
      });
    } else {
      if (!bookingForm.guestName.trim() || !bookingForm.mobile.trim()) return;

      createBooking({
        newGuest: {
          fullName: bookingForm.guestName,
          mobile: bookingForm.mobile,
          email: bookingForm.email || 'guest@example.com',
          address: 'Downtown City Center',
          city: 'Grand City',
          state: 'State',
          country: 'USA',
          idProofType: 'Passport',
          idProofNumber: 'P' + Math.floor(1000000 + Math.random() * 9000000),
          gender: 'Other'
        },
        roomId: bookingForm.roomId,
        checkInDate: bookingForm.checkInDate,
        checkInTime: bookingForm.checkInTime,
        checkOutDate: bookingForm.checkOutDate,
        checkOutTime: bookingForm.checkOutTime,
        adults: bookingForm.adults,
        children: bookingForm.children,
        roomRate: selectedRoom?.price,
        discount: bookingForm.discount,
        advancePayment: bookingForm.advancePayment,
        paymentMethod: bookingForm.paymentMethod,
        specialRequests: bookingForm.specialRequests
      });
    }

    setIsNewBookingModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Central Reservations (CRS)
            </span>
            <span className="text-xs font-medium text-slate-500">{data.bookings.length} Total Bookings</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Bookings & Reservations</h1>
          <p className="text-xs text-slate-500">
            Create new guest bookings, check room calendar availability, manage deposits and handle arrivals.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by booking #, guest name, room or mobile..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white w-full sm:w-auto"
          >
            <option value="ALL">All Reservation Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in</option>
            <option value="Checked-out">Checked-out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 border-b border-slate-200 bg-slate-50 font-semibold">
              <tr>
                <th className="p-3.5">Booking ID</th>
                <th className="p-3.5">Guest</th>
                <th className="p-3.5">Room Assigned</th>
                <th className="p-3.5">Dates</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Balance Due</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No reservations found matching current query.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-indigo-600 bg-indigo-50/30">{b.bookingId}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{b.guestName}</p>
                      <p className="text-[10px] text-slate-500">{b.mobile}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900">Room {b.roomNumber}</span>
                      <p className="text-[10px] text-slate-500">{b.roomTypeName}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-800 font-medium">{b.checkInDate} to {b.checkOutDate}</p>
                      <span className="text-[10px] text-slate-500">{b.adults} Adults, {b.children} Kids</span>
                    </td>
                    <td className="p-3.5 font-medium">{b.nights} night{b.nights > 1 ? 's' : ''}</td>
                    <td className="p-3.5 font-bold text-slate-900">{formatINR(b.grandTotal)}</td>
                    <td className="p-3.5">
                      {b.pendingAmount > 0 ? (
                        <span className="font-bold text-rose-600">{formatINR(b.pendingAmount)}</span>
                      ) : (
                        <span className="font-semibold text-emerald-600">Settled</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => checkInGuest(b.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
                          >
                            Check-In
                          </button>
                        )}
                        {b.status === 'Checked-in' && (
                          <button
                            onClick={() => setActiveTab('check-out')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors"
                          >
                            Check-Out
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoiceBookingId(b.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Tax Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => setBookingToCancel(b)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Cancel Booking"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Create New Hotel Reservation</h3>
              </div>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              {/* Guest Mode Selection */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="guestMode"
                      checked={bookingForm.guestMode === 'new'}
                      onChange={() => setBookingForm({ ...bookingForm, guestMode: 'new' })}
                      className="accent-indigo-600"
                    />
                    <span>New Guest Registration</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="guestMode"
                      checked={bookingForm.guestMode === 'existing'}
                      onChange={() => setBookingForm({ ...bookingForm, guestMode: 'existing' })}
                      className="accent-indigo-600"
                    />
                    <span>Existing Guest Profile</span>
                  </label>
                </div>

                {bookingForm.guestMode === 'existing' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Guest Record *</label>
                    <select
                      value={bookingForm.existingGuestId}
                      onChange={e => handleExistingGuestSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose Existing Guest --</option>
                      {data.guests.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.fullName} ({g.mobile} • {g.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Full Guest Name *</label>
                      <input
                        type="text"
                        required
                        value={bookingForm.guestName}
                        onChange={e => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                      <input
                        type="text"
                        required
                        value={bookingForm.mobile}
                        onChange={e => setBookingForm({ ...bookingForm, mobile: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={bookingForm.email}
                        onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Room & Stay Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Select Hotel Room *</label>
                  <select
                    required
                    value={bookingForm.roomId}
                    onChange={e => setBookingForm({ ...bookingForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold"
                  >
                    {data.rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room #{r.roomNumber} - {r.roomTypeName || 'Deluxe'} ({currency}{r.price}/night • Status: {r.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-In Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkInDate}
                    onChange={e => setBookingForm({ ...bookingForm, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkOutDate}
                    onChange={e => setBookingForm({ ...bookingForm, checkOutDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingForm.adults}
                    onChange={e => setBookingForm({ ...bookingForm, adults: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    value={bookingForm.children}
                    onChange={e => setBookingForm({ ...bookingForm, children: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Advance & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <div>
                  <label className="block font-semibold text-indigo-900 mb-1">Advance Deposit (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={bookingForm.advancePayment}
                    onChange={e => setBookingForm({ ...bookingForm, advancePayment: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-indigo-900 mb-1">Discount Amount (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={bookingForm.discount}
                    onChange={e => setBookingForm({ ...bookingForm, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-indigo-900 mb-1">Deposit Payment Method</label>
                  <select
                    value={bookingForm.paymentMethod}
                    onChange={e => setBookingForm({ ...bookingForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600">Duration: <strong className="text-slate-900">{calculatedNights} night{calculatedNights > 1 ? 's' : ''}</strong></span>
                  <p className="text-slate-500">Room Total: {formatINR(estimatedRoomTotal)} + Tax ({data.settings.taxPercentage}% GST): {formatINR(estimatedTax)}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Est. Grand Total</span>
                  <span className="text-lg font-bold text-slate-900">{formatINR(estimatedGrandTotal)}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Requests / Notes</label>
                <textarea
                  rows={2}
                  value={bookingForm.specialRequests}
                  onChange={e => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                  placeholder="Late check-in, honeymoon setup, extra pillows..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(bookingToCancel)}
        title={`Cancel Reservation ${bookingToCancel?.bookingId}?`}
        message={`Are you sure you want to cancel the booking for ${bookingToCancel?.guestName}? The room status will be restored to Available.`}
        confirmLabel="Cancel Booking"
        isDestructive={true}
        onConfirm={() => {
          if (bookingToCancel) {
            cancelBooking(bookingToCancel.id);
            setBookingToCancel(null);
          }
        }}
        onCancel={() => setBookingToCancel(null)}
      />
    </div>
  );
};
