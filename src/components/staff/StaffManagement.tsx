import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Staff, StaffDepartment, StaffStatus } from '../../types/hotel';
import { StatusBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Briefcase,
  Trash2,
  Edit,
  Clock,
  X
} from 'lucide-react';
import { formatINR } from '../../utils/indiaUtils';

export const StaffManagement: React.FC = () => {
  const { data, addStaff, updateStaff, deleteStaff } = useHotel();
  const currency = data.settings.currencySymbol || '$';

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    position: 'Front Desk Receptionist',
    department: 'Reception' as StaffDepartment,
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 3200,
    status: 'Active' as StaffStatus,
    shift: 'Morning (06:00 - 14:00)' as Staff['shift']
  });

  const departments: StaffDepartment[] = [
    'Reception',
    'Housekeeping',
    'Restaurant',
    'Manager',
    'Security',
    'Accounts',
    'Other'
  ];

  const shifts: Staff['shift'][] = [
    'Morning (06:00 - 14:00)',
    'Evening (14:00 - 22:00)',
    'Night (22:00 - 06:00)',
    'General (09:00 - 18:00)'
  ];

  const filteredStaff = useMemo(() => {
    return data.staff.filter(s => {
      const matchDept = departmentFilter === 'ALL' || s.department === departmentFilter;
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mobile.includes(searchQuery);

      return matchDept && matchStatus && matchSearch;
    });
  }, [data.staff, departmentFilter, statusFilter, searchQuery]);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      address: '',
      position: 'Front Desk Receptionist',
      department: 'Reception',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 3200,
      status: 'Active',
      shift: 'Morning (06:00 - 14:00)'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      mobile: staff.mobile,
      email: staff.email,
      address: staff.address,
      position: staff.position,
      department: staff.department,
      joiningDate: staff.joiningDate,
      salary: staff.salary,
      status: staff.status,
      shift: staff.shift
    });
    setIsModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, formData);
    } else {
      addStaff(formData);
    }
    setIsModalOpen(false);
  };

  const totalPayroll = data.staff.reduce((sum, s) => sum + s.salary, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              Human Resources
            </span>
            <span className="text-xs text-slate-500">{data.staff.length} Active Employees</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Staff & Roster Management</h1>
          <p className="text-xs text-slate-500">Manage employee directories, shifts, department assignments and payroll rates.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Staff Headcount</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.staff.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
            {data.staff.filter(s => s.status === 'Active').length} Active on duty
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monthly Payroll Obligation</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{currency}{totalPayroll.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Across {departments.length} departments</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Housekeeping & Operations</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {data.staff.filter(s => s.department === 'Housekeeping').length} Staff
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">Assigned to floor room maintenance</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, ID, role or phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3.5 font-semibold">Staff Member</th>
                <th className="p-3.5 font-semibold">Staff ID</th>
                <th className="p-3.5 font-semibold">Department & Role</th>
                <th className="p-3.5 font-semibold">Shift Timing</th>
                <th className="p-3.5 font-semibold">Contact</th>
                <th className="p-3.5 font-semibold">Salary</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No staff records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <span className="text-[10px] text-slate-500">Joined {s.joiningDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-600 font-bold">{s.staffId}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{s.position}</p>
                      <span className="text-[10px] text-indigo-600 font-medium">{s.department}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {s.shift}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      <p>{s.mobile}</p>
                      <p className="text-[10px]">{s.email}</p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{formatINR(s.salary)} /mo</td>
                    <td className="p-3.5">
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStaffToDelete(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStaff ? `Edit Employee ${editingStaff.staffId}` : 'Add New Employee'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as StaffDepartment })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Position / Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Shift</label>
                  <select
                    value={formData.shift}
                    onChange={e => setFormData({ ...formData, shift: e.target.value as Staff['shift'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {shifts.map(sh => (
                      <option key={sh} value={sh}>{sh}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Salary (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date Joined</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Dialog */}
      <ConfirmDialog
        isOpen={Boolean(staffToDelete)}
        title={`Remove ${staffToDelete?.name}?`}
        message="Are you sure you want to remove this employee from the records?"
        confirmLabel="Remove Employee"
        isDestructive={true}
        onConfirm={() => {
          if (staffToDelete) {
            deleteStaff(staffToDelete.id);
            setStaffToDelete(null);
          }
        }}
        onCancel={() => setStaffToDelete(null)}
      />
    </div>
  );
};
