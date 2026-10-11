import React from 'react';
import {
  X,
  Bell,
  BellRing,
  Clock,
  AlertTriangle,
  Send,
  ShieldAlert,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { Session, Client, LegalTask, LegalCase, AppSettings } from '../../types';
import {
  getDaysRemaining,
  formatDaysRemainingLabel,
  detectSessionConflicts,
  generateWhatsAppSessionReminder,
  generateWhatsAppPoaReminder
} from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  clients: Client[];
  tasks: LegalTask[];
  cases: LegalCase[];
  settings?: AppSettings;
  onSelectSession: (s: Session) => void;
  onSelectClient: (c: Client) => void;
  onTriggerExternalBroadcast?: () => void;
  onOpenSettings?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  clients,
  tasks,
  settings,
  onSelectSession,
  onSelectClient,
  onTriggerExternalBroadcast,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const alertHoursThreshold = settings?.sessionAlertBeforeHours ?? 24;
  const poaWarningDays = settings?.poaExpiryWarningDays ?? 14;

  const urgentSessions = sessions.filter((s) => {
    if (s.status !== 'scheduled') return false;
    if (s.date === todayStr) return true;
    const [h, m] = (s.time || '10:00').split(':').map(Number);
    const sessDate = new Date(`${s.date}T00:00:00`);
    sessDate.setHours(h || 10, m || 0, 0, 0);
    const diffHours = (sessDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= -4 && diffHours <= alertHoursThreshold;
  });

  const expiringPoas: { client: Client; poa: any; days: number }[] = [];
  clients.forEach((c) => {
    c.poas.forEach((p) => {
      const days = getDaysRemaining(p.expiryDate);
      if (days <= poaWarningDays) {
        expiringPoas.push({ client: c, poa: p, days });
      }
    });
  });

  const urgentTasks = tasks.filter(
    (t) => (t.priority === 'حرجة' || t.dueDate <= todayStr) && t.status !== 'completed'
  );

  const conflicts = settings?.enableConflictDetection !== false ? detectSessionConflicts(sessions) : [];
  const totalCount = urgentSessions.length + expiringPoas.length + urgentTasks.length + conflicts.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-start animate-in fade-in">
      <div className="bg-white border-l border-slate-200 w-full max-w-sm h-full flex flex-col shadow-2xl overflow-hidden text-right animate-in slide-in-from-right duration-200">
        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">مركز التنبيهات والإشعارات الخارجية</h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {totalCount} تنبيهات نشطة (الجلسات قبل {alertHoursThreshold} ساعة • الوكالات قبل {poaWarningDays} يوم)
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onTriggerExternalBroadcast && (
              <button
                onClick={() => {
                  onClose();
                  onTriggerExternalBroadcast();
                }}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>إطلاق الإشعارات خارج التطبيق الآن</span>
              </button>
            )}
            {onOpenSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold py-2 px-2.5 rounded-xl flex items-center gap-1 transition"
                title="ضبط مهلة تنبيه الجلسات والوكالات"
              >
                <Settings className="w-3.5 h-3.5 text-blue-700" />
                <span>الإعدادات</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {conflicts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-red-700 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>تعارض مواعيد الجلسات ({conflicts.length})</span>
              </h4>
              {conflicts.map((conf, i) => (
                <div key={i} className="bg-red-50 border border-red-200 p-3 rounded-2xl text-[11px] text-red-900">
                  <p className="text-red-700 font-bold">{conf.reason}</p>
                  <p className="text-slate-600 mt-1">
                    #{conf.session1.caseNumber} ({conf.session1.time}) مع #{conf.session2.caseNumber} ({conf.session2.time})
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>جلسات اليوم والغد (تنبيهات مبكرة)</span>
            </h4>

            {urgentSessions.length === 0 ? (
              <p className="text-slate-400 text-[11px]">لا توجد جلسات خلال الـ 24 ساعة القادمة</p>
            ) : (
              <div className="space-y-2">
                {urgentSessions.map((sess) => {
                  const isToday = sess.date === todayStr;
                  const client = clients.find((c) => c.id === sess.clientId);

                  return (
                    <div
                      key={sess.id}
                      className={`p-3 rounded-2xl border space-y-1.5 ${
                        isToday ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isToday
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isToday ? 'اليوم (تنبيه ساعتين)' : 'غداً (تنبيه 24 ساعة)'}
                        </span>
                        <span className="font-mono font-bold text-blue-800">{sess.time}</span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-xs">{sess.caseTitle}</h5>
                      <p className="text-slate-500 text-[11px] truncate font-medium">{sess.court} - {sess.hall}</p>

                      <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                        <a
                          href={generateWhatsAppSessionReminder(sess, client?.phone)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-xl font-bold shadow-2xs transition"
                        >
                          <Send className="w-3 h-3" />
                          <span>تذكير الموكل عبر واتساب</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>وكالات توشك على الانتهاء</span>
            </h4>

            {expiringPoas.length === 0 ? (
              <p className="text-slate-400 text-[11px]">جميع الوكالات القضائية سارية الصلاحية</p>
            ) : (
              <div className="space-y-2">
                {expiringPoas.map((item, idx) => {
                  const statusInfo = formatDaysRemainingLabel(item.days);

                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                          {item.client.fullName}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${statusInfo.badge}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        وكالة رقم: #{item.poa.poaNumber} (تنتهي: {item.poa.expiryDate})
                      </p>
                      <div className="pt-1.5 flex justify-end">
                        <a
                          href={generateWhatsAppPoaReminder(
                            item.client.fullName,
                            item.poa.poaNumber,
                            item.poa.expiryDate,
                            item.client.phone
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-xl font-bold transition shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>إشعار التجديد بالواتساب</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-700" />
              <span>مهام عاجلة تستوجب التنفيذ</span>
            </h4>

            {urgentTasks.length === 0 ? (
              <p className="text-slate-400 text-[11px]">لا توجد مهام متأخرة حالياً</p>
            ) : (
              <div className="space-y-2">
                {urgentTasks.map((t) => (
                  <div key={t.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                    <span className="text-[9px] font-bold text-rose-700 block">{t.priority}</span>
                    <p className="font-bold text-slate-900 text-xs truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      المكلف: {t.assignedToName} • التسليم: {t.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
