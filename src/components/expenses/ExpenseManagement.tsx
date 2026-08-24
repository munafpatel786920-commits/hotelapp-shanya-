import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types/hotel';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  TrendingDown,
  Plus,
  Search,
  DollarSign,
  Trash2,
  PieChart as PieIcon,
  Tag,
  Calendar,
  CreditCard,
  Building2,
  X
} from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';

export const ExpenseManagement: React.FC = () => {
  const { data, addExpense, deleteExpense, metrics } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const categories: ExpenseCategory[] = [
    'Electricity',
    'Water',
    'Salary',
    'Maintenance',
    'Food',
    'Cleaning',
    'Internet',
    'Supplies',
    'Other'
  ];

  const [formData, setFormData] = useState({
    description: '',
    category: 'Food' as ExpenseCategory,
    amount: 1500,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI' as PaymentMethod,
    notes: ''
  });

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter(e => {
      const matchSearch =
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || e.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [data.expenses, searchQuery, categoryFilter]);

  // Category totals for summary cards
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    data.expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [data.expenses]);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    addExpense({
      description: formData.description,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      addedBy: data.currentUser.fullName,
      notes: formData.notes
    });

    setIsModalOpen(false);
    setFormData({
      description: '',
      category: 'Food',
      amount: 1500,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      notes: ''
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 rounded-full">
              Cost Control & Ledger (India)
            </span>
            <span className="text-xs text-slate-500">Total Outflow: {formatINR(metrics.totalExpenses)}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Operational Expenses</h1>
          <p className="text-xs text-slate-500">Log utility bills, kitchen supplies, repair contractors, staff payroll disbursements and overheads.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Operating Expenses</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {formatINR(metrics.totalExpenses)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">From {data.expenses.length} voucher records</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Inflow Revenue</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatINR(metrics.totalRevenue)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Total payments received</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Operating Profit</span>
          <p className={`text-2xl font-bold mt-1 ${metrics.netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatINR(metrics.netProfit)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Inflow minus operational expenses</span>
        </div>
      </div>

      {/* Category Mini Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(categoryBreakdown).slice(0, 4).map(([cat, amt]) => (
          <div key={cat} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-semibold block truncate">{cat}</span>
            <span className="text-sm font-extrabold text-slate-900 mt-1 block">{formatINR(amt as number)}</span>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search expense description, notes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
        >
          <option value="ALL">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Expense Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3.5 font-semibold">Expense Description / Item</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Date</th>
                <th className="p-3.5 font-semibold">Payment Mode</th>
                <th className="p-3.5 font-semibold">Approved By</th>
                <th className="p-3.5 font-semibold">Amount</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-sm">{e.description}</p>
                      {e.notes && <p className="text-[10px] text-slate-500">{e.notes}</p>}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">{e.date}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{e.paymentMethod}</td>
                    <td className="p-3.5 text-slate-500">{e.addedBy}</td>
                    <td className="p-3.5 font-bold text-rose-600 text-sm">-{formatINR(e.amount)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setExpenseToDelete(e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Record Operating Expense</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Description / Invoice Ref *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Organic Dairy & Vegetables Bulk Order"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                >
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Card">Corporate Credit / Debit Card</option>
                  <option value="Cash">Petty Cash</option>
                  <option value="UPI">UPI / Digital</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Vendor Name</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Supplier name, purchase order ref..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  Post Expense Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        title={`Delete Expense Voucher?`}
        message={`Are you sure you want to remove the expense "${expenseToDelete?.description}" of ${formatINR(expenseToDelete?.amount || 0)}?`}
        confirmLabel="Delete Voucher"
        isDestructive={true}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
