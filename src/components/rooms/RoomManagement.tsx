import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Room, RoomStatus, BedType, CleaningStatus } from '../../types/hotel';
import { StatusBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  BedDouble,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Wrench,
  X,
  Building
} from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';

export const RoomManagement: React.FC = () => {
  const { data, addRoom, updateRoom, deleteRoom, setRoomStatus, setActiveTab } = useHotel();
  const currency = data.settings.currencySymbol || '$';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: data.roomTypes[0]?.id || '',
    floor: 1,
    bedType: 'Double' as BedType,
    capacity: 2,
    price: 120,
    status: 'Available' as RoomStatus,
    cleaningStatus: 'Clean' as CleaningStatus,
    amenities: ['Free High-Speed Wi-Fi', 'Air Conditioning', 'Flat-screen TV'],
    description: '',
    amenityInput: ''
  });

  const allFloors = useMemo(() => {
    const floors = Array.from(new Set(data.rooms.map(r => r.floor))).sort((a, b) => a - b);
    return floors;
  }, [data.rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return data.rooms.filter(room => {
      const matchesSearch =
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.roomTypeName && room.roomTypeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (room.currentGuestName && room.currentGuestName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedStatus === 'ALL' || room.status === selectedStatus;
      const matchesType = selectedRoomType === 'ALL' || room.roomTypeId === selectedRoomType;
      const matchesFloor = selectedFloor === 'ALL' || String(room.floor) === selectedFloor;

      return matchesSearch && matchesStatus && matchesType && matchesFloor;
    });
  }, [data.rooms, searchQuery, selectedStatus, selectedRoomType, selectedFloor]);

  const openAddModal = () => {
    const defaultType = data.roomTypes[0];
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      roomTypeId: defaultType ? defaultType.id : '',
      floor: 1,
      bedType: defaultType ? defaultType.bedType : 'Double',
      capacity: defaultType ? defaultType.capacity : 2,
      price: defaultType ? defaultType.basePrice : 120,
      status: 'Available',
      cleaningStatus: 'Clean',
      amenities: defaultType ? [...defaultType.amenities] : ['Wi-Fi', 'AC', 'TV'],
      description: '',
      amenityInput: ''
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      floor: room.floor,
      bedType: room.bedType,
      capacity: room.capacity,
      price: room.price,
      status: room.status,
      cleaningStatus: room.cleaningStatus,
      amenities: [...room.amenities],
      description: room.description || '',
      amenityInput: ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleRoomTypeChange = (typeId: string) => {
    const rType = data.roomTypes.find(rt => rt.id === typeId);
    if (rType) {
      setFormData(prev => ({
        ...prev,
        roomTypeId: typeId,
        price: rType.basePrice,
        capacity: rType.capacity,
        bedType: rType.bedType,
        amenities: [...rType.amenities]
      }));
    } else {
      setFormData(prev => ({ ...prev, roomTypeId: typeId }));
    }
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

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomNumber.trim()) return;

    const rType = data.roomTypes.find(rt => rt.id === formData.roomTypeId);

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        roomNumber: formData.roomNumber.trim(),
        roomTypeId: formData.roomTypeId,
        roomTypeName: rType?.name || 'Standard Room',
        floor: Number(formData.floor),
        bedType: formData.bedType,
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        status: formData.status,
        cleaningStatus: formData.cleaningStatus,
        amenities: formData.amenities,
        description: formData.description
      });
    } else {
      addRoom({
        roomNumber: formData.roomNumber.trim(),
        roomTypeId: formData.roomTypeId,
        roomTypeName: rType?.name || 'Standard Room',
        floor: Number(formData.floor),
        bedType: formData.bedType,
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        status: formData.status,
        cleaningStatus: formData.cleaningStatus,
        amenities: formData.amenities,
        description: formData.description
      });
    }

    setIsAddEditModalOpen(false);
  };

  const statuses: RoomStatus[] = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance', 'Out of Service'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Inventory
            </span>
            <span className="text-xs font-medium text-slate-500">{data.rooms.length} Rooms Configured</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Room Management</h1>
          <p className="text-xs text-slate-500">Configure room statuses, tariffs, amenities, and real-time inventory readiness.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('room-types')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
          >
            Manage Room Types
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search room # or guest..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Room Type Filter */}
          <select
            value={selectedRoomType}
            onChange={e => setSelectedRoomType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Room Types</option>
            {data.roomTypes.map(rt => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>

          {/* Floor Filter */}
          <select
            value={selectedFloor}
            onChange={e => setSelectedFloor(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Floors</option>
            {allFloors.map(f => (
              <option key={f} value={String(f)}>Floor {f}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table Display */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <BedDouble className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Rooms Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No rooms match your active filters or search term. Try resetting your search filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('ALL');
              setSelectedRoomType('ALL');
              setSelectedFloor('ALL');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Top header inside card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Room {room.roomNumber}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">Fl {room.floor}</span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{room.roomTypeName}</p>
                  </div>
                  <StatusBadge status={room.status} size="sm" />
                </div>

                {/* Pricing & Bed Info */}
                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400">Nightly Rate</span>
                    <p className="font-bold text-slate-900">{formatINR(room.price)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-slate-400">{room.bedType} Bed</span>
                    <p className="font-semibold text-slate-700">Max {room.capacity} {room.capacity > 1 ? 'Guests' : 'Guest'}</p>
                  </div>
                </div>

                {/* Active Guest or Housekeeping status */}
                {room.status === 'Occupied' && room.currentGuestName && (
                  <div className="mt-2.5 p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px]">
                    <span className="text-indigo-700 font-semibold">Guest:</span>{' '}
                    <span className="text-slate-900 font-medium">{room.currentGuestName}</span>
                  </div>
                )}

                {/* Amenities pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((a, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md truncate max-w-[130px]">
                      {a}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                {/* Status Quick Dropdown */}
                <select
                  value={room.status}
                  onChange={e => setRoomStatus(room.id, e.target.value as RoomStatus)}
                  className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
                  title="Quick Change Status"
                >
                  {statuses.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingRoom(room)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="View Room Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(room)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit Room"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRoomToDelete(room)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="p-3.5 font-semibold">Room #</th>
                  <th className="p-3.5 font-semibold">Room Type</th>
                  <th className="p-3.5 font-semibold">Floor</th>
                  <th className="p-3.5 font-semibold">Bed & Capacity</th>
                  <th className="p-3.5 font-semibold">Rate</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Housekeeping</th>
                  <th className="p-3.5 font-semibold">Occupant</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRooms.map(room => (
                  <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">Room {room.roomNumber}</td>
                    <td className="p-3.5 font-semibold text-indigo-600">{room.roomTypeName}</td>
                    <td className="p-3.5">Floor {room.floor}</td>
                    <td className="p-3.5">{room.bedType} • {room.capacity} Persons</td>
                    <td className="p-3.5 font-bold text-slate-900">{formatINR(room.price)}</td>
                    <td className="p-3.5">
                      <StatusBadge status={room.status} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[11px] font-semibold ${room.cleaningStatus === 'Clean' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {room.cleaningStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {room.currentGuestName ? (
                        <span className="font-semibold text-slate-900">{room.currentGuestName}</span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingRoom(room)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(room)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRoomToDelete(room)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <BedDouble className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Room Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. 101, 204, 305"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Room Type *
                  </label>
                  <select
                    value={formData.roomTypeId}
                    onChange={e => handleRoomTypeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    {data.roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} ({currency}{rt.basePrice}/night)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Floor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Floor Level *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.floor}
                    onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Bed Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Bed Configuration
                  </label>
                  <select
                    value={formData.bedType}
                    onChange={e => setFormData({ ...formData, bedType: e.target.value as BedType })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Single">Single Bed</option>
                    <option value="Double">Double Bed</option>
                    <option value="Queen">Queen Bed</option>
                    <option value="King">King Bed</option>
                    <option value="Twin">Twin Beds</option>
                    <option value="Bunk Bed">Bunk Bed</option>
                  </select>
                </div>

                {/* Max Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Max Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Nightly Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Room Price per Night (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Initial Room Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Room Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Cleaning Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Cleaning Readiness
                  </label>
                  <select
                    value={formData.cleaningStatus}
                    onChange={e => setFormData({ ...formData, cleaningStatus: e.target.value as CleaningStatus })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Clean">Clean & Ready</option>
                    <option value="Dirty">Dirty (Needs Turnover)</option>
                    <option value="In Progress">Cleaning In Progress</option>
                    <option value="Inspected">Inspected & Verified</option>
                  </select>
                </div>
              </div>

              {/* Amenities Manager */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Room Amenities
                </label>
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
                    placeholder="e.g. Jacuzzi, Mini Bar, Balcony View..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
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

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Room Description & Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Special attributes, layout details, view details..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
                >
                  {editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      {viewingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Room {viewingRoom.roomNumber}</h3>
                  <StatusBadge status={viewingRoom.status} size="sm" />
                </div>
                <p className="text-xs text-indigo-600 font-semibold">{viewingRoom.roomTypeName} • Floor {viewingRoom.floor}</p>
              </div>
              <button
                onClick={() => setViewingRoom(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Nightly Tariff:</span>
                  <p className="font-bold text-base text-slate-900">{formatINR(viewingRoom.price)}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Bed & Capacity:</span>
                  <p className="font-semibold text-slate-800">{viewingRoom.bedType} (Max {viewingRoom.capacity} guests)</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Housekeeping:</span>
                  <p className="font-semibold text-emerald-600">{viewingRoom.cleaningStatus}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Last Sanitized:</span>
                  <p className="font-semibold text-slate-700">{viewingRoom.lastCleaned || 'N/A'}</p>
                </div>
              </div>

              {viewingRoom.description && (
                <div>
                  <span className="font-semibold text-slate-800">Room Overview:</span>
                  <p className="mt-1 text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {viewingRoom.description}
                  </p>
                </div>
              )}

              <div>
                <span className="font-semibold text-slate-800">Amenities & Features:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {viewingRoom.amenities.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {viewingRoom.currentGuestName && (
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <p className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Active Guest In Residence</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{viewingRoom.currentGuestName}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  const r = viewingRoom;
                  setViewingRoom(null);
                  openEditModal(r);
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
              >
                Edit Details
              </button>
              <button
                onClick={() => setViewingRoom(null)}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(roomToDelete)}
        title={`Delete Room ${roomToDelete?.roomNumber}?`}
        message="Are you sure you want to permanently remove this room? This action cannot be undone."
        confirmLabel="Delete Room"
        isDestructive={true}
        onConfirm={() => {
          if (roomToDelete) {
            deleteRoom(roomToDelete.id);
            setRoomToDelete(null);
          }
        }}
        onCancel={() => setRoomToDelete(null)}
      />
    </div>
  );
};
