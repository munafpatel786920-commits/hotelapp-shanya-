import React from 'react';
import { RoomStatus, CleaningStatus, BookingStatus, PaymentMethod } from '../../types/hotel';

interface StatusBadgeProps {
  status: RoomStatus | CleaningStatus | BookingStatus | PaymentMethod | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const getStyle = (val: string) => {
    switch (val) {
      // Room & Housekeeping statuses
      case 'Available':
      case 'Clean':
      case 'Inspected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      case 'Occupied':
      case 'Checked-in':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
      case 'Reserved':
      case 'Confirmed':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'Cleaning':
      case 'Dirty':
      case 'In Progress':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
      case 'Maintenance':
      case 'Out of Service':
      case 'Cancelled':
      case 'No-show':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'Checked-out':
        return 'bg-slate-100 text-slate-600 border-slate-200 font-semibold';
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      case 'Unpaid':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'Added to Room Bill':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${sizeClasses} ${getStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
