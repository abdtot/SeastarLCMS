import React, { useState } from 'react';
import {
  Scale,
  Bell,
  Search,
  ChevronDown,
  Settings,
  Check
} from 'lucide-react';
import { LawyerMember } from '../types';
import { LAWYERS } from '../services/storage';

interface HeaderProps {
  currentLawyer: LawyerMember;
  setCurrentLawyer: (lawyer: LawyerMember) => void;
  lawyers?: LawyerMember[];
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenSettings?: () => void;
  urgentSessionsCount: number;
  expiringPoasCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLawyer,
  setCurrentLawyer,
  lawyers = LAWYERS,
  onOpenNotifications,
  onOpenSearch,
  onOpenSettings,
  urgentSessionsCount,
  expiringPoasCount,
}) => {
  const [showLawyerMenu, setShowLawyerMenu] = useState(false);
  const totalAlerts = urgentSessionsCount + expiringPoasCount;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 select-none shadow-xs">
      <div className="px-3.5 py-2.5 flex items-center justify-between">
        {/* Brand & Office Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
                SeaStar
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                المحاماة
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              نظام إدارة القضايا والمكتب
            </p>
          </div>
        </div>

        {/* Action icons for mobile */}
        <div className="flex items-center gap-1.5">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="w-8.5 h-8.5 rounded-full bg-slate-100/80 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition"
            aria-label="بحث سريع"
          >
            <Search className="w-4 h-4 text-slate-600" />
          </button>

          {/* Settings Quick Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-8.5 h-8.5 rounded-full bg-slate-100/80 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition"
              aria-label="الإعدادات المتقدمة والنسخ الاحتياطي"
              title="الإعدادات المتقدمة والنسخ الاحتياطي"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </button>
          )}

          {/* Notifications button with count */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8.5 h-8.5 rounded-full bg-slate-100/80 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-700 transition"
            aria-label="التنبيهات"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[9px] font-bold text-white items-center justify-center shadow-xs">
                  {totalAlerts}
                </span>
              </span>
            )}
          </button>

          {/* Current Lawyer switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLawyerMenu(!showLawyerMenu)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100/80 hover:bg-slate-200 border border-slate-200 transition active:scale-95"
            >
              <div className={`w-5.5 h-5.5 rounded-full ${currentLawyer.avatarColor} text-white text-[11px] flex items-center justify-center font-bold shadow-xs`}>
                {currentLawyer.name.charAt(0)}
              </div>
              <span className="text-[11px] font-bold text-slate-800 hidden xs:inline max-w-[70px] truncate">
                {currentLawyer.name.replace('أ. د. ', '').replace('أ. ', '')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Lawyer Dropdown Bottom Sheet / Popup */}
            {showLawyerMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold">تبديل حساب المستخدم (فريق المكتب)</p>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {lawyers.map((lawyer) => {
                    const isSelected = lawyer.id === currentLawyer.id;
                    return (
                      <button
                        key={lawyer.id}
                        onClick={() => {
                          setCurrentLawyer(lawyer);
                          setShowLawyerMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-right flex items-center justify-between hover:bg-slate-50 transition text-xs ${
                          isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${lawyer.avatarColor} text-white text-[10px] flex items-center justify-center font-bold`}>
                            {lawyer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="leading-tight font-bold">{lawyer.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{lawyer.role}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
