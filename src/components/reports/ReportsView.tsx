import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  BedDouble,
  Users,
  UtensilsCrossed,
  Receipt,
  Printer,
  PieChart,
  BarChart3,
  ArrowUpRight,
  FileCheck2,
  FileSpreadsheet
} from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';

export const ReportsView: React.FC = () => {
  const { data, metrics, exportDataAsJSON } = useHotel();

  const [dateRange, setDateRange] = useState<'today' | 'month' | 'year' | 'all'>('month');

  // Department revenue breakdown
  const roomRevenue = data.bookings.reduce((sum, b) => sum + b.roomCharges, 0);
  const restaurantRevenue = data.restaurantOrders.reduce((sum, o) => sum + o.total, 0);
  const extraServicesRevenue = data.bookings.reduce(
    (sum, b) => sum + (b.serviceCharges ? b.serviceCharges.reduce((sSum, s) => sSum + s.totalPrice, 0) : 0),
    0
  );
  const totalGrossSales = roomRevenue + restaurantRevenue + extraServicesRevenue;

  // Total GST Collected across all bookings and restaurant
  const totalRoomGST = data.bookings.reduce((sum, b) => sum + (b.tax || 0), 0);
  const totalRestaurantGST = data.restaurantOrders.reduce((sum, o) => sum + (o.total * 5) / 105, 0);
  const totalGSTCollected = totalRoomGST + totalRestaurantGST;
  const totalCGST = totalGSTCollected / 2;
  const totalSGST = totalGSTCollected / 2;

  // Occupancy rate calculation
  const totalRooms = data.rooms.length || 1;
  const occupiedCount = data.rooms.filter(r => r.status === 'Occupied').length;
  const occupancyPercent = ((occupiedCount / totalRooms) * 100).toFixed(1);

  // Expense breakdown by category
  const expenseByCategory = data.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportGSTR1 = () => {
    const rows = [
      ['GSTR-1 Tax Summary Report', data.settings.hotelName, 'GSTIN: ' + data.settings.gstNumber],
      ['Generated On', new Date().toLocaleDateString('en-IN')],
      [],
      ['Invoice No', 'Date', 'Guest Name', 'State of Supply', 'Taxable Value (INR)', 'GST Rate', 'CGST (INR)', 'SGST (INR)', 'Total Amount (INR)'],
      ...data.bookings.map(b => {
        const taxable = b.roomCharges + b.extraCharges - b.discount;
        const taxVal = b.tax || 0;
        return [
          `INV-${b.bookingId}`,
          b.checkInDate,
          `"${b.guestName}"`,
          data.settings.state || 'India',
          taxable.toFixed(2),
          `${data.settings.taxPercentage}%`,
          (taxVal / 2).toFixed(2),
          (taxVal / 2).toFixed(2),
          b.grandTotal.toFixed(2)
        ];
      })
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GSTR1_Report_${data.settings.hotelName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              Financial & GST Audit Intelligence (India)
            </span>
            <span className="text-xs text-slate-500">P&L and GST Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Operational Analytics & GST Reports</h1>
          <p className="text-xs text-slate-500">Property revenue, GSTR-1 summaries, operational expenses and net margins.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGSTR1}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export GSTR-1 CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={exportDataAsJSON}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Inflow Collected</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatINR(metrics.totalRevenue)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">From all settled receipts (INR)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Operating Expenses</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {formatINR(metrics.totalExpenses)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Salaries, utilities, maintenance</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Operating Profit</span>
          <p className={`text-2xl font-bold mt-1 ${metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatINR(metrics.netProfit)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Gross Revenue minus Operating Costs</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Occupancy Rate</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{occupancyPercent}%</p>
          <span className="text-[10px] text-slate-400 mt-1 block">{occupiedCount} of {totalRooms} rooms occupied</span>
        </div>
      </div>

      {/* GST Summary Card for India */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] uppercase tracking-wider border border-emerald-500/30">
              GST Compliance (India)
            </span>
            <span className="text-xs text-slate-400">GSTIN: {data.settings.gstNumber}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Total GST Tax Liability: {formatINR(totalGSTCollected)}</h3>
          <p className="text-xs text-slate-400">Breakdown for GSTR-1 and GSTR-3B filings</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full md:w-auto">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
            <p className="text-[10px] text-slate-300 font-medium">CGST (Central Tax)</p>
            <p className="text-sm font-bold text-emerald-400">{formatINR(totalCGST)}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
            <p className="text-[10px] text-slate-300 font-medium">SGST (State Tax)</p>
            <p className="text-sm font-bold text-emerald-400">{formatINR(totalSGST)}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 col-span-2 sm:col-span-1">
            <p className="text-[10px] text-slate-300 font-medium">Place of Supply</p>
            <p className="text-sm font-bold text-white">{data.settings.state || 'Maharashtra'}</p>
          </div>
        </div>
      </div>

      {/* Revenue Stream Breakdown & Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Stream */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Revenue Streams Breakdown</span>
            </h3>
            <span className="text-xs text-indigo-600 font-bold">
              Total: {formatINR(totalGrossSales)}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Rooms */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-indigo-600" />
                  Room Accommodation Bookings
                </span>
                <span className="text-slate-900">{formatINR(roomRevenue)} ({totalGrossSales ? ((roomRevenue / totalGrossSales) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${totalGrossSales ? (roomRevenue / totalGrossSales) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Restaurant */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                  Restaurant & In-Room Dining
                </span>
                <span className="text-slate-900">{formatINR(restaurantRevenue)} ({totalGrossSales ? ((restaurantRevenue / totalGrossSales) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${totalGrossSales ? (restaurantRevenue / totalGrossSales) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Extra Services */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Concierge & Extra Services
                </span>
                <span className="text-slate-900">{formatINR(extraServicesRevenue)} ({totalGrossSales ? ((extraServicesRevenue / totalGrossSales) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalGrossSales ? (extraServicesRevenue / totalGrossSales) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-rose-600" />
              <span>Operational Expense Distribution</span>
            </h3>
            <span className="text-xs text-rose-600 font-bold">
              Total: {formatINR(metrics.totalExpenses)}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(expenseByCategory).length === 0 ? (
              <p className="text-slate-400 italic py-4">No expense entries recorded.</p>
            ) : (
              Object.entries(expenseByCategory).map(([cat, amount]) => {
                const pct = metrics.totalExpenses ? ((amount / metrics.totalExpenses) * 100).toFixed(1) : '0';
                return (
                  <div key={cat} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{cat}</span>
                      <p className="text-[10px] text-slate-500">{pct}% of total operational costs</p>
                    </div>
                    <span className="font-bold text-rose-600">{formatINR(amount)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
