import React from 'react';

interface AndroidSystemBarProps {
  onBack?: () => void;
  onHome?: () => void;
}

export const AndroidSystemBar: React.FC<AndroidSystemBarProps> = ({ onBack, onHome }) => {
  return (
    <div className="w-full bg-white select-none py-1.5 px-6 flex items-center justify-center border-t border-slate-100 z-40">
      {/* Android Gesture Navigation Pill Bar */}
      <div 
        onClick={onHome}
        className="w-32 h-1 bg-slate-300 hover:bg-slate-400 active:bg-slate-500 rounded-full cursor-pointer transition-all duration-150" 
        title="شريط إيماءات نظام أندرويد"
      />
    </div>
  );
};
