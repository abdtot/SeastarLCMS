import React, { useState } from 'react';
import { X, Calendar, Clock, Save, Gavel } from 'lucide-react';
import { Session, SessionType, LegalCase, Client } from '../../types';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Partial<Session>) => void;
  cases: LegalCase[];
  clients: Client[];
  initialData?: Session | null;
  defaultCaseId?: string;
}

const SESSION_TYPES: SessionType[] = [
  'مرافعة',
  'سماع شهود',
  'ندب خبير',
  'نطق بالحكم',
  'تبادل مذكرات',
  'جلسة صلح',
  'تحقيق',
];

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cases,
  clients,
  initialData,
  defaultCaseId,
}) => {
  if (!isOpen) return null;

  const targetCaseId = initialData?.caseId || defaultCaseId || cases[0]?.id || '';
  const [selectedCaseId, setSelectedCaseId] = useState(targetCaseId);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(initialData?.time || '10:00');
  const [sessionType, setSessionType] = useState<SessionType>(
    initialData?.sessionType || 'مرافعة'
  );
  const [court, setCourt] = useState(
    initialData?.court || selectedCase?.court || 'المحكمة العامة بالرياض'
  );
  const [hall, setHall] = useState(
    initialData?.hall || selectedCase?.circuit || 'القاعة 3 - الدائرة القضائية'
  );
  const [requirements, setRequirements] = useState(
    initialData?.requirements || ''
  );

  const handleCaseChange = (caseId: string) => {
    setSelectedCaseId(caseId);
    const c = cases.find((item) => item.id === caseId);
    if (c) {
      setCourt(c.court);
      setHall(`${c.circuit} - قاعة الجلسات`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) {
      alert('يرجى اختيار القضية أولاً');
      return;
    }

    const payload: Partial<Session> = {
      ...(initialData ? { id: initialData.id } : {}),
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      caseTitle: selectedCase.caseType,
      clientId: selectedCase.clientId,
      clientName: selectedCase.clientName,
      court,
      hall,
      date,
      time,
      sessionType,
      requirements,
      status: initialData?.status || 'scheduled',
      remindersSent: initialData?.remindersSent || { before24h: false, before2h: false },
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-3 animate-in fade-in">
      <div className="bg-white border-t sm:border border-slate-200 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right max-h-[90vh]">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              {initialData ? 'تعديل موعد الجلسة' : 'جدولة جلسة قضائية جديدة'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Select Case */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              اختر القضية المرتبطة بالجلسة <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => handleCaseChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium transition"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  قضية #{c.caseNumber} - {c.clientName} ({c.caseType})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                تاريخ الجلسة <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                التوقيت <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono transition"
              />
            </div>
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">نوع الجلسة</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium transition"
            >
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Court & Hall */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">المحكمة</label>
              <input
                type="text"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">القاعة أو الرابط المرئي</label>
              <input
                type="text"
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                placeholder="قاعة (4) أو رابط ناجز"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              المطلوب تجهيزه للجلسة (مذكرات، شهود، أصول مستندات)
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="مثال: تقديم مذكرة جوابية على دفوع الخصم وإحضار الشاهد..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition"
            />
          </div>

          {/* Smart alert note */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              يقوم نظام SeaStar بجدولة تنبيهات تلقائية قبل 24 ساعة وقبل ساعتين من موعد الجلسة.
            </span>
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
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'حفظ التعديلات' : 'جدولة الجلسة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
