import React, { useState } from 'react';
import {
  Plus,
  X,
  Briefcase,
  Calendar,
  UserPlus,
  Receipt,
  FileUp,
  CheckSquare,
  Landmark
} from 'lucide-react';

interface QuickActionsFABProps {
  onAddCase: () => void;
  onAddSession: () => void;
  onAddClient: () => void;
  onAddVoucher: () => void;
  onAddDocument: () => void;
  onAddTask: () => void;
  onAddCourt: () => void;
}

export const QuickActionsFAB: React.FC<QuickActionsFABProps> = ({
  onAddCase,
  onAddSession,
  onAddClient,
  onAddVoucher,
  onAddDocument,
  onAddTask,
  onAddCourt,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'إدخال بيانات محكمة',
      icon: Landmark,
      color: 'bg-sky-600 text-white',
      action: onAddCourt,
    },
    {
      label: 'قضية جديدة',
      icon: Briefcase,
      color: 'bg-blue-600 text-white',
      action: onAddCase,
    },
    {
      label: 'جدولة جلسة',
      icon: Calendar,
      color: 'bg-emerald-600 text-white',
      action: onAddSession,
    },
    {
      label: 'تسجيل موكل',
      icon: UserPlus,
      color: 'bg-purple-600 text-white',
      action: onAddClient,
    },
    {
      label: 'سند مالي / فاتورة',
      icon: Receipt,
      color: 'bg-amber-600 text-white',
      action: onAddVoucher,
    },
    {
      label: 'أرشفة مستند / لائحة',
      icon: FileUp,
      color: 'bg-indigo-600 text-white',
      action: onAddDocument,
    },
    {
      label: 'مهمة عمل جديدة',
      icon: CheckSquare,
      color: 'bg-rose-600 text-white',
      action: onAddTask,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="absolute inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Button (Material 3 style) */}
      <div className="absolute bottom-20 left-3.5 z-40 flex flex-col items-start gap-2">
        {isOpen && (
          <div className="flex flex-col items-start gap-1.5 mb-1 animate-in slide-in-from-bottom-5 duration-150">
            {actions.map((act, index) => {
              const Icon = act.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    setIsOpen(false);
                    act.action();
                  }}
                  className="flex items-center gap-2.5 bg-white/98 border border-slate-200/90 px-3 py-1.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition text-slate-800 group"
                >
                  <div className={`w-7 h-7 rounded-full ${act.color} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-700">
                    {act.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Android Material 3 FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="إجراء سريع"
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all duration-200 active:scale-90 ${
            isOpen
              ? 'bg-rose-600 text-white rotate-45 shadow-rose-600/30'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:scale-105'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7 stroke-[2.8]" />}
        </button>
      </div>
    </>
  );
};
