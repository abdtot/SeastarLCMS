import React, { useState } from 'react';
import { X, Receipt, Save } from 'lucide-react';
import {
  FinancialRecord,
  FinancialRecordType,
  PaymentMethod,
  FinancialCategory,
  LegalCase,
  Client
} from '../../types';
import { StorageService } from '../../services/storage';
import { formatCurrency } from '../../utils/formatters';

interface AddVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<FinancialRecord>) => void;
  cases: LegalCase[];
  clients: Client[];
}

export const AddVoucherModal: React.FC<AddVoucherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cases,
  clients,
}) => {
  if (!isOpen) return null;

  const settings = StorageService.getSettings();
  const [type, setType] = useState<FinancialRecordType>('receipt_voucher');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [caseId, setCaseId] = useState(cases[0]?.id || '');
  const [amount, setAmount] = useState<number>(50000);
  const [applyTax, setApplyTax] = useState(settings.enableTaxByDefault);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('تحويل بنكي');
  const [category, setCategory] = useState<FinancialCategory>('أتعاب محاماة');
  const [description, setDescription] = useState('');
  const [recipientOrPayerName, setRecipientOrPayerName] = useState(clients[0]?.fullName || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleClientChange = (cId: string) => {
    setClientId(cId);
    const selected = clients.find((c) => c.id === cId);
    if (selected) {
      setRecipientOrPayerName(selected.fullName);
    }
  };

  const taxRate = settings.defaultTaxRate ?? 5;
  const taxAmount = applyTax ? Math.round(amount * (taxRate / 100)) : 0;
  const totalWithTax = Number(amount) + taxAmount;

  const prefix = type === 'receipt_voucher' ? 'RV' : type === 'payment_voucher' ? 'PV' : 'INV';
  const voucherNumber = `${prefix}-2026-${Math.floor(100 + Math.random() * 900)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      alert('يرجى تحديد المبلغ والبيان');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    const selectedCase = cases.find((c) => c.id === caseId);

    const payload: Partial<FinancialRecord> = {
      type,
      voucherNumber,
      caseId: selectedCase?.id,
      caseNumber: selectedCase?.caseNumber,
      clientId,
      clientName: selectedClient ? selectedClient.fullName : recipientOrPayerName,
      amount: Number(amount),
      taxAmount,
      totalWithTax,
      paymentMethod,
      date,
      description,
      category,
      paidStatus: 'paid',
      recipientOrPayerName: recipientOrPayerName || (selectedClient?.fullName ?? ''),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">إصدار سند مالي / فاتورة جديدة</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block text-slate-700 font-bold mb-1">نوع المعاملة المالية</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('receipt_voucher');
                  setCategory('أتعاب محاماة');
                }}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition ${
                  type === 'receipt_voucher'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                سند قبض (إيراد)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('payment_voucher');
                  setCategory('رسوم محاكم');
                }}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition ${
                  type === 'payment_voucher'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                سند صرف (مصروف)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('invoice');
                  setCategory('أتعاب محاماة');
                }}
                className={`py-2 px-1 text-center rounded-xl font-bold border transition ${
                  type === 'invoice'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                فاتورة أتعاب
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">الموكل المعني</label>
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white transition"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">القضية المرتبطة</label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white transition"
              >
                <option value="">-- بدون ارتباط بقضية --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.caseNumber} - {c.court}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              {type === 'receipt_voucher' ? 'استلمنا من المكرم:' : 'يصرف إلى المكرم:'}
            </label>
            <input
              type="text"
              required
              value={recipientOrPayerName}
              onChange={(e) => setRecipientOrPayerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white transition"
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  المبلغ الأساسي ({settings.currencySymbol}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">طريقة السداد</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-600"
                >
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="نقدي">نقدي</option>
                  <option value="شيك">شيك مصرفي</option>
                  <option value="مدى/بطاقة">مدى / بطاقة ائتمان</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0 w-4 h-4"
                />
                <span>تطبيق الضريبة ({taxRate}%)</span>
              </label>

              <div className="text-left font-mono">
                <span className="text-[10px] text-slate-500 block">الإجمالي النهائي:</span>
                <span className="font-black text-emerald-700 text-sm">{formatCurrency(totalWithTax)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">التصنيف المحاسبي</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FinancialCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white transition"
              >
                <option value="أتعاب محاماة">أتعاب محاماة</option>
                <option value="رسوم محاكم">رسوم محاكم وقيد</option>
                <option value="أتعاب خبراء">أتعاب خبراء معتمدين</option>
                <option value="بدل انتقال ومعاينة">بدل انتقال ومعاينة</option>
                <option value="مصروفات إدارية">مصروفات إدارية</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">تاريخ السند</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-amber-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              البيان والغرض من السند <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: دفعة من أتعاب المرافعة في الدعوى التجارية..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white resize-none transition"
            />
          </div>

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
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-md shadow-amber-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>إصدار السند فوراً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
