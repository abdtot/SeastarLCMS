import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, Minimize2, Sparkles, Scale, CheckCircle2 } from 'lucide-react';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  urgentAlertsCount?: number;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  urgentAlertsCount = 0,
}) => {
  // Check if real mobile screen
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  // User toggle for frame (on desktop)
  const [isFrameEnabled, setIsFrameEnabled] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobileScreen(window.innerWidth <= 640);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // If on actual mobile device or user turned off frame, render full edge-to-edge
  if (isMobileScreen || !isFrameEnabled) {
    return (
      <div className="w-full min-h-[100dvh] bg-[#F8FAFC] text-slate-900 flex flex-col font-['Cairo',sans-serif] selection:bg-blue-100 selection:text-blue-900">
        {/* On desktop without frame, provide small subtle toggle button in corner */}
        {!isMobileScreen && (
          <div className="fixed top-3 left-3 z-50">
            <button
              onClick={() => setIsFrameEnabled(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-700 transition"
              title="عرض داخل إطار هاتف أندرويد"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>إطار هاتف أندرويد</span>
            </button>
          </div>
        )}
        <div className="w-full flex-1 flex flex-col max-w-lg mx-auto relative shadow-xs">
          {children}
        </div>
      </div>
    );
  }

  // Desktop view: Realistic flagship Android phone frame
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 text-slate-900 flex flex-col items-center justify-center p-3 sm:p-6 font-['Cairo',sans-serif]">
      {/* Top Desktop Controls Bar */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block leading-tight">SeaStar المحاماة</span>
            <span className="text-[10px] text-blue-600 font-semibold">تطبيق موبايل أندرويد (Android OS)</span>
          </div>
        </div>

        <button
          onClick={() => setIsFrameEnabled(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold shadow-xs transition active:scale-95"
          title="ملء شاشة الموبايل"
        >
          <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
          <span>ملء الشاشة</span>
        </button>
      </div>

      {/* Realistic Android Phone Device Shell */}
      <div className="relative">
        {/* Physical Side Buttons on phone body */}
        {/* Volume Rocker (Left side) */}
        <div className="absolute -left-2 top-28 w-1 h-14 bg-slate-400 rounded-l-md shadow-xs hidden sm:block" />
        {/* Power Button (Left side) */}
        <div className="absolute -left-2 top-46 w-1 h-8 bg-slate-400 rounded-l-md shadow-xs hidden sm:block" />

        {/* Outer Phone Bezel */}
        <div className="w-[395px] h-[820px] max-h-[92vh] bg-slate-800 rounded-[50px] p-2.5 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] ring-1 ring-slate-400/40 flex flex-col relative overflow-hidden">
          {/* Inner Phone Screen */}
          <div className="w-full h-full bg-[#F8FAFC] rounded-[42px] flex flex-col overflow-hidden relative shadow-inner">
            {/* Top Speaker Slit */}
            <div className="w-full bg-white flex justify-center pt-1.5 pb-0.5">
              <div className="w-14 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Application Inside Android Screen */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
