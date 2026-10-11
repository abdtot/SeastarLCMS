import React, { useState } from 'react';
import { X, Briefcase, Plus, Save, User, Scale, Gavel } from 'lucide-react';
import { LegalCase, LitigationStage, CaseStatus, ClientRole, Client, LawyerMember, CourtInfo } from '../../types';
import { LAWYERS, StorageService } from '../../services/storage';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Partial<LegalCase>) => void;
  clients: Client[];
  courts?: CourtInfo[];
  onOpenAddCourt?: () => void;
  initialData?: LegalCase | null;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  courts,
  onOpenAddCourt,
  initialData,
}) => {
  if (!isOpen) return null;

  const availableCourts = courts && courts.length > 0 ? courts : StorageService.getCourts();

  const [caseNumber, setCaseNumber] = useState(initialData?.caseNumber || '');
  const [generalRegistrationNumber, setGeneralRegistrationNumber] = useState(
    initialData?.generalRegistrationNumber || `CR-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [year, setYear] = useState<number>(initialData?.year || 1446);
  const [court, setCourt] = useState(initialData?.court || (availableCourts[0]?.name || 'المحكمة التجارية بالأمانة - صنعاء'));
  const [circuit, setCircuit] = useState(
    initialData?.circuit || (availableCourts[0]?.defaultCircuit || 'الدائرة القضائية الأولى')
  );
  const [judgeName, setJudgeName] = useState(
    initialData?.judgeName || (availableCourts[0]?.chiefJudge || 'فضيلة القاضي')
  );
  const [caseType, setCaseType] = useState(initialData?.caseType || '');
  const [litigationStage, setLitigationStage] = useState<LitigationStage>(
    initialData?.litigationStage || 'ابتدائي'
  );
  const [status, setStatus] = useState<CaseStatus>(initialData?.status || 'جارية');
  const [claimAmount, setClaimAmount] = useState<string>(
    initialData?.claimAmount ? String(initialData.claimAmount) : ''
  );
  const [clientId, setClientId] = useState(initialData?.clientId || (clients[0]?.id || ''));
  const [clientRole, setClientRole] = useState<ClientRole>(initialData?.clientRole || 'مدعي');
  const [opponentName, setOpponentName] = useState(initialData?.opponentName || '');
  const [opponentLawyer, setOpponentLawyer] = useState(initialData?.opponentLawyer || '');
  const [assignedLawyerId, setAssignedLawyerId] = useState(
    initialData?.assignedLawyerId || LAWYERS[0].id
  );
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber || !caseType || !opponentName) {
      alert('يرجى تعبئة الحقول الأساسية: رقم القضية، موضوع الدعوى، واسم الخصم.');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    const selectedLawyer = LAWYERS.find((l) => l.id === assignedLawyerId);

    const payload: Partial<LegalCase> = {
      ...(initialData ? { id: initialData.id } : {}),
      caseNumber,
      generalRegistrationNumber,
      year: Number(year),
      court,
      circuit,
      judgeName,
      caseType,
      litigationStage,
      status,
      claimAmount: claimAmount ? Number(claimAmount) : undefined,
      clientId,
      clientName: selectedClient ? selectedClient.fullName : 'موكل غير محدد',
      clientRole,
      opponentName,
      opponentLawyer,
      assignedLawyerId,
      assignedLawyerName: selectedLawyer ? selectedLawyer.name : LAWYERS[0].name,
      description,
      parties: initialData?.parties || [
        {
          id: 'p-client',
          name: selectedClient ? selectedClient.fullName : 'الموكل',
          role: 'client',
        },
        {
          id: 'p-opponent',
          name: opponentName,
          role: 'opponent',
        },
      ],
      updatedAt: new Date().toISOString().split('T')[0],
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-3 animate-in fade-in">
      <div className="bg-white border-t sm:border border-slate-200 w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              {initialData ? 'تعديل بيانات القضية' : 'تسجيل قضية جديدة في النظام'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* Row 1: Case Number & Registration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                رقم القضية <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="مثال: 44102983"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">رقم القيد العام</label>
              <input
                type="text"
                value={generalRegistrationNumber}
                onChange={(e) => setGeneralRegistrationNumber(e.target.value)}
                placeholder="CR-XXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono transition"
              />
            </div>
          </div>

          {/* Row 2: Subject */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              موضوع الدعوى وتفاصيل المطالبة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              placeholder="مثال: مطالبة مالية وتعويض عن إخلال بعقد توريد..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Row 3: Court & Circuit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">المحكمة المختصة</label>
                {onOpenAddCourt && (
                  <button
                    type="button"
                    onClick={onOpenAddCourt}
                    className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>محكمة جديدة</span>
                  </button>
                )}
              </div>
              <select
                value={court}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  setCourt(selectedName);
                  const found = availableCourts.find((c) => c.name === selectedName);
                  if (found) {
                    if (found.defaultCircuit) setCircuit(found.defaultCircuit);
                    if (found.chiefJudge) setJudgeName(found.chiefJudge);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              >
                {availableCourts.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">الدائرة القضائية</label>
              <input
                type="text"
                value={circuit}
                onChange={(e) => setCircuit(e.target.value)}
                placeholder="مثال: الدائرة التجارية الرابعة"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Row 4: Judge & Claim Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">اسم القاضي / الدائرة</label>
              <input
                type="text"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
                placeholder="فضيلة القاضي..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                قيمة المطالبة المالية (ر.ي)
              </label>
              <input
                type="number"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="اختياري - مثلاً: 1500000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono transition"
              />
            </div>
          </div>

          {/* Row 5: Client Selection & Role */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-blue-900 font-bold mb-1">الموكل / العميل</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 transition"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-900 font-bold mb-1">صفة الموكل في الدعوى</label>
              <select
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value as ClientRole)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 transition"
              >
                <option value="مدعي">مدعي (طالب الحق)</option>
                <option value="مدعى عليه">مدعى عليه</option>
                <option value="مستشار">استشارة قانونية</option>
                <option value="طرف ثالث">طرف ثالث منضم/متدخل</option>
              </select>
            </div>
          </div>

          {/* Row 6: Opponent & Opponent Lawyer */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-rose-800 font-bold mb-1">
                اسم الخصم (الطرف الآخر) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                placeholder="اسم الشخص أو الشركة المنازعة"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">محامي الخصم وبياناته</label>
              <input
                type="text"
                value={opponentLawyer}
                onChange={(e) => setOpponentLawyer(e.target.value)}
                placeholder="اسم المحامي / هاتف التواصل"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Row 7: Stage, Status & Lawyer */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">مرحلة التقاضي</label>
              <select
                value={litigationStage}
                onChange={(e) => setLitigationStage(e.target.value as LitigationStage)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 focus:outline-none focus:border-blue-600 transition"
              >
                <option value="ابتدائي">ابتدائي</option>
                <option value="استئناف">استئناف</option>
                <option value="عليا / تمييز">عليا / تمييز</option>
                <option value="تنفيذ">تنفيذ</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">حالة القضية</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 focus:outline-none focus:border-blue-600 transition"
              >
                <option value="جارية">جارية</option>
                <option value="معلقة">معلقة</option>
                <option value="محكومة">محكومة</option>
                <option value="منتهية">منتهية</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">المحامي المكلف</label>
              <select
                value={assignedLawyerId}
                onChange={(e) => setAssignedLawyerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 focus:outline-none focus:border-blue-600 transition"
              >
                {LAWYERS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              ملاحظات القضية واستراتيجية الدفاع
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="سجل وقائع النزاع، النقاط الجوهرية، والأدلة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition shadow-md shadow-blue-700/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'حفظ التعديلات' : 'إضافة القضية'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
