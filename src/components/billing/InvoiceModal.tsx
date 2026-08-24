import React, { useEffect, useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Printer, X, Building2, Phone, Mail, MapPin, ShieldCheck, FileText, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { formatINR, calculateGST, SAC_CODES } from '../../utils/indiaUtils';
import { printInvoice, downloadInvoicePDF } from '../../utils/printUtils';

export const InvoiceModal: React.FC = () => {
  const { data, selectedInvoiceBookingId, setSelectedInvoiceBookingId } = useHotel();
  const [isDownloading, setIsDownloading] = useState(false);

  // Keyboard shortcut: Press Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedInvoiceBookingId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedInvoiceBookingId]);

  if (!selectedInvoiceBookingId) return null;

  const booking = data.bookings.find(b => b.id === selectedInvoiceBookingId);
  if (!booking) return null;

  const guest = data.guests.find(g => g.id === booking.guestId);
  const relatedPayments = data.payments.filter(p => p.bookingId === booking.id);
  const relatedOrders = data.restaurantOrders.filter(o => o.bookingId === booking.id);
  const relatedServices = booking.serviceCharges || [];

  const handlePrint = () => {
    printInvoice(booking, guest, data.settings, relatedPayments, relatedOrders);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDF(booking, guest, data.settings, relatedPayments, relatedOrders);
    } catch (err) {
      console.error('Invoice PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    setSelectedInvoiceBookingId(null);
  };

  const invoiceNum = `${data.settings.invoicePrefix || 'INV-2026-'}${booking.bookingId.replace(/[^0-9]/g, '') || '101'}`;

  // Check if inter-state (e.g. guest state != hotel state)
  const isInterState = Boolean(guest?.state && data.settings.state && guest.state.toLowerCase() !== data.settings.state.toLowerCase());
  const taxableSubtotal = booking.roomCharges + booking.extraCharges - booking.discount;
  const gstBreakdown = calculateGST(taxableSubtotal, data.settings.taxPercentage || 12, isInterState);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleBack();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-in fade-in"
    >
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:border-none print:shadow-none print:bg-white print:text-black print:my-0 print:p-4">
        {/* Top actions (hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs border border-slate-200"
              title="Wapas jayein / Go Back (Esc)"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>← Back</span>
            </button>
            <span className="font-mono text-xs font-bold text-indigo-700 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              GST TAX INVOICE #{invoiceNum}
            </span>
            <StatusBadge status={booking.status} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              title="Download Tax Invoice as PDF"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isDownloading ? 'Saving...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print GST Invoice</span>
            </button>
            <button
              onClick={handleBack}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              title="Close / Wapas (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area starts */}
        <div className="space-y-6 text-slate-700 print:text-black">
          {/* Header Hotel Info & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-200 print:border-slate-300">
            <div>
              <div className="flex items-center gap-3">
                {data.settings.logoUrl ? (
                  <img
                    src={data.settings.logoUrl}
                    alt="AL-KAREEM Logo"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-2xl object-cover border border-amber-300 shadow-sm print:w-11 print:h-11 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 print:text-black font-display uppercase">{data.settings.hotelName}</h2>
                  <p className="text-xs text-amber-700 print:text-slate-700 font-semibold">{data.settings.tagline}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 print:text-slate-600 space-y-0.5">
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {data.settings.address}, {data.settings.city}, {data.settings.state} - {data.settings.zipCode}, {data.settings.country}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {data.settings.mobile} • <Mail className="w-3.5 h-3.5 text-slate-400" /> {data.settings.email}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"><strong>GSTIN:</strong> {data.settings.gstNumber || '27AABCG1234F1ZN'}</span>
                  {data.settings.panNumber && <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"><strong>PAN:</strong> {data.settings.panNumber}</span>}
                  {data.settings.fssaiNumber && <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"><strong>FSSAI:</strong> {data.settings.fssaiNumber}</span>}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <h1 className="text-xl font-black text-slate-900 print:text-black tracking-wider uppercase">GST Tax Invoice</h1>
              <p className="font-mono font-bold text-indigo-600 print:text-black text-sm">{invoiceNum}</p>
              <p className="text-slate-500 print:text-slate-600">Booking ID: <strong className="text-slate-900 print:text-black">{booking.bookingId}</strong></p>
              <p className="text-slate-500 print:text-slate-600">Invoice Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p className="text-slate-500 print:text-slate-600">Place of Supply: <strong className="text-slate-900 print:text-black">{data.settings.state || 'Maharashtra'} (State Code 27)</strong></p>
              <p className="text-slate-500 print:text-slate-600">Status: <strong className="text-indigo-600 print:text-black">{booking.status}</strong></p>
            </div>
          </div>

          {/* Billed To / Guest & Stay Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 print:bg-slate-50 print:border-slate-200 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">Billed To (Guest / Corporate)</p>
              <p className="text-sm font-bold text-slate-900 print:text-black">{booking.guestName}</p>
              {guest?.companyName && (
                <p className="text-xs font-semibold text-indigo-700">Company: {guest.companyName}</p>
              )}
              {guest?.gstin && (
                <p className="font-mono text-xs text-slate-700"><strong>Guest GSTIN:</strong> {guest.gstin}</p>
              )}
              <p className="text-slate-500 print:text-slate-600">Mobile: {booking.mobile}</p>
              <p className="text-slate-500 print:text-slate-600">Email: {booking.email}</p>
              {guest?.address && (
                <p className="text-slate-500 print:text-slate-600">Address: {guest.address}, {guest.city}, {guest.state} {guest.pincode ? `- ${guest.pincode}` : ''}</p>
              )}
              {guest && (
                <p className="text-slate-500 print:text-slate-600">ID Proof: {guest.idProofType} ({guest.idProofNumber})</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">Stay & Tariff Details</p>
              <p className="text-slate-900 print:text-black font-semibold">Room: <strong>Room {booking.roomNumber}</strong> ({booking.roomTypeName})</p>
              <p className="text-slate-500 print:text-slate-600">Check-in: {booking.checkInDate} ({booking.checkInTime || '14:00'})</p>
              <p className="text-slate-500 print:text-slate-600">Check-out: {booking.checkOutDate} ({booking.checkOutTime || '11:00'})</p>
              <p className="text-slate-500 print:text-slate-600">Total Duration: <strong>{booking.nights} night{booking.nights > 1 ? 's' : ''}</strong></p>
              <p className="text-slate-500 print:text-slate-600">Occupancy: {booking.adults} Adults, {booking.children} Children</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto border border-slate-200 print:border-slate-300 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-600 print:text-slate-700 bg-slate-50 border-b border-slate-200 print:border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-2 font-semibold text-center">SAC Code</th>
                  <th className="py-2.5 px-2 font-semibold text-center">Qty / Nights</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Rate</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Taxable Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200 text-slate-700 print:text-slate-900">
                {/* Room charge */}
                <tr>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-slate-900 print:text-black">Room Tariff ({booking.roomTypeName})</p>
                    <span className="text-[10px] text-slate-400">Room #{booking.roomNumber} - Accommodation Services</span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-600">{SAC_CODES.ROOM_ACCOMMODATION.code}</td>
                  <td className="py-2.5 px-2 text-center">{booking.nights}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(booking.roomRate)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">{formatINR(booking.roomCharges)}</td>
                </tr>

                {/* Restaurant Orders if any */}
                {relatedOrders.map(order => (
                  <tr key={order.id}>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-slate-900 print:text-black">Restaurant F&B: {order.orderNumber}</p>
                      <span className="text-[10px] text-slate-400">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-600">{SAC_CODES.FOOD_RESTAURANT.code}</td>
                    <td className="py-2.5 px-2 text-center">{order.items.length} items</td>
                    <td className="py-2.5 px-2 text-right">-</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{formatINR(order.subtotal)}</td>
                  </tr>
                ))}

                {/* Extra Services if any */}
                {relatedServices.map(srv => {
                  const sac = srv.category === 'Laundry' ? SAC_CODES.LAUNDRY_SERVICE.code :
                              srv.category === 'Spa' ? SAC_CODES.SPA_WELLNESS.code :
                              srv.category === 'Transport' ? SAC_CODES.TRANSPORT_CAB.code :
                              SAC_CODES.OTHER_SERVICES.code;
                  return (
                    <tr key={srv.id}>
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-slate-900 print:text-black">Extra Service: {srv.serviceName}</p>
                        <span className="text-[10px] text-slate-400">{srv.category}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-600">{sac}</td>
                      <td className="py-2.5 px-2 text-center">{srv.quantity}</td>
                      <td className="py-2.5 px-2 text-right">{formatINR(srv.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{formatINR(srv.totalPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals and Calculation Box */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            {/* Payment history box */}
            <div className="w-full sm:w-1/2 space-y-2">
              <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Payment & Settlement Details</p>
              {relatedPayments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No payments recorded yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {relatedPayments.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 print:bg-slate-100 text-xs flex justify-between">
                      <div>
                        <span className="font-mono text-indigo-700 print:text-black font-semibold">{p.receiptNumber}</span>
                        <p className="text-[10px] text-slate-500 print:text-slate-600">{p.paymentType} via {p.paymentMethod} {p.transactionRef ? `(${p.transactionRef})` : ''}</p>
                      </div>
                      <span className="font-bold text-emerald-600 print:text-emerald-700">+{formatINR(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations & GST Breakdown */}
            <div className="w-full sm:w-1/2 space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-500 print:text-slate-600">
                <span>Total Taxable Value:</span>
                <span className="text-slate-900 print:text-black font-medium">{formatINR(taxableSubtotal)}</span>
              </div>

              {booking.discount > 0 && (
                <div className="flex justify-between text-emerald-600 print:text-emerald-700">
                  <span>Special Discount:</span>
                  <span>-{formatINR(booking.discount)}</span>
                </div>
              )}

              {/* GST Split */}
              {isInterState ? (
                <div className="flex justify-between text-slate-500 print:text-slate-600">
                  <span>IGST ({gstBreakdown.igstRate}%):</span>
                  <span className="text-slate-900 print:text-black font-medium">+{formatINR(gstBreakdown.igstAmount)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-500 print:text-slate-600">
                    <span>CGST ({gstBreakdown.cgstRate}%):</span>
                    <span className="text-slate-900 print:text-black font-medium">+{formatINR(gstBreakdown.cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 print:text-slate-600">
                    <span>SGST ({gstBreakdown.sgstRate}%):</span>
                    <span className="text-slate-900 print:text-black font-medium">+{formatINR(gstBreakdown.sgstAmount)}</span>
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-slate-200 print:border-slate-400 flex justify-between text-sm font-bold">
                <span className="text-slate-900 print:text-black">Invoice Grand Total:</span>
                <span className="text-indigo-700 print:text-black">{formatINR(booking.grandTotal)}</span>
              </div>

              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 print:text-slate-600">Total Paid (Advance + Settlement):</span>
                <span className="text-emerald-600 print:text-emerald-700">{formatINR(booking.paidAmount)}</span>
              </div>

              <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200 print:border-slate-300">
                <span className="text-slate-700 print:text-slate-800">Balance Pending:</span>
                <span className={booking.pendingAmount > 0 ? 'text-rose-600 print:text-rose-700' : 'text-emerald-600 print:text-emerald-700'}>
                  {formatINR(booking.pendingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer terms & Signature */}
          <div className="pt-6 border-t border-slate-200 print:border-slate-300 text-[10px] text-slate-500 print:text-slate-600 space-y-4">
            <div className="flex justify-between items-end">
              <div className="max-w-md text-left">
                <p className="font-semibold text-slate-700">Terms & Conditions:</p>
                <p>{data.settings.termsAndConditions || 'Government photo ID required at check-in. Standard checkout is 11:00 AM. Computer generated invoice.'}</p>
              </div>
              <div className="text-center min-w-[150px] flex flex-col items-center">
                {data.settings.signatureUrl ? (
                  <img
                    src={data.settings.signatureUrl}
                    alt="Authorized Signature"
                    referrerPolicy="no-referrer"
                    className="h-14 max-w-[160px] object-contain mix-blend-multiply mb-0.5 print:h-12"
                  />
                ) : (
                  <div className="h-10 border-b border-slate-300 w-36 mb-1"></div>
                )}
                <div className="w-40 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-slate-800 text-[11px] print:text-black">Authorized Signatory</p>
                <p className="text-[10px] font-semibold text-slate-600 print:text-black">{data.settings.signatoryTitle || 'S PATEL (General Manager)'}</p>
                <p className="text-[9px] text-slate-400 print:text-slate-500 uppercase">{data.settings.hotelName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Back & Action Bar (Hidden on print) */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <p className="text-xs text-slate-500">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-700">Esc</kbd> or click outside to go back.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleBack}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Invoices</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isDownloading ? 'Saving PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

