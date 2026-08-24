import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Guest, IdProofType } from '../../types/hotel';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StatusBadge } from '../common/Badge';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Calendar,
  CreditCard,
  X,
  Building,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { formatINR, INDIAN_STATES } from '../../utils/indiaUtils';

export const GuestManagement: React.FC = () => {
  const { data, addGuest, updateGuest, deleteGuest, setActiveTab, setSelectedInvoiceBookingId } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: data.settings.state || 'Maharashtra',
    pincode: '',
    country: 'India',
    idProofType: 'Aadhaar' as IdProofType,
    idProofNumber: '',
    gstin: '',
    companyName: '',
    panNumber: '',
    dob: '1990-01-01',
    gender: 'Male' as Guest['gender'],
    notes: ''
  });

  const filteredGuests = useMemo(() => {
    return data.guests.filter(g => {
      const matchSearch =
        g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.guestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.gstin && g.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
        g.idProofNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGender = selectedGender === 'ALL' || g.gender === selectedGender;

      return matchSearch && matchGender;
    });
  }, [data.guests, searchQuery, selectedGender]);

  const openAddModal = () => {
    setEditingGuest(null);
    setFormData({
      fullName: '',
      mobile: '',
      email: '',
      address: '',
      city: data.settings.city || 'Mumbai',
      state: data.settings.state || 'Maharashtra',
      pincode: '',
      country: 'India',
      idProofType: 'Aadhaar',
      idProofNumber: '',
      gstin: '',
      companyName: '',
      panNumber: '',
      dob: '1990-01-01',
      gender: 'Male',
      notes: ''
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (g: Guest) => {
    setEditingGuest(g);
    setFormData({
      fullName: g.fullName,
      mobile: g.mobile,
      email: g.email,
      address: g.address,
      city: g.city,
      state: g.state || data.settings.state || 'Maharashtra',
      pincode: g.pincode || '',
      country: g.country || 'India',
      idProofType: g.idProofType,
      idProofNumber: g.idProofNumber,
      gstin: g.gstin || '',
      companyName: g.companyName || '',
      panNumber: g.panNumber || '',
      dob: g.dob || '1990-01-01',
      gender: g.gender,
      notes: g.notes || ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.mobile.trim()) return;

    if (editingGuest) {
      updateGuest(editingGuest.id, formData);
    } else {
      addGuest(formData);
    }

    setIsAddEditModalOpen(false);
  };

  // Get guest stay history
  const getGuestBookings = (guestId: string) => {
    return data.bookings.filter(b => b.guestId === guestId);
  };

  // Get guest payments
  const getGuestPayments = (guestName: string) => {
    return data.payments.filter(p => p.guestName.toLowerCase() === guestName.toLowerCase());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              CRM & Directory
            </span>
            <span className="text-xs font-medium text-slate-500">{data.guests.length} Profiles Saved</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Guest Management</h1>
          <p className="text-xs text-slate-500">Manage guest identities, verified ID documents, stay records and billing history.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Guest</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, phone, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedGender}
            onChange={e => setSelectedGender(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 border-b border-slate-200 bg-slate-50 font-semibold">
              <tr>
                <th className="p-3.5">Guest ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">ID Proof</th>
                <th className="p-3.5">Stays</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No guests found matching your search.
                  </td>
                </tr>
              ) : (
                filteredGuests.map(guest => {
                  const stays = getGuestBookings(guest.id);
                  const totalSpend = stays.reduce((sum, s) => sum + s.grandTotal, 0);

                  return (
                    <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 bg-indigo-50/30">{guest.guestId}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 text-sm">{guest.fullName}</p>
                        <span className="text-[10px] text-slate-500">{guest.gender} • {guest.dob || 'DOB N/A'}</span>
                      </td>
                      <td className="p-3.5">
                        <p className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {guest.mobile}
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {guest.email}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <p className="text-slate-800 font-medium">{guest.city}, {guest.state || 'India'}</p>
                        {guest.companyName && (
                          <p className="text-[10px] text-indigo-600 font-semibold truncate max-w-[140px]">{guest.companyName}</p>
                        )}
                        {guest.gstin && (
                          <p className="text-[9px] font-mono text-slate-500">GST: {guest.gstin}</p>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {guest.idProofType}
                        </span>
                        <p className="font-mono text-[11px] text-slate-700 mt-1">{guest.idProofNumber}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">{stays.length} stay{stays.length !== 1 ? 's' : ''}</span>
                        <p className="text-[10px] text-emerald-600 font-semibold">{formatINR(totalSpend)}</p>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingGuest(guest)}
                            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View Full Profile & Stay History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(guest)}
                            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setGuestToDelete(guest)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Guest Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingGuest ? `Edit ${editingGuest.fullName}` : 'Register New Guest (India)'}
                  </h3>
                  <p className="text-xs text-slate-500">Government ID & GST Information</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Mobile Number (India) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guest@domain.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Guest['gender'] })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Govt ID Proof Type *</label>
                  <select
                    value={formData.idProofType}
                    onChange={e => setFormData({ ...formData, idProofType: e.target.value as IdProofType })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                    <option value="PAN Card">PAN Card (Income Tax)</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">ID Document Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.idProofNumber}
                    onChange={e => setFormData({ ...formData, idProofNumber: e.target.value })}
                    placeholder="e.g. 12-digit Aadhaar / 10-digit PAN"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">State (Place of Supply) *</label>
                  <select
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st.code} value={st.name}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">City / Town</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Flat / Building / Street address"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="6-digit PIN code (e.g. 400001)"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">PAN Card Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 uppercase font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Company Name (For GST Invoice)</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Corporate Client / Enterprise Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Company GSTIN (15-digit)</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="27AAAAA0000A1Z5"
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 uppercase font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Special Guest Notes & Preferences</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="VIP preferences, food preferences (Veg/Jain), corporate billing instructions..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  {editingGuest ? 'Save Changes' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Profile & Stay History Modal */}
      {viewingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{viewingGuest.fullName}</h3>
                  <span className="font-mono text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md">
                    {viewingGuest.guestId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registered guest • Place of Supply: {viewingGuest.state || 'Maharashtra'}
                </p>
              </div>
              <button
                onClick={() => setViewingGuest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <p className="text-slate-500 font-medium">Contact Channels:</p>
                <p className="text-slate-900 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {viewingGuest.mobile}
                </p>
                <p className="text-slate-900 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {viewingGuest.email}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <p className="text-slate-500 font-medium">Verified Identity & Location:</p>
                <p className="text-slate-900 font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" /> {viewingGuest.idProofType}: <span className="font-mono text-indigo-600">{viewingGuest.idProofNumber}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {viewingGuest.address || 'Address'}, {viewingGuest.city}, {viewingGuest.state} {viewingGuest.pincode ? `- ${viewingGuest.pincode}` : ''}
                </p>
                {viewingGuest.gstin && (
                  <p className="text-indigo-700 font-mono text-[11px] font-semibold">
                    GSTIN: {viewingGuest.gstin} ({viewingGuest.companyName || 'Corporate'})
                  </p>
                )}
              </div>
            </div>

            {viewingGuest.notes && (
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs">
                <p className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider">Internal Notes & Preferences</p>
                <p className="text-slate-700 mt-1">{viewingGuest.notes}</p>
              </div>
            )}

            {/* Stay History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>Stay & Reservation History</span>
                <span className="text-indigo-600">{getGuestBookings(viewingGuest.id).length} Bookings</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getGuestBookings(viewingGuest.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 text-center">No bookings on record.</p>
                ) : (
                  getGuestBookings(viewingGuest.id).map(b => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">{b.bookingId}</span>
                          <span className="font-bold text-slate-900">Room {b.roomNumber}</span>
                          <StatusBadge status={b.status} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {b.checkInDate} to {b.checkOutDate} ({b.nights} night{b.nights > 1 ? 's' : ''})
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">{formatINR(b.grandTotal)}</p>
                        <button
                          onClick={() => {
                            setViewingGuest(null);
                            setSelectedInvoiceBookingId(b.id);
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold mt-0.5 flex items-center gap-1 ml-auto"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Tax Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Record history */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Payment Receipts
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {getGuestPayments(viewingGuest.fullName).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs border border-slate-200">
                    <div>
                      <span className="font-mono text-slate-500">{p.receiptNumber}</span>
                      <span className="text-slate-700 ml-2">{p.paymentType} via {p.paymentMethod}</span>
                    </div>
                    <span className="font-bold text-emerald-600">+{formatINR(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingGuest(null)}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(guestToDelete)}
        title={`Remove ${guestToDelete?.fullName}?`}
        message="Are you sure you want to delete this guest profile? Historical bookings will retain the recorded guest name."
        confirmLabel="Delete Guest"
        isDestructive={true}
        onConfirm={() => {
          if (guestToDelete) {
            deleteGuest(guestToDelete.id);
            setGuestToDelete(null);
          }
        }}
        onCancel={() => setGuestToDelete(null)}
      />
    </div>
  );
};
