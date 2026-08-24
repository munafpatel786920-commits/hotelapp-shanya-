import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { CleaningStatus, RoomStatus, TaskPriority, HousekeepingTask } from '../../types/hotel';
import { StatusBadge } from '../common/Badge';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  BedDouble,
  ShieldCheck,
  Plus,
  X
} from 'lucide-react';

export const HousekeepingManagement: React.FC = () => {
  const {
    data,
    updateHousekeepingTask,
    assignHousekeepingStaff,
    createHousekeepingTask
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [cleaningStatusFilter, setCleaningStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // New task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskNotes, setTaskNotes] = useState('');

  // Housekeeping staff members
  const housekeepingStaff = data.staff.filter(s => s.department === 'Housekeeping');

  const filteredTasks = useMemo(() => {
    return data.housekeepingTasks.filter(task => {
      const matchClean = cleaningStatusFilter === 'ALL' || task.cleaningStatus === cleaningStatusFilter;
      const matchPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      const matchSearch =
        task.roomNumber.includes(searchQuery) ||
        (task.assignedStaffName && task.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.cleaningNotes && task.cleaningNotes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchClean && matchPriority && matchSearch;
    });
  }, [data.housekeepingTasks, cleaningStatusFilter, priorityFilter, searchQuery]);

  // Counts
  const dirtyCount = data.housekeepingTasks.filter(t => t.cleaningStatus === 'Dirty').length;
  const inProgressCount = data.housekeepingTasks.filter(t => t.cleaningStatus === 'In Progress').length;
  const cleanCount = data.housekeepingTasks.filter(t => t.cleaningStatus === 'Clean' || t.cleaningStatus === 'Inspected').length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;

    createHousekeepingTask(selectedRoomId, taskPriority, taskNotes);
    setIsTaskModalOpen(false);
    setSelectedRoomId('');
    setTaskNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              Housekeeping & Turnover
            </span>
            <span className="text-xs text-slate-500">
              {dirtyCount} Rooms Need Cleaning • {inProgressCount} In Progress
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Housekeeping Operations</h1>
          <p className="text-xs text-slate-500">Manage room turnover, inspection logs, staff assignments, and room cleaning statuses.</p>
        </div>

        <button
          onClick={() => {
            setSelectedRoomId(data.rooms[0]?.id || '');
            setIsTaskModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Cleaning Dispatch</span>
        </button>
      </div>

      {/* Housekeeping KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dirty (Pending Turnover)</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-1">{dirtyCount} Rooms</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting housekeeping staff allocation</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active In Progress</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount} Rooms</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Currently being sanitized and prepared</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clean & Inspected</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{cleanCount} Rooms</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Ready for immediate guest check-in</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks by room #, staff or notes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={cleaningStatusFilter}
            onChange={e => setCleaningStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="ALL">All Cleaning Statuses</option>
            <option value="Dirty">Dirty</option>
            <option value="In Progress">In Progress</option>
            <option value="Clean">Clean</option>
            <option value="Inspected">Inspected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Housekeeping Tasks Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3.5 font-semibold">Room #</th>
                <th className="p-3.5 font-semibold">Occupancy Status</th>
                <th className="p-3.5 font-semibold">Cleaning Status</th>
                <th className="p-3.5 font-semibold">Assigned Attendant</th>
                <th className="p-3.5 font-semibold">Priority</th>
                <th className="p-3.5 font-semibold">Notes / Inspection</th>
                <th className="p-3.5 font-semibold text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No housekeeping tasks found matching filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <span className="text-base font-black text-indigo-600">Room {task.roomNumber}</span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={task.currentStatus} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={task.cleaningStatus} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <select
                        value={task.assignedStaffId || ''}
                        onChange={e => assignHousekeepingStaff(task.id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Unassigned --</option>
                        {housekeepingStaff.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.shift.split(' ')[0]})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">
                      {task.cleaningNotes || 'Standard room turnover protocol'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {task.cleaningStatus === 'Dirty' && (
                          <button
                            onClick={() => updateHousekeepingTask(task.id, 'In Progress')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200"
                          >
                            Start Cleaning
                          </button>
                        )}
                        {task.cleaningStatus === 'In Progress' && (
                          <button
                            onClick={() => updateHousekeepingTask(task.id, 'Clean')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                          >
                            Mark Clean
                          </button>
                        )}
                        {task.cleaningStatus === 'Clean' && (
                          <button
                            onClick={() => updateHousekeepingTask(task.id, 'Inspected')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200"
                          >
                            Inspect & Pass
                          </button>
                        )}
                        {task.cleaningStatus === 'Inspected' && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Passed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create Housekeeping Dispatch</h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Hotel Room *</label>
                <select
                  required
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  {data.rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room #{r.roomNumber} ({r.status} • {r.cleaningStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Priority</label>
                <select
                  value={taskPriority}
                  onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent (Express Turnover)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Cleaning Notes / Instructions</label>
                <textarea
                  rows={3}
                  value={taskNotes}
                  onChange={e => setTaskNotes(e.target.value)}
                  placeholder="e.g. Deep clean carpet, restock luxury bathrobes, replace linen set..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
