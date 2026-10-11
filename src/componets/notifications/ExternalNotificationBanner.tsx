import React from 'react';
import {
  BellRing,
  X,
  Send,
  Scale,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  Volume2
} from 'lucide-react';
import { ExternalAlertItem } from '../../types';

interface ExternalNotificationBannerProps {
  alertsQueue: ExternalAlertItem[];
  onDismissCurrent: () => void;
  onDismissAll: () => void;
  onOpenAlertTarget: (alert: ExternalAlertItem) => void;
}

export const ExternalNotificationBanner: React.FC<ExternalNotificationBannerProps> = ({
  alertsQueue,
  onDismissCurrent,
  onDismissAll,
  onOpenAlertTarget,
}) => {
  if (!alertsQueue || alertsQueue.length === 0) return null;

  const current = alertsQueue[0];
  const remainingCount = alertsQueue.length;

  const isCritical = current.urgency === 'critical';

  return (
    <div className="sticky top-7 z-50 px-2.5 pt-1 pointer-events-none animate-in slide-in-from-top duration-300 font-['Cairo',sans-serif]">
      <div
        className={`pointer-events-auto rounded-3xl p-3.5 shadow-2xl border backdrop-blur-xl transition-all ${
          isCritical
            ? 'bg-slate-900/95 border-rose-500/50 text-white shadow-rose-950/30'
            : 'bg-slate-900/95 border-amber-500/40 text-white shadow-slate-950/30'
        }`}
      >
        {/* Android OS System Notification Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}
            >
              <Scale className="w-3 h-3" />
            </div>
            <span className="font-bold text-sky-300">SeaStar • إشعار النظام الخارجي</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-300">{current.timestamp}</span>
            <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5">
            {remainingCount > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-amber-300 font-bold font-mono text-[9px]">
                1 من {remainingCount}
              </span>
            )}
            <button
              onClick={onDismissAll}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg transition"
              title="إغلاق كافة الإشعارات المنبثقة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Body */}
        <div className="mt-2 flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
              current.type === 'session_upcoming'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                : current.type === 'poa_expiring'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
            }`}
          >
            {current.type === 'session_upcoming' ? (
              <Calendar className="w-4 h-4" />
            ) : current.type === 'poa_expiring' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <BellRing className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-right">
            <h4 className="font-bold text-xs text-white leading-snug">{current.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
              {current.body}
            </p>
          </div>
        </div>

        {/* Android Notification Action Buttons */}
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAlertTarget(current)}
              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 transition"
            >
              <span>معاينة واتخاذ إجراء</span>
              <ChevronLeft className="w-3 h-3" />
            </button>

            {current.whatsappUrl && (
              <a
                href={current.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition"
              >
                <Send className="w-3 h-3" />
                <span>تذكير واتساب</span>
              </a>
            )}
          </div>

          <button
            onClick={onDismissCurrent}
            className="text-slate-300 hover:text-white font-bold px-2 py-1 rounded-lg transition"
          >
            {remainingCount > 1 ? `التالي (${remainingCount - 1})` : 'تم الاطلاع'}
          </button>
        </div>
      </div>
    </div>
  );
};
