import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { PaymentMethod, PaymentType } from '../../types/hotel';
import { StatusBadge } from '../common/Badge';
import {
  Receipt,
  Search,
  Plus,
  CreditCard,
  Printer,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  FileText,
  X,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { downloadReceiptPDF, downloadInvoicePDF } from '../../utils/printUtils';

export const BillingManagement: React.FC = () => {
  const {
    data,
    addPayment,
    setSelectedInvoiceBookingId,
    setSelectedReceiptId,
    metrics
  } = useHotel();

  const currency = data.settings.currencySymbol || '$';

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'payments'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');

  // Record Payment Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    bookingId: '',
    guestName: '',
    roomNumber: '',
    amount: 100,
    paymentMethod: 'Card' as PaymentMethod,
    paymentType: 'Settlement' as PaymentType,
    notes: ''
  });

  // Filtered Bookings / Invoices
  const filteredInvoices = useMemo(() => {
    return data.bookings.filter(b => {
      const matchSearch =
        b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const computedStatus = b.pendingAmount <= 0 ? 'Paid' : b.paidAmount > 0 ? 'Partial' : 'Pending';
      const matchStatus = paymentStatusFilter === 'ALL' || computedStatus === paymentStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [data.bookings, searchQuery, paymentStatusFilter]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return data.payments.filter(p => {
      const matchSearch =
        p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.roomNumber && p.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchMethod = paymentMethodFilter === 'ALL' || p.paymentMethod === paymentMethodFilter;

      return matchSearch && matchMethod;
    });
  }, [data.payments, searchQuery, paymentMethodFilter]);

  const handleOpenRecordModal = (bookingId?: string) => {
    if (bookingId) {
      const b = data.bookings.find(item => item.id === bookingId);
      if (b) {
        setNewPayment({
          bookingId: b.id,
          guestName: b.guestName,
          roomNumber: b.roomNumber,
          amount: b.pendingAmount > 0 ? b.pendingAmount : 50,
          paymentMethod: 'Card',
          paymentType: 'Settlement',
          notes: ''
        });
      }
    } else {
      const firstB = data.bookings[0];
      setNewPayment({
        bookingId: firstB ? firstB.id : '',
        guestName: firstB ? firstB.guestName : '',
        roomNumber: firstB ? firstB.roomNumber : '',
        amount: 100,
        paymentMethod: 'Card',
        paymentType: 'Settlement',
        notes: ''
      });
    }
    setIsRecordModalOpen(true);
  };

  const handleBookingSelectInModal = (bId: string) => {
    const b = data.bookings.find(item => item.id === bId);
    if (b) {
      setNewPayment(prev => ({
        ...prev,
        bookingId: b.id,
        guestName: b.guestName,
        roomNumber: b.roomNumber,
        amount: b.pendingAmount > 0 ? b.pendingAmount : prev.amount
      }));
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.guestName.trim() || newPayment.amount <= 0) return;

    addPayment({
      bookingId: newPayment.bookingId,
      guestName: newPayment.guestName,
      roomNumber: newPayment.roomNumber || '',
      amount: Number(newPayment.amount),
      paymentMethod: newPayment.paymentMethod,
      paymentType: newPayment.paymentType,
      notes: newPayment.notes
    });

    setIsRecordModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Cashier & Accounts
            </span>
            <span className="text-xs font-medium text-slate-500">Financial Ledger & Billing</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Billing & Invoices</h1>
          <p className="text-xs text-slate-500">Generate guest invoices, record payment receipts, track receivables and settle folios.</p>
        </div>

        <button
          onClick={() => handleOpenRecordModal()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Inflow Collected</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {currency}{metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">From {data.payments.length} settled transactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Outstanding Receivables</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {currency}{metrics.pendingPaymentsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Uncollected active guest balance</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Collections</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {currency}{metrics.todaysRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Processed today at cashier desk</span>
        </div>
      </div>

      {/* Sub tabs (Invoices vs Payments) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'invoices'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Guest Invoices & Folios ({data.bookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('payments')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Payment Receipts Journal ({data.payments.length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by guest, room, reference..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        {activeSubTab === 'invoices' ? (
          <select
            value={paymentStatusFilter}
            onChange={e => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white w-full sm:w-auto"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid (Settled)</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        ) : (
          <select
            value={paymentMethodFilter}
            onChange={e => setPaymentMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white w-full sm:w-auto"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        )}
      </div>

      {/* Tables based on subtab */}
      {activeSubTab === 'invoices' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 border-b border-slate-200 bg-slate-50 font-semibold">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Guest</th>
                  <th className="p-3.5">Room</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Folio Total</th>
                  <th className="p-3.5">Paid</th>
                  <th className="p-3.5">Pending</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(b => {
                    const payStatus = b.pendingAmount <= 0 ? 'Paid' : b.paidAmount > 0 ? 'Partial' : 'Pending';
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-indigo-600">
                          {data.settings.invoicePrefix || 'INV-'}{b.bookingId.replace(/[^0-9]/g, '') || '101'}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{b.guestName}</p>
                          <p className="text-[10px] text-slate-500">{b.mobile}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800">Room {b.roomNumber}</span>
                          <p className="text-[10px] text-slate-500">{b.roomTypeName}</p>
                        </td>
                        <td className="p-3.5">
                          {b.nights} night{b.nights > 1 ? 's' : ''}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{currency}{b.grandTotal.toFixed(2)}</td>
                        <td className="p-3.5 text-emerald-600 font-semibold">{currency}{b.paidAmount.toFixed(2)}</td>
                        <td className="p-3.5">
                          {b.pendingAmount > 0 ? (
                            <span className="font-bold text-rose-600">{currency}{b.pendingAmount.toFixed(2)}</span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">Settled</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={payStatus} size="sm" />
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {b.pendingAmount > 0 && (
                              <button
                                onClick={() => handleOpenRecordModal(b.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors mr-1"
                              >
                                Pay
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const guest = data.guests.find(g => g.id === b.guestId);
                                const relPayments = data.payments.filter(p => p.bookingId === b.id);
                                const relOrders = data.restaurantOrders.filter(o => o.bookingId === b.id);
                                downloadInvoicePDF(b, guest, data.settings, relPayments, relOrders);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                              title="Download PDF Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedInvoiceBookingId(b.id)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="View / Print Tax Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Payments Journal */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 border-b border-slate-200 bg-slate-50 font-semibold">
                <tr>
                  <th className="p-3.5">Receipt Ref</th>
                  <th className="p-3.5">Guest</th>
                  <th className="p-3.5">Room</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600">{p.receiptNumber}</td>
                      <td className="p-3.5 font-bold text-slate-900">{p.guestName}</td>
                      <td className="p-3.5 font-medium">{p.roomNumber ? `Room ${p.roomNumber}` : 'General / POS'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{p.paymentMethod}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{p.date}</td>
                      <td className="p-3.5 font-bold text-emerald-600 text-sm">+{currency}{p.amount.toFixed(2)}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => downloadReceiptPDF(p, data.settings)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Download Receipt PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedReceiptId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View / Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Manual Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Record Cashier Payment</h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Link to Active Reservation (Optional)
                </label>
                <select
                  value={newPayment.bookingId}
                  onChange={e => handleBookingSelectInModal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="">-- Standalone / Unlinked Payment --</option>
                  {data.bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bookingId} - {b.guestName} (Room {b.roomNumber} • Pending: {currency}{b.pendingAmount.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={newPayment.guestName}
                    onChange={e => setNewPayment({ ...newPayment, guestName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room #</label>
                  <input
                    type="text"
                    value={newPayment.roomNumber}
                    onChange={e => setNewPayment({ ...newPayment, roomNumber: e.target.value })}
                    placeholder="e.g. 101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Amount ({currency}) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={newPayment.amount}
                    onChange={e => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={newPayment.paymentMethod}
                    onChange={e => setNewPayment({ ...newPayment, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / Digital QR</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Payment Classification *</label>
                  <select
                    value={newPayment.paymentType}
                    onChange={e => setNewPayment({ ...newPayment, paymentType: e.target.value as PaymentType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Advance">Advance Deposit</option>
                    <option value="Check-in">Check-in Deposit</option>
                    <option value="Room Service">Room Service / F&B</option>
                    <option value="Extra Service">Extra Service</option>
                    <option value="Settlement">Final Checkout Settlement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Cashier Reference</label>
                <textarea
                  rows={2}
                  value={newPayment.notes}
                  onChange={e => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder="Card auth code, transaction ID, bank reference..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Record Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
