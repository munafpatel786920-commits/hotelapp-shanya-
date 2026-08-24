import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { ExtraService, ServiceCategory, Booking } from '../../types/hotel';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  ConciergeBell,
  Plus,
  Search,
  CheckCircle,
  X,
  Sparkles,
  Car,
  Shirt,
  Coffee,
  BedDouble,
  DollarSign,
  Trash2,
  Edit
} from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';

export const ExtraServices: React.FC = () => {
  const {
    data,
    addExtraService,
    updateExtraService,
    deleteExtraService,
    chargeServiceToBooking
  } = useHotel();

  const currency = data.settings.currencySymbol || '$';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Charge Service to Room Modal
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [selectedServiceToCharge, setSelectedServiceToCharge] = useState<ExtraService | null>(null);
  const [targetBookingId, setTargetBookingId] = useState<string>('');
  const [serviceQuantity, setServiceQuantity] = useState<number>(1);
  const [serviceNotes, setServiceNotes] = useState<string>('');

  // Add / Edit Catalog Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ExtraService | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ExtraService | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    category: 'Laundry' as ServiceCategory,
    price: 25,
    unit: 'per piece',
    description: '',
    isAvailable: true
  });

  const categories: ServiceCategory[] = ['Laundry', 'Room Service', 'Transport', 'Spa', 'Extra Bed', 'Breakfast', 'Other'];

  // In-house bookings
  const checkedInBookings = data.bookings.filter(b => b.status === 'Checked-in');

  const filteredServices = useMemo(() => {
    return data.extraServices.filter(s => {
      const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [data.extraServices, categoryFilter, searchQuery]);

  const handleOpenChargeModal = (srv: ExtraService) => {
    setSelectedServiceToCharge(srv);
    setServiceQuantity(1);
    setServiceNotes('');
    setTargetBookingId(checkedInBookings[0]?.id || '');
    setIsChargeModalOpen(true);
  };

  const handleConfirmChargeToRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceToCharge || !targetBookingId) return;

    chargeServiceToBooking(targetBookingId, selectedServiceToCharge.id, serviceQuantity, serviceNotes);
    setIsChargeModalOpen(false);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name.trim()) return;

    if (editingService) {
      updateExtraService(editingService.id, serviceFormData);
    } else {
      addExtraService(serviceFormData);
    }
    setIsServiceModalOpen(false);
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceFormData({
      name: '',
      category: 'Laundry',
      price: 25,
      unit: 'per request',
      description: '',
      isAvailable: true
    });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (srv: ExtraService) => {
    setEditingService(srv);
    setServiceFormData({
      name: srv.name,
      category: srv.category,
      price: srv.price,
      unit: srv.unit,
      description: srv.description || '',
      isAvailable: srv.isAvailable
    });
    setIsServiceModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              Concierge & Guest Amenities
            </span>
            <span className="text-xs text-slate-500">Add-on Services & Room Charges</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Extra Services & Concierge</h1>
          <p className="text-xs text-slate-500">
            Manage laundry, airport transfers, spa treatments, extra bedding and charge directly to in-house guest folios.
          </p>
        </div>

        <button
          onClick={openAddServiceModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
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
            placeholder="Search services by name or category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              categoryFilter === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                categoryFilter === c ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(srv => (
          <div
            key={srv.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md uppercase">
                  {srv.category}
                </span>
                <span className="text-lg font-black text-slate-900">
                  {formatINR(srv.price)}
                  <span className="text-xs font-normal text-slate-500"> / {srv.unit}</span>
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 mt-2">{srv.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{srv.description}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditServiceModal(srv)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setServiceToDelete(srv)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleOpenChargeModal(srv)}
                disabled={checkedInBookings.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm"
              >
                <ConciergeBell className="w-3.5 h-3.5" />
                <span>Charge to Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Charge Service to Room Modal */}
      {isChargeModalOpen && selectedServiceToCharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <ConciergeBell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Post Charge to Guest Room</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{selectedServiceToCharge.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsChargeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmChargeToRoom} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Active In-House Guest *</label>
                <select
                  required
                  value={targetBookingId}
                  onChange={e => setTargetBookingId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {checkedInBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      Room #{b.roomNumber} - {b.guestName} ({b.bookingId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity ({selectedServiceToCharge.unit})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={serviceQuantity}
                    onChange={e => setServiceQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Bill Charge</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-indigo-600 font-extrabold text-sm">
                    {formatINR(selectedServiceToCharge.price * serviceQuantity)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Instructions (Optional)</label>
                <input
                  type="text"
                  value={serviceNotes}
                  onChange={e => setServiceNotes(e.target.value)}
                  placeholder="e.g. Express service, flight EK201 pickup..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChargeModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Confirm & Post to Folio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Extra Service Catalog Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingService ? 'Edit Extra Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.name}
                  onChange={e => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="e.g. Airport VIP Luxury Shuttle"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={serviceFormData.category}
                    onChange={e => setServiceFormData({ ...serviceFormData, category: e.target.value as ServiceCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={serviceFormData.price}
                    onChange={e => setServiceFormData({ ...serviceFormData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Description</label>
                <input
                  type="text"
                  value={serviceFormData.unit}
                  onChange={e => setServiceFormData({ ...serviceFormData, unit: e.target.value })}
                  placeholder="per person, per piece, per night, per trip..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceFormData.description}
                  onChange={e => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(serviceToDelete)}
        title={`Delete Service ${serviceToDelete?.name}?`}
        message="Are you sure you want to remove this service from the catalog?"
        confirmLabel="Delete Service"
        isDestructive={true}
        onConfirm={() => {
          if (serviceToDelete) {
            deleteExtraService(serviceToDelete.id);
            setServiceToDelete(null);
          }
        }}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
};
