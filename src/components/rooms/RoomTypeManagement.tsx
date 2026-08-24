import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { RoomType, BedType } from '../../types/hotel';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Layers, Plus, Edit2, Trash2, BedDouble, Users, Check, X, ArrowLeft } from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';

export const RoomTypeManagement: React.FC = () => {
  const { data, addRoomType, updateRoomType, deleteRoomType, setActiveTab } = useHotel();
  const currency = data.settings.currencySymbol || '$';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<RoomType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    basePrice: 150,
    capacity: 2,
    bedType: 'Double' as BedType,
    amenities: ['Free High-Speed Wi-Fi', 'Air Conditioning'],
    description: '',
    amenityInput: ''
  });

  const openAddModal = () => {
    setEditingType(null);
    setFormData({
      name: '',
      code: '',
      basePrice: 150,
      capacity: 2,
      bedType: 'Double',
      amenities: ['Free High-Speed Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Ensuite Bathroom'],
      description: '',
      amenityInput: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rt: RoomType) => {
    setEditingType(rt);
    setFormData({
      name: rt.name,
      code: rt.code,
      basePrice: rt.basePrice,
      capacity: rt.capacity,
      bedType: rt.bedType,
      amenities: [...rt.amenities],
      description: rt.description || '',
      amenityInput: ''
    });
    setIsModalOpen(true);
  };

  const handleAddAmenity = () => {
    if (formData.amenityInput.trim() && !formData.amenities.includes(formData.amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, prev.amenityInput.trim()],
        amenityInput: ''
      }));
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      code: (formData.code || formData.name.substring(0, 3)).toUpperCase(),
      basePrice: Number(formData.basePrice),
      capacity: Number(formData.capacity),
      bedType: formData.bedType,
      amenities: formData.amenities,
      description: formData.description
    };

    if (editingType) {
      updateRoomType(editingType.id, payload);
    } else {
      addRoomType(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('rooms')}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                Configuration
              </span>
              <span className="text-xs font-medium text-slate-500">{data.roomTypes.length} Categories</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Room Types & Tariffs</h1>
            <p className="text-xs text-slate-500">Manage base room types, amenities packages, and standard pricing.</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room Type</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.roomTypes.map(rt => {
          const roomCount = data.rooms.filter(r => r.roomTypeId === rt.id).length;

          return (
            <div
              key={rt.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                      {rt.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">{rt.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-slate-400">Base Tariff</span>
                    <p className="text-xl font-bold text-slate-900">{formatINR(rt.basePrice)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-indigo-500" />
                    <span>{rt.bedType} Bed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Max {rt.capacity} Guests</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                  {rt.description || 'Standard luxury hotel room package.'}
                </p>

                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-slate-700 block mb-2">Standard Amenities</span>
                  <div className="flex flex-wrap gap-1">
                    {rt.amenities.map((a, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-900 font-bold">{roomCount}</strong> room{roomCount !== 1 ? 's' : ''} assigned
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(rt)}
                    className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTypeToDelete(rt)}
                    className="p-2 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingType ? `Edit ${editingType.name}` : 'Create Room Type'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Type Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Deluxe Suite, Presidential Penthouse"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Code (3-4 chars) *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DLX, SUT, FAM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Base Nightly Tariff (₹ INR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Max Capacity (Persons) *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1.5">Bed Configuration</label>
                  <select
                    value={formData.bedType}
                    onChange={e => setFormData({ ...formData, bedType: e.target.value as BedType })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Single">Single Bed</option>
                    <option value="Double">Double Bed</option>
                    <option value="Queen">Queen Bed</option>
                    <option value="King">King Bed</option>
                    <option value="Twin">Twin Beds</option>
                    <option value="Bunk Bed">Bunk Bed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Included Amenities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.amenityInput}
                    onChange={e => setFormData({ ...formData, amenityInput: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    placeholder="e.g. Jacuzzi, Smart Room Control..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {formData.amenities.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-white text-slate-700 rounded-lg border border-slate-200 shadow-xs">
                      {a}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(a)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of this room tier..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  {editingType ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(typeToDelete)}
        title={`Delete Room Type ${typeToDelete?.name}?`}
        message="Are you sure you want to remove this room category? Rooms assigned to this category will need reassigning."
        confirmLabel="Delete Type"
        isDestructive={true}
        onConfirm={() => {
          if (typeToDelete) {
            deleteRoomType(typeToDelete.id);
            setTypeToDelete(null);
          }
        }}
        onCancel={() => setTypeToDelete(null)}
      />
    </div>
  );
};
