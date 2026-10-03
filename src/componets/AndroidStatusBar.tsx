import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Scale, Bell } from 'lucide-react';

interface AndroidStatusBarProps {
  urgentAlertsCount?: number;
  onTriggerExternalBanner?: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  urgentAlertsCount = 0,
  onTriggerExternalBanner,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onClick={onTriggerExternalBanner}
      title="شريط نظام أندرويد - اضغط لعرض الإشعارات الخارجية النشطة"
      className="w-full bg-white select-none pt-1 px-4 pb-0.5 flex items-center justify-between text-slate-700 text-[11px] font-medium border-b border-slate-100 z-50 cursor-pointer hover:bg-slate-50 transition"
    >
      {/* Right Side in RTL: Time & Notification Badges */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-800 tracking-tight font-mono text-[12px]">{timeStr || '09:41'}</span>
        <div className="flex items-center gap-1 text-slate-400">
          <Scale className="w-3 h-3 text-blue-600" />
          {urgentAlertsCount > 0 && (
            <>
              <Bell className="w-3 h-3 text-amber-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
            </>
          )}
        </div>
      </div>

      {/* Center: Punch Hole Camera Simulator indicator */}
      <div className="flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-700/80 shadow-inner flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-blue-950/70" />
        </div>
      </div>

      {/* Left Side in RTL: Signal, Wifi, Battery */}
      <div className="flex items-center gap-1.5 text-slate-600">
        <span className="text-[10px] font-bold font-mono text-slate-500">5G</span>
        <Signal className="w-3 h-3 text-slate-700" />
        <Wifi className="w-3 h-3 text-slate-700" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] font-mono font-bold text-slate-700">98%</span>
          <div className="w-4 h-2.5 rounded-xs border border-slate-700 p-0.5 flex items-center relative">
            <div className="w-2.5 h-1.5 bg-emerald-600 rounded-2xs" />
            <div className="w-0.5 h-1 bg-slate-700 absolute -left-0.5 top-0.5 rounded-l-2xs" />
          </div>
        </div>
      </div>
    </div>
  );
};
