import React, { useEffect, useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Printer, X, CheckCircle, CreditCard, Building2, Calendar, User, QrCode, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';
import { printReceipt, downloadReceiptPDF } from '../../utils/printUtils';

export const ReceiptModal: React.FC = () => {
  const { data, selectedReceiptId, setSelectedReceiptId } = useHotel();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedReceiptId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedReceiptId]);

  if (!selectedReceiptId) return null;

  const payment = data.payments.find(p => p.id === selectedReceiptId);
  if (!payment) return null;

  const handlePrint = () => {
    printReceipt(payment, data.settings);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadReceiptPDF(payment, data.settings);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    setSelectedReceiptId(null);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleBack();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm print:p-0 print:bg-white animate-in fade-in"
    >
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 print:border-none print:shadow-none print:bg-white print:text-black print:p-0 animate-in zoom-in-95">
        {/* Actions header (hidden when printing) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
              title="Wapas jayein / Go Back (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <h3 className="text-xs font-bold text-slate-900">Payment Receipt</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              title="Download Receipt as PDF"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloading ? 'Saving...' : 'PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleBack}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="space-y-4 text-xs text-slate-700 print:text-black">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-100 print:border-slate-300">
            {data.settings.logoUrl && (
              <img
                src={data.settings.logoUrl}
                alt="AL-KAREEM Logo"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover border border-amber-300 mx-auto mb-2 shadow-xs"
              />
            )}
            <h2 className="text-base font-bold text-slate-900 print:text-black uppercase font-display">{data.settings.hotelName}</h2>
            <p className="text-[11px] text-slate-500 print:text-slate-600">{data.settings.address}, {data.settings.city}, {data.settings.state}</p>
            <p className="text-[11px] text-slate-500 print:text-slate-600">GSTIN: {data.settings.gstNumber} • Tel: {data.settings.mobile}</p>
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 print:bg-slate-100 print:text-black font-bold font-mono text-xs border border-emerald-200">
              OFFICIAL MONEY RECEIPT: {payment.receiptNumber}
            </div>
          </div>

          {/* Amount Paid Big Callout */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Amount Received</span>
            <p className="text-3xl font-extrabold text-slate-900 print:text-black mt-0.5">
              {formatINR(payment.amount)}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Status: Received & Credited</span>
          </div>

          {/* Key fields */}
          <div className="p-3.5 bg-slate-50 print:bg-slate-50 rounded-2xl border border-slate-200 print:border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 print:text-slate-600">Received From:</span>
              <span className="font-bold text-slate-900 print:text-black">{payment.guestName}</span>
            </div>
            {payment.roomNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-slate-600">Room Number:</span>
                <span className="font-semibold text-slate-900 print:text-black">Room #{payment.roomNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 print:text-slate-600">Payment Category:</span>
              <span className="font-semibold text-indigo-600 print:text-black">{payment.paymentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 print:text-slate-600">Payment Mode:</span>
              <span className="font-semibold text-slate-900 print:text-black flex items-center gap-1">
                {payment.paymentMethod === 'UPI' && <QrCode className="w-3.5 h-3.5 text-indigo-600" />}
                {payment.paymentMethod}
              </span>
            </div>
            {payment.transactionRef && (
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-slate-600">UTR / Ref No:</span>
                <span className="font-mono text-[11px] text-slate-800">{payment.transactionRef}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 print:text-slate-600">Date & Time:</span>
              <span className="font-mono text-slate-600 print:text-slate-700">{payment.date}</span>
            </div>
            {payment.notes && (
              <div className="pt-1.5 border-t border-slate-200 print:border-slate-300 text-[11px]">
                <span className="text-slate-500 print:text-slate-600">Note: </span>
                <span className="italic text-slate-700 print:text-slate-700">{payment.notes}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 print:border-slate-300 flex flex-col items-center text-center text-[10px] text-slate-400 print:text-slate-600 space-y-1">
            {data.settings.signatureUrl && (
              <img
                src={data.settings.signatureUrl}
                alt="Authorized Signature"
                referrerPolicy="no-referrer"
                className="h-10 max-w-[120px] object-contain mix-blend-multiply mb-0.5 print:h-9"
              />
            )}
            <div className="w-28 border-b border-slate-300 mb-0.5"></div>
            <p className="font-semibold text-slate-700 print:text-black">Authorized Signatory: <strong className="text-slate-900">{payment.createdByName || data.settings.signatoryTitle || data.currentUser.fullName}</strong></p>
            <p>Thank you for staying at {data.settings.hotelName}!</p>
          </div>
        </div>

        {/* Bottom Back, PDF Download and Print Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 print:hidden">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloading ? 'Saving PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
