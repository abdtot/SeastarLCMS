import React from 'react';
import {
  X,
  Printer,
  Share2,
  Scale,
  QrCode,
  CheckCircle,
  FileCheck,
  Send
} from 'lucide-react';
import { FinancialRecord, OfficeProfile } from '../../types';
import { formatCurrency, formatDateArabic, numberToArabicWords } from '../../utils/formatters';

interface OfficialVoucherModalProps {
  voucher: FinancialRecord | null;
  office: OfficeProfile;
  onClose: () => void;
}

export const OfficialVoucherModal: React.FC<OfficialVoucherModalProps> = ({
  voucher,
  office,
  onClose,
}) => {
  if (!voucher) return null;

  const isReceipt = voucher.type === 'receipt_voucher';
  const isPayment = voucher.type === 'payment_voucher';
  const isInvoice = voucher.type === 'invoice';

  const voucherTitle = isReceipt
    ? 'سند قبض مالي معتمد'
    : isPayment
    ? 'سند صرف مصروفات قضائية'
    : 'فاتورة ضريبية - أتعاب مهنية';

  const printDocument = () => {
    window.print();
  };

  const shareViaWhatsApp = () => {
    const text = `📄 ${voucherTitle}
رقم السند: ${voucher.voucherNumber}
المكتب: ${office.name}
التاريخ: ${voucher.date}
${isReceipt ? `استلمنا من المكرم: ${voucher.recipientOrPayerName}` : `صرف للمكرم: ${voucher.recipientOrPayerName}`}
المبلغ الإجمالي شامل الضريبة: ${formatCurrency(voucher.totalWithTax)} (${numberToArabicWords(voucher.totalWithTax)})
البيان: ${voucher.description}
طريقة الدفع: ${voucher.paymentMethod}
${voucher.caseNumber ? `مرتبط بالقضية رقم: #${voucher.caseNumber}` : ''}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white text-slate-900 border border-slate-300 w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right print:m-0 print:border-none print:shadow-none print:max-h-full">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400">
            معاينة الوثيقة الرسمية القابلة للطباعة والتحميل
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
            <button
              onClick={printDocument}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Voucher Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-['Cairo',sans-serif]">
          {/* Header of Firm */}
          <div className="border-b-2 border-amber-500 pb-3 flex items-start justify-between">
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight">
                {office.name}
              </h2>
              <p className="text-[11px] font-bold text-amber-700">{office.title}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{office.licenseNumber}</p>
              <p className="text-[10px] text-slate-600 font-mono">الرقم الضريبي: {office.taxNumber}</p>
            </div>

            <div className="text-left flex flex-col items-end">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 mb-1">
                <Scale className="w-7 h-7" />
              </div>
              <span className="text-[9px] text-slate-500">SeaStar Legal System</span>
            </div>
          </div>

          {/* Title & Voucher Number banner */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">{voucherTitle}</h3>
              <p className="text-[10px] text-slate-500">
                التاريخ: {formatDateArabic(voucher.date)} ({voucher.date})
              </p>
            </div>
            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-500 block">رقم السند المرجعي</span>
              <span className="text-sm font-bold text-amber-700">{voucher.voucherNumber}</span>
            </div>
          </div>

          {/* Financial Details Box */}
          <div className="border border-slate-300 rounded-xl p-3.5 space-y-2.5 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block">
                  {isReceipt ? 'استلمنا من المكرم / السادة:' : 'صرف إلى المكرم / السادة:'}
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {voucher.recipientOrPayerName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">طريقة التحصيل / الدفع:</span>
                <span className="font-bold text-slate-900">{voucher.paymentMethod}</span>
              </div>
            </div>

            {voucher.caseNumber && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 block">القضية المرتبطة:</span>
                <span className="font-bold text-slate-800">
                  قضية رقم #{voucher.caseNumber} - {voucher.clientName}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-500 block">البيان والغرض:</span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {voucher.description}
              </p>
            </div>
          </div>

          {/* Amount Breakdown Table */}
          <table className="w-full text-right border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-200 font-bold text-slate-800">
                <th className="p-2 border border-slate-300">البند والتصنيف</th>
                <th className="p-2 border border-slate-300">المبلغ الأساسي</th>
                <th className="p-2 border border-slate-300">الضريبة المضافة</th>
                <th className="p-2 border border-slate-300">الإجمالي النهائي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 font-semibold">{voucher.category}</td>
                <td className="p-2 border border-slate-300 font-mono">{formatCurrency(voucher.amount)}</td>
                <td className="p-2 border border-slate-300 font-mono">{formatCurrency(voucher.taxAmount)}</td>
                <td className="p-2 border border-slate-300 font-mono font-bold text-amber-800">
                  {formatCurrency(voucher.totalWithTax)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in written words */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <span className="font-bold text-amber-900">المبلغ كتابة: </span>
            <span className="text-slate-800 font-semibold">
              {numberToArabicWords(voucher.totalWithTax)}
            </span>
          </div>

          {/* Signatures & QR Code Simulation */}
          <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-3 items-end text-center">
            <div>
              <p className="text-[10px] text-slate-500 mb-6 font-bold">توقيع المستلم / الدافع</p>
              <div className="border-b border-dotted border-slate-400 w-24 mx-auto" />
            </div>

            <div className="flex flex-col items-center">
              {/* QR Code representation */}
              <div className="w-16 h-16 bg-slate-900 p-1 rounded-lg text-white flex items-center justify-center">
                <div className="w-full h-full border border-amber-400 rounded flex items-center justify-center font-mono text-[8px] text-center">
                  SEASTAR<br />QR
                </div>
              </div>
              <span className="text-[8px] text-slate-500 mt-1">رمز التحقق الإلكتروني</span>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 mb-6 font-bold">ختم وتوقيع الإدارة المالية</p>
              <div className="border-b border-dotted border-slate-400 w-24 mx-auto" />
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[9px] text-slate-400 pt-3 border-t border-slate-200">
            {office.address} • هاتف: {office.phone} • {office.email}
          </div>
        </div>
      </div>
    </div>
  );
};
