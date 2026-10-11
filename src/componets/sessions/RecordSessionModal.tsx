import React, { useState } from 'react';
import { X, Gavel, Save, Calendar, CheckCircle } from 'lucide-react';
import { Session, SessionStatus } from '../../types';

interface RecordSessionModalProps {
  session: Session | null;
  onClose: () => void;
  onSaveDecision: (
    sessionId: string,
    decisionNotes: string,
    status: SessionStatus,
    nextSessionDate?: string
  ) => void;
}

export const RecordSessionModal: React.FC<RecordSessionModalProps> = ({
  session,
  onClose,
  onSaveDecision,
}) => {
  if (!session) return null;

  const [decisionNotes, setDecisionNotes] = useState(session.decisionNotes || '');
  const [status, setStatus] = useState<SessionStatus>(session.status || 'completed');
  const [nextSessionDate, setNextSessionDate] = useState(session.nextSessionDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDecision(session.id, decisionNotes, status, nextSessionDate || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">تسجيل ما تم بالجلسة وقرار المحكمة</h3>
              <p className="text-[11px] text-slate-500 font-medium">قضية #{session.caseNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Status */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">حالة الجلسة</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition ${
                  status === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                تمت الجلسة
              </button>
              <button
                type="button"
                onClick={() => setStatus('postponed')}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition ${
                  status === 'postponed'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                تأجلت
              </button>
              <button
                type="button"
                onClick={() => setStatus('cancelled')}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition ${
                  status === 'cancelled'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ألغيت
              </button>
            </div>
          </div>

          {/* Decision Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              ما تم بالجلسة وقرار القاضي / الدائرة القضائية <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="مثال: حضر وكيل المدعي والمدعى عليه، وقدمنا مذكرة الرد وتقرير الخبير، وأمهل القاضي الخصم 10 أيام للجواب..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition"
            />
          </div>

          {/* Next Hearing Date */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              تاريخ الجلسة القادمة (إن حددت)
            </label>
            <div className="relative">
              <input
                type="date"
                value={nextSessionDate}
                onChange={(e) => setNextSessionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono transition"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              سيقوم النظام بإنشاء تذكير ذكي لموعد الجلسة القادمة تلقائياً.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-bold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition shadow-md shadow-blue-700/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>حفظ النتيجة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
