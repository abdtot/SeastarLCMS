import React from 'react';
import {
  Briefcase,
  Calendar,
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  ChevronLeft,
  ShieldAlert,
  ArrowUpRight,
  Gavel,
  BellRing,
  Sparkles
} from 'lucide-react';
import {
  LegalCase,
  Session,
  Client,
  FinancialRecord,
  LegalTask,
  ActiveTab
} from '../../types';
import {
  formatCurrency,
  formatDateArabic,
  getDaysRemaining,
  formatDaysRemainingLabel,
  detectSessionConflicts,
  generateWhatsAppSessionReminder,
  generateWhatsAppPoaReminder
} from '../../utils/formatters';

interface DashboardViewProps {
  cases: LegalCase[];
  sessions: Session[];
  clients: Client[];
  finance: FinancialRecord[];
  tasks: LegalTask[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSessionDetails: (session: Session) => void;
  onOpenCaseDetails: (c: LegalCase) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  sessions,
  clients,
  finance,
  tasks,
  setActiveTab,
  onOpenSessionDetails,
  onOpenCaseDetails,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Active cases count
  const activeCases = cases.filter(c => c.status === 'جارية');

  // Sessions today
  const todaySessions = sessions.filter(
    s => s.date === todayStr && s.status === 'scheduled'
  );

  // Sessions tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const tomorrowSessions = sessions.filter(
    s => s.date === tomorrowStr && s.status === 'scheduled'
  );

