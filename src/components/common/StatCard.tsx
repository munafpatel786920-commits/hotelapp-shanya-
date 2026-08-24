import React, { ReactNode } from 'react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'gold' | 'emerald' | 'sky' | 'indigo' | 'rose' | 'amber' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'indigo',
  onClick
}) => {
  const schemeStyles = {
    gold: {
      accentBg: 'bg-amber-50',
      pill: 'bg-amber-50 text-amber-700 border-amber-200/60',
      iconColor: 'text-amber-600'
    },
    emerald: {
      accentBg: 'bg-emerald-50',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      iconColor: 'text-emerald-600'
    },
    sky: {
      accentBg: 'bg-sky-50',
      pill: 'bg-sky-50 text-sky-700 border-sky-200/60',
      iconColor: 'text-sky-600'
    },
    indigo: {
      accentBg: 'bg-indigo-50',
      pill: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      iconColor: 'text-indigo-600'
    },
    rose: {
      accentBg: 'bg-rose-50',
      pill: 'bg-rose-50 text-rose-700 border-rose-200/60',
      iconColor: 'text-rose-600'
    },
    amber: {
      accentBg: 'bg-amber-50',
      pill: 'bg-amber-50 text-amber-700 border-amber-200/60',
      iconColor: 'text-amber-600'
    },
    slate: {
      accentBg: 'bg-slate-100',
      pill: 'bg-slate-100 text-slate-700 border-slate-200/60',
      iconColor: 'text-slate-600'
    }
  };

  const style = schemeStyles[colorScheme] || schemeStyles.indigo;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300 group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Decorative subtle background circle */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 ${style.accentBg} rounded-full opacity-60 pointer-events-none group-hover:scale-110 transition-transform`} />

      <div className="relative z-10 flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        {icon && <div className={`p-1.5 rounded-lg ${style.accentBg} ${style.iconColor}`}>{icon}</div>}
      </div>

      <div className="relative z-10 flex items-end justify-between gap-2 mt-auto">
        <span className="text-3xl lg:text-4xl font-light tracking-tight text-slate-800">{value}</span>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.pill}`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate">{subtitle}</span>
        </div>
      )}
    </div>
  );
};
