import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Users,
  CreditCard,
  Layers,
  FileText,
  CheckSquare,
  BarChart3,
  Settings
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  urgentSessionsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  urgentSessionsCount,
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  const mainTabs = [
    { id: 'dashboard' as ActiveTab, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'cases' as ActiveTab, label: 'القضايا', icon: Briefcase },
    {
      id: 'sessions' as ActiveTab,
      label: 'الجلسات',
      icon: Calendar,
      badge: urgentSessionsCount > 0 ? urgentSessionsCount : null,
    },
    { id: 'clients' as ActiveTab, label: 'الموكلين', icon: Users },
    { id: 'finance' as ActiveTab, label: 'المالية', icon: CreditCard },
  ];

  const moreTabs = [
    { id: 'documents' as ActiveTab, label: 'المستندات والأرشفة', icon: FileText, desc: 'اللوائح والمذكرات والعقود' },
    { id: 'tasks' as ActiveTab, label: 'المهام وسير العمل', icon: CheckSquare, desc: 'توزيع المهام ومتابعة الإنجاز' },
    { id: 'reports' as ActiveTab, label: 'التقارير والمؤشرات', icon: BarChart3, desc: 'إحصائيات النجاح والأداء المالي' },
    { id: 'settings' as ActiveTab, label: 'الإعدادات المتقدمة والنسخ الاحتياطي', icon: Settings, desc: 'العملة (ر.ي)، النسخ الاحتياطي، وبيانات المكتب' },
  ];

  const isMoreTabActive = ['documents', 'tasks', 'reports', 'settings'].includes(activeTab);

  return (
    <>
      {/* Android Bottom Sheet for "المزيد" */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-white border-t border-slate-200 rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Android Drag Handle */}
            <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold text-sm text-slate-900">وحدات النظام الإضافية</h3>
              <span className="text-[11px] text-slate-500 font-medium">SeaStar Law Firm</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                      active
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-right flex-1">
                      <p className="font-bold text-sm text-slate-900">{tab.label}</p>
                      <p className="text-xs text-slate-500">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Android Material 3 Bottom Navigation Bar */}
      <nav className="sticky bottom-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 px-2 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setShowMoreMenu(false);
                  setActiveTab(tab.id);
                }}
                className="relative flex flex-col items-center justify-center py-1 px-3 group transition"
              >
                {/* Material 3 active pill background */}
                <div
                  className={`relative px-4 py-1 rounded-full transition-all duration-200 ${
                    active ? 'bg-blue-100 text-blue-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5] text-blue-700' : 'text-slate-600'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight font-medium transition ${
                    active ? 'text-blue-900 font-bold' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More Tab */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="relative flex flex-col items-center justify-center py-1 px-3 group transition"
          >
            <div
              className={`px-4 py-1 rounded-full transition-all duration-200 ${
                isMoreTabActive ? 'bg-blue-100 text-blue-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className={`w-5 h-5 ${isMoreTabActive ? 'stroke-[2.5] text-blue-700' : 'text-slate-600'}`} />
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight font-medium transition ${
                isMoreTabActive ? 'text-blue-900 font-bold' : 'text-slate-600'
              }`}
            >
              المزيد
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
