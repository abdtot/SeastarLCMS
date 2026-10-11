import React, { useState } from 'react';
import { X, UserPlus, Save, ShieldCheck } from 'lucide-react';
import { Client, ClientRole, PowerOfAttorney } from '../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => void;
  initialData?: Client | null;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [nationalId, setNationalId] = useState(initialData?.nationalId || '');
  const [phone, setPhone] = useState(initialData?.phone || '+966 ');
  const [email, setEmail] = useState(initialData?.email || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [clientRole, setClientRole] = useState<ClientRole>(initialData?.clientRole || 'مدعي');
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [hasPoa, setHasPoa] = useState(initialData?.poas && initialData.poas.length > 0 ? true : true);
  const existingPoa = initialData?.poas?.[0];
  const [poaNumber, setPoaNumber] = useState(existingPoa?.poaNumber || '');
  const [poaExpiry, setPoaExpiry] = useState(
    existingPoa?.expiryDate ||
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [poaIssuer, setPoaIssuer] = useState(existingPoa?.issuer || 'كتابة العدل بالرياض');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !nationalId || !phone) {
      alert('يرجى ملء الاسم الكامل، رقم الهوية/السجل التجاري، ورقم الجوال');
      return;
    }

    const poas: PowerOfAttorney[] = hasPoa && poaNumber
      ? [
          {
            id: existingPoa?.id || `poa-${Date.now()}`,
            poaNumber,
            issueDate: existingPoa?.issueDate || new Date().toISOString().split('T')[0],
            expiryDate: poaExpiry,
            issuer: poaIssuer,
            status: 'active',
            notes: 'وكالة قضائية معتمدة مسجلة عبر النظام.',
          },
        ]
      : (initialData?.poas || []);

    const payload: Partial<Client> = {
      ...(initialData ? { id: initialData.id } : {}),
      fullName,
      nationalId,
      phone,
      email,
      address,
      clientRole,
      companyName,
      notes,
      poas,
      portalToken: initialData?.portalToken || `portal-${Math.random().toString(36).substring(7)}`,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 border border-purple-200 text-purple-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              {initialData ? 'تعديل بيانات الموكل' : 'تسجيل موكل جديد في النظام'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto max-h-[80vh]">
          {/* Full Name & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                اسم الموكل أو الشركة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الكامل أو اسم المؤسسة"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">صفة الموكل المعتادة</label>
              <select
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value as ClientRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-medium transition"
              >
                <option value="مدعي">مدعي</option>
                <option value="مدعى عليه">مدعى عليه</option>
                <option value="مستشار">استشارات قانونية</option>
                <option value="طرف ثالث">طرف ثالث</option>
              </select>
            </div>
          </div>

          {/* National ID & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                رقم الهوية / السجل التجاري <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="10XXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-mono transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                رقم الجوال للتواصل والواتساب <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 50 000 0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white font-mono dir-ltr text-right transition"
              />
            </div>
          </div>

          {/* Email & Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">اسم المنشأة أو الكيان</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="اختياري - اسم الشركة..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">العنوان الوطني ومكان الإقامة</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="المدينة، الحي، الشارع..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
            />
          </div>

          {/* Power of Attorney Section */}
          <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-purple-900 flex items-center gap-1.5 cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>تسجيل وكالة قضائية رسمية للموكل</span>
              </label>
              <input
                type="checkbox"
                checked={hasPoa}
                onChange={(e) => setHasPoa(e.target.checked)}
                className="rounded text-purple-600 focus:ring-0 w-4 h-4"
              />
            </div>

            {hasPoa && (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">رقم الوكالة</label>
                  <input
                    type="text"
                    value={poaNumber}
                    onChange={(e) => setPoaNumber(e.target.value)}
                    placeholder="44XXXXXXX"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={poaExpiry}
                    onChange={(e) => setPoaExpiry(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">جهة التوثيق</label>
                  <input
                    type="text"
                    value={poaIssuer}
                    onChange={(e) => setPoaIssuer(e.target.value)}
                    placeholder="كتابة العدل..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">ملاحظات العميل والتوصيات</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات خاصة بالتواصل أو اتفاقيات سابقة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white resize-none transition"
            />
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
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-md shadow-purple-700/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'حفظ التعديلات' : 'تسجيل الموكل'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
