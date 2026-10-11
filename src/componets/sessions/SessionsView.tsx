import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Gavel,
  Send,
  CheckCircle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  User,
  ExternalLink,
  Edit2,
  Trash2
} from 'lucide-react';
import { Session, SessionStatus, LegalCase, Client } from '../../types';
import {
  formatDateArabic,
  detectSessionConflicts,
  generateWhatsAppSessionReminder
} from '../../utils/formatters';

interface SessionsViewProps {
  sessions: Session[];
  cases: LegalCase[];
  clients: Client[];
  onOpenAddSession: () => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
  onRecordDecision: (session: Session) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  sessions,
  cases,
  clients,
  onOpenAddSession,
  onEditSession,
  onDeleteSession,
  onRecordDecision,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<SessionStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Conflict detection
  const conflicts = detectSessionConflicts(sessions);

  // Filtered sessions
  const filteredSessions = sessions
    .filter((s) => {
      const matchesSearch =
        s.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.court.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    });

  // Calendar calculations
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + selectedMonthOffset);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthName = new Intl.DateTimeFormat('ar-SA', { month: 'long', year: 'numeric' }).format(
    currentDate
  );

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 pt-3 font-['Cairo',sans-serif]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <span>الجلسات والمواعيد والتقويم الذكي</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            جدولة دقيقة وتنبيهات مبكرة قبل 24 ساعة وساعتين
          </p>
        </div>

        <button
          onClick={onOpenAddSession}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>جدولة جلسة</span>
        </button>
      </div>

      {/* Conflicts Alert Banner if any */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-2 text-xs text-red-900 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-red-700">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>تحذير تعارض المواعيد القضائية ({conflicts.length})</span>
          </div>
          {conflicts.map((conf, idx) => (
            <div
              key={idx}
              className="bg-white p-2.5 rounded-xl border border-red-100 text-[11px] text-slate-700 leading-relaxed shadow-xs"
            >
              <p className="text-red-700 font-bold">{conf.reason}</p>
              <p className="text-slate-500 mt-1">
                الجلسة الأولى: قضية #{conf.session1.caseNumber} ({conf.session1.time}) • الجلسة الثانية: قضية #{conf.session2.caseNumber} ({conf.session2.time})
              </p>
            </div>
          ))}
        </div>
      )}

      {/* View Switcher: List vs Interactive Calendar */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-200 text-xs shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              viewMode === 'list'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            عرض القائمة والتنبيهات
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              viewMode === 'calendar'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            التقويم الشهري التفاعلي
          </button>
        </div>

        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 text-[11px] font-bold focus:outline-none"
        >
          <option value="ALL">جميع الحالات</option>
          <option value="scheduled">مجدولة قادمة</option>
          <option value="completed">منتهية ومحكومة</option>
          <option value="postponed">مؤجلة</option>
        </select>
      </div>

      {/* VIEW 1: INTERACTIVE MONTHLY CALENDAR - LIGHT */}
      {viewMode === 'calendar' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* Month Header Switcher */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-sm text-slate-900">{monthName}</h3>
            <button
              onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
            <span>الأحد</span>
            <span>الاثنين</span>
            <span>الثلاثاء</span>
            <span>الأربعاء</span>
            <span>الخميس</span>
            <span>الجمعة</span>
            <span>السبت</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 bg-slate-50/50 rounded-xl" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const daySessions = sessions.filter((s) => s.date === dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dayNum}
                  className={`h-14 p-1.5 rounded-xl border text-right flex flex-col justify-between transition ${
                    isToday
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs'
                      : daySessions.length > 0
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-100 bg-slate-50/60'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold ${
                      isToday ? 'text-blue-800' : 'text-slate-600'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {daySessions.length > 0 && (
                    <div className="space-y-0.5">
                      {daySessions.slice(0, 1).map((s) => (
                        <div
                          key={s.id}
                          onClick={() => onRecordDecision(s)}
                          className="bg-emerald-600 text-white text-[8px] font-bold px-1 py-0.5 rounded truncate cursor-pointer shadow-2xs"
                          title={`${s.caseTitle} (${s.time})`}
                        >
                          {s.time} {s.caseNumber}
                        </div>
                      ))}
                      {daySessions.length > 1 && (
                        <span className="text-[8px] text-blue-700 font-bold block text-center">
                          +{daySessions.length - 1} أخرى
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: LIST VIEW WITH SMART EARLY WARNINGS - LIGHT */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الجلسات بالقضية، الموكل، أو المحكمة..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 pr-10 shadow-xs transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          {filteredSessions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs shadow-xs">
              لا توجد جلسات مطابقة للمعايير المحددة
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredSessions.map((session) => {
                const isToday = session.date === todayStr;
                const isTomorrow = session.date === tomorrowStr;
                const client = clients.find((c) => c.id === session.clientId);

                return (
                  <div
                    key={session.id}
                    className={`bg-white border rounded-3xl p-4 transition shadow-xs ${
                      isToday
                        ? 'border-red-300 bg-red-50/20'
                        : isTomorrow
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header: Date, Time & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isToday
                                ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                : isTomorrow
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isToday ? 'اليوم (تنبيه فوري)' : isTomorrow ? 'غداً (تنبيه 24 ساعة)' : session.date}
                          </span>

                          <span className="text-xs font-mono font-bold text-blue-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>{session.time}</span>
                          </span>

                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {session.sessionType}
                          </span>

                          {session.status === 'completed' && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                              تمت الجلسة
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 mt-1.5">
                          {session.caseTitle}
                        </h3>

                        <p className="text-xs text-slate-500 font-mono mt-0.5 font-medium">
                          رقم القضية: #{session.caseNumber} • الموكل: {session.clientName}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditSession(session)}
                          className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف موعد هذه الجلسة؟')) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Court & Hall */}
                    <div className="mt-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate font-medium">
                        <Gavel className="w-4 h-4 text-blue-700 shrink-0" />
                        <span className="truncate">{session.court}</span>
                      </div>
                      <span className="text-slate-500 shrink-0 text-[11px] font-mono font-bold">
                        {session.hall}
                      </span>
                    </div>

                    {/* Requirements */}
                    {session.requirements && (
                      <div className="mt-2 p-2.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-[11px] text-blue-900">
                        <strong className="font-bold block mb-0.5">
                          المطلوب تقديمه بالجلسة:
                        </strong>
                        <p className="font-medium">{session.requirements}</p>
                      </div>
                    )}

                    {/* Decision notes if recorded */}
                    {session.decisionNotes && (
                      <div className="mt-2 p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900">
                        <strong className="font-bold block mb-0.5">
                          قرار المحكمة وما تم بالجلسة:
                        </strong>
                        <p>{session.decisionNotes}</p>
                        {session.nextSessionDate && (
                          <p className="mt-1 font-bold text-amber-800">
                            الجلسة القادمة محددة بتاريخ: {session.nextSessionDate}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onRecordDecision(session)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-bold transition"
                      >
                        {session.decisionNotes ? 'تحديث قرار الجلسة ✍️' : 'تسجيل ما تم بالجلسة ✍️'}
                      </button>

                      <a
                        href={generateWhatsAppSessionReminder(session, client?.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال تذكير واتساب للموكل</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