  // Upcoming sessions in next 7 days
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);
  const upcomingWeekSessions = sessions.filter(s => {
    return s.date >= todayStr && s.date <= next7Days.toISOString().split('T')[0] && s.status === 'scheduled';
  });

  // Conflicts
  const conflicts = detectSessionConflicts(sessions);

  // Expiring POAs (within 14 days or expired)
  const expiringPoas: { client: Client; poa: any; days: number }[] = [];
  clients.forEach(c => {
    c.poas.forEach(p => {
      const days = getDaysRemaining(p.expiryDate);
      if (days <= 14) {
        expiringPoas.push({ client: c, poa: p, days });
      }
    });
  });

  // Financial metrics
  const totalReceipts = finance
    .filter(f => f.type === 'receipt_voucher')
    .reduce((sum, f) => sum + f.totalWithTax, 0);

  const totalExpenses = finance
    .filter(f => f.type === 'payment_voucher')
    .reduce((sum, f) => sum + f.totalWithTax, 0);

  const netIncome = totalReceipts - totalExpenses;

  // Urgent pending tasks
  const urgentTasks = tasks.filter(t => t.priority === 'حرجة' || t.priority === 'عالية');

  return (
    <div className="space-y-3.5 pb-24 px-3 sm:px-3.5 pt-3 font-['Cairo',sans-serif]">
      {/* Welcome Banner - Modern Luminous Light Palette */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-indigo-50/40 border border-blue-200/80 p-4 sm:p-4.5 shadow-xs">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-700 tracking-wide">
                نظام التقاضي والمواعيد الذكي
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              مرحباً بك في SeaStar
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {formatDateArabic(todayStr)} • <span className="text-blue-700 font-bold">{todaySessions.length} جلسات اليوم</span>
            </p>
          </div>
          <div className="text-left bg-white/95 border border-blue-150 rounded-2xl px-3 py-2 shadow-xs">
            <span className="text-[10px] text-slate-500 block font-medium">صافي التدفقات</span>
            <span className="text-xs sm:text-sm font-black text-emerald-700 font-mono">
              {formatCurrency(netIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Early Warning System (Alerts Banner) */}
      {(conflicts.length > 0 || expiringPoas.length > 0) && (
        <div className="space-y-2">
          {/* Conflict Alert */}
          {conflicts.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-900 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-rose-800">تنبيه ذكي: رصد تعارض في مواعيد الجلسات!</p>
                <p className="text-rose-900/80 mt-0.5 leading-relaxed text-[11px]">
                  {conflicts[0].reason}
                </p>
                <div className="mt-2">
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className="text-[11px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-3 py-1 rounded-xl font-bold shadow-xs transition"
                  >
                    مراجعة جدول الجلسات
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Expiring POAs Alert */}
          {expiringPoas.length > 0 && (
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-950 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-amber-900">تنبيه انتهاء وكالة قضائية</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">
                    {formatDaysRemainingLabel(expiringPoas[0].days).text}
                  </span>
                </div>
                <p className="text-amber-900/90 mt-1 text-[11px]">
                  الموكل: <strong className="text-slate-900 font-bold">{expiringPoas[0].client.fullName}</strong> - وكالة ({expiringPoas[0].poa.poaNumber})
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={generateWhatsAppPoaReminder(
                      expiringPoas[0].client.fullName,
                      expiringPoas[0].poa.poaNumber,
                      expiringPoas[0].poa.expiryDate,
                      expiringPoas[0].client.phone
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 py-1 rounded-xl text-[11px] font-bold shadow-xs transition"
                  >
                    <Send className="w-3 h-3" />
                    <span>تذكير الموكل عبر واتساب</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Grid - Material 3 Mobile 2-Column Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Cases */}
        <div
          onClick={() => setActiveTab('cases')}
          className="cursor-pointer bg-white active:scale-[0.98] border border-slate-200/90 p-3.5 rounded-2xl transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500">القضايا الجارية</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{activeCases.length}</span>
            <span className="text-[10px] text-blue-700 font-bold">من إجمالي {cases.length}</span>
          </div>
        </div>

        {/* Sessions Today */}
        <div
          onClick={() => setActiveTab('sessions')}
          className="cursor-pointer bg-white active:scale-[0.98] border border-slate-200/90 p-3.5 rounded-2xl transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500">جلسات اليوم</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{todaySessions.length}</span>
            <span className="text-[10px] text-emerald-700 font-bold">
              +{tomorrowSessions.length} غداً
            </span>
          </div>
        </div>

        {/* Clients */}
        <div
          onClick={() => setActiveTab('clients')}
          className="cursor-pointer bg-white active:scale-[0.98] border border-slate-200/90 p-3.5 rounded-2xl transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500">الموكلين والعملاء</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{clients.length}</span>
            <span className="text-[10px] text-purple-700 font-bold">ملفات نشطة</span>
          </div>
        </div>

        {/* Urgent Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="cursor-pointer bg-white active:scale-[0.98] border border-slate-200/90 p-3.5 rounded-2xl transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500">مهام عاجلة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{urgentTasks.length}</span>
            <span className="text-[10px] text-amber-700 font-bold">أولوية حرجة</span>
          </div>
        </div>
      </div>

      {/* Today's & Upcoming Hearings Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              الجلسات والمواعيد القضائية القادمة
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('sessions')}
            className="text-[11px] text-blue-700 hover:text-blue-800 font-bold flex items-center gap-0.5"
          >
            <span>عرض التقويم</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingWeekSessions.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            لا توجد جلسات مجدولة خلال الـ 7 أيام القادمة
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingWeekSessions.slice(0, 3).map((session) => {
              const isToday = session.date === todayStr;
              const isTomorrow = session.date === tomorrowStr;

              return (
                <div
                  key={session.id}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isToday
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isTomorrow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {isToday ? 'اليوم' : isTomorrow ? 'غداً' : session.date}
                        </span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {session.time}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-medium">
                          (قضية #{session.caseNumber})
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 truncate">
                        {session.caseTitle}
                      </h4>

                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <Gavel className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{session.court} - {session.hall}</span>
                      </p>

                      {session.requirements && (
                        <p className="text-[10px] text-slate-600 mt-1.5 bg-white p-1.5 rounded-xl border border-slate-200">
                          <strong className="text-blue-900 font-bold">المطلوب:</strong> {session.requirements}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for this hearing */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/80">
                    <button
                      onClick={() => onOpenSessionDetails(session)}
                      className="text-[10px] sm:text-[11px] text-slate-700 hover:text-blue-700 active:scale-95 font-bold"
                    >
                      تسجيل ما تم بالجلسة ✍️
                    </button>

                    <a
                      href={generateWhatsAppSessionReminder(session)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 py-1 rounded-xl font-bold shadow-xs transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>تذكير واتساب</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financial Health Mini Summary */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">المؤشرات المالية العامة</h3>
          </div>
          <button
            onClick={() => setActiveTab('finance')}
            className="text-[11px] text-blue-700 hover:text-blue-800 font-bold flex items-center gap-0.5"
          >
            <span>سندات القبض والفواتير</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-800">الأتعاب المحصلة</p>
            <p className="text-sm sm:text-base font-black text-emerald-700 mt-0.5 font-mono">
              {formatCurrency(totalReceipts)}
            </p>
          </div>

          <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-100">
            <p className="text-[10px] font-bold text-rose-800">المصروفات والرسوم</p>
            <p className="text-sm sm:text-base font-black text-rose-700 mt-0.5 font-mono">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* High-priority Tasks */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-purple-600 rounded-full" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">المهام القضائية المستعجلة</h3>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-[11px] text-blue-700 hover:text-blue-800 font-bold flex items-center gap-0.5"
          >
            <span>كل المهام</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {urgentTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              onClick={() => setActiveTab('tasks')}
              className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 p-2.5 rounded-2xl cursor-pointer transition flex items-center justify-between gap-2.5 active:scale-[0.98]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      task.priority === 'حرجة'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">{task.title}</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">
                  {task.assignedToName} • {task.dueDate}
                </p>
              </div>

              <div className="w-10 text-left">
                <span className="text-[10px] font-mono text-slate-700 font-bold block">
                  {task.progressPercentage}%
                </span>
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${task.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
