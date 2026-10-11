import React, { useState, useEffect } from 'react';
import {
  X,
  Landmark,
  Save,
  Plus,
  Search,
  MapPin,
  Phone,
  Clock,
  Gavel,
  Edit2,
  Trash2,
  CheckCircle2,
  Building2,
  Scale
} from 'lucide-react';
import { CourtInfo, CourtType } from '../../types';

interface AddCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: CourtInfo[];
  onSaveCourt: (courtData: CourtInfo) => void;
  onDeleteCourt: (courtId: string) => void;
}

const COURT_TYPES: CourtType[] = [
  'تجارية',
  'ابتدائية / عامة',
  'استئناف',
  'عليا / نقض',
  'عمالية',
  'أحوال شخصية',
  'جزائية',
  'تنفيذ',
  'إدارية',
];

const YEMEN_CITIES = [
  'صنعاء',
  'عدن',
  'تعز',
  'حضرموت - المكلا',
  'إب',
  'الحديدة',
  'ذمار',
  'مأرب',
  'عمران',
  'شبوة',
  'لحج',
  'أبين',
  'الرياض',
  'جدة',
];

export const AddCourtModal: React.FC<AddCourtModalProps> = ({
  isOpen,
  onClose,
  courts,
  onSaveCourt,
  onDeleteCourt,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'directory'>('form');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState<CourtType>('تجارية');
  const [city, setCity] = useState('صنعاء');
  const [address, setAddress] = useState('');
  const [defaultCircuit, setDefaultCircuit] = useState('');
  const [chiefJudge, setChiefJudge] = useState('');
  const [secretaryPhone, setSecretaryPhone] = useState('');
  const [workingHours, setWorkingHours] = useState('08:30 ص - 01:30 م');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setType('تجارية');
    setCity('صنعاء');
    setAddress('');
    setDefaultCircuit('');
    setChiefJudge('');
    setSecretaryPhone('');
    setWorkingHours('08:30 ص - 01:30 م');
    setNotes('');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setActiveTab('form');
      setToastMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEditCourt = (court: CourtInfo) => {
    setEditingId(court.id);
    setName(court.name);
    setType(court.type);
    setCity(court.city || 'صنعاء');
    setAddress(court.address || '');
    setDefaultCircuit(court.defaultCircuit || '');
    setChiefJudge(court.chiefJudge || '');
    setSecretaryPhone(court.secretaryPhone || '');
    setWorkingHours(court.workingHours || '08:30 ص - 01:30 م');
    setNotes(court.notes || '');
    setActiveTab('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const existing = editingId ? courts.find((c) => c.id === editingId) : undefined;
    const courtPayload: CourtInfo = {
      id: editingId || `court-${Date.now()}`,
      name: name.trim(),
      type,
      city: city.trim() || 'صنعاء',
      address: address.trim() || 'المجمع القضائي',
      defaultCircuit: defaultCircuit.trim() || 'الدائرة الأولى',
      chiefJudge: chiefJudge.trim() || undefined,
      secretaryPhone: secretaryPhone.trim() || undefined,
      workingHours: workingHours.trim() || '08:30 ص - 01:30 م',
      notes: notes.trim() || undefined,
      createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveCourt(courtPayload);
    setToastMsg(
      editingId
        ? `تم تحديث بيانات "${courtPayload.name}" بنجاح`
        : `تمت إضافة "${courtPayload.name}" إلى دليل المحاكم وقاعدة البيانات`
    );
    resetForm();
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const filteredCourts = courts.filter(
    (c) =>
      c.name.includes(searchQuery) ||
      c.city.includes(searchQuery) ||
      c.type.includes(searchQuery) ||
      (c.chiefJudge && c.chiefJudge.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-3 animate-in fade-in font-['Cairo',sans-serif]">
      <div className="bg-white border-t sm:border border-slate-200 w-full max-w-md max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-l from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">إدخال ودليل بيانات المحاكم</h3>
              <p className="text-[10px] text-blue-200">
                المحاكم المسجلة في النظام: {courts.length} محكمة وجهة قضائية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'form'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingId ? 'تعديل بيانات المحكمة' : 'إدخال محكمة جديدة'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'directory'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>دليل المحاكم ({courts.length})</span>
          </button>
        </div>

        {/* Toast feedback */}
        {toastMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* TAB 1: COURT DATA ENTRY FORM */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
            {/* Court Name */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                اسم المحكمة / الجهة القضائية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: المحكمة التجارية بالأمانة - صنعاء"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            {/* Court Type & City */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع ودرجة المحكمة</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CourtType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition"
                >
                  {COURT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المحافظة / المدينة</label>
                <input
                  type="text"
                  list="cities-list"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="صنعاء، عدن، تعز..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
                <datalist id="cities-list">
                  {YEMEN_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Default Circuit & Chief Judge */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  الدائرة القضائية / القاعة
                </label>
                <input
                  type="text"
                  value={defaultCircuit}
                  onChange={(e) => setDefaultCircuit(e.target.value)}
                  placeholder="الدائرة التجارية الأولى - قاعة 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  رئيس المحكمة / القاضي المختص
                </label>
                <input
                  type="text"
                  value={chiefJudge}
                  onChange={(e) => setChiefJudge(e.target.value)}
                  placeholder="القاضي..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Secretary Phone & Working Hours */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  هاتف قلم الكتاب / أمين السر
                </label>
                <input
                  type="text"
                  value={secretaryPhone}
                  onChange={(e) => setSecretaryPhone(e.target.value)}
                  placeholder="+967 1 ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono dir-ltr text-right focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  أوقات انعقاد الجلسات والدوام
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="08:30 ص - 01:30 م"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Detailed Address */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                العنوان التفصيلي ومقر المحكمة
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: شارع العدل - جوار وزارة العدل - المبنى الرئيسي"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            {/* Procedural Notes */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                ملاحظات إجرائية ومتطلبات قيد الدعاوى بالمحكمة
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يشترط إرفاق صورة البطاقة الضريبية والسجل التجاري عند قيد الدعوى التجارية..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            {/* Submit & Reset Actions */}
            <div className="pt-2 flex items-center gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  إلغاء التعديل
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-700/20 transition"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? 'حفظ التعديلات على المحكمة' : 'حفظ المحكمة في قاعدة البيانات'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: COURTS DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المحكمة، المدينة، أو اسم القاضي..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            {filteredCourts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Scale className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold">لا توجد محاكم مطابقة للبحث</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredCourts.map((court) => (
                  <div
                    key={court.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-xs">{court.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                            {court.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>
                            {court.city} — {court.address}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditCourt(court)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 transition"
                          title="تعديل بيانات المحكمة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCourt(court.id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 transition"
                          title="حذف المحكمة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/70 text-[10px] text-slate-600">
                      {court.defaultCircuit && (
                        <div className="flex items-center gap-1 truncate">
                          <Gavel className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{court.defaultCircuit}</span>
                        </div>
                      )}
                      {court.chiefJudge && (
                        <div className="flex items-center gap-1 truncate">
                          <Scale className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{court.chiefJudge}</span>
                        </div>
                      )}
                      {court.secretaryPhone && (
                        <div className="flex items-center gap-1 font-mono dir-ltr text-right">
                          <Phone className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>{court.secretaryPhone}</span>
                        </div>
                      )}
                      {court.workingHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{court.workingHours}</span>
                        </div>
                      )}
                    </div>

                    {court.notes && (
                      <p className="text-[10px] text-slate-500 bg-white p-2 rounded-xl border border-slate-100">
                        {court.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
