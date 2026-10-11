import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Calendar,
  Trash2,
  Eye,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { FinancialRecord, FinancialRecordType, OfficeProfile } from '../../types';
import { formatCurrency, formatDateArabic } from '../../utils/formatters';

interface FinanceViewProps {
  finance: FinancialRecord[];
  office: OfficeProfile;
  onOpenAddVoucher: () => void;
  onViewVoucher: (voucher: FinancialRecord) => void;
  onDeleteVoucher: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  finance,
  office,
  onOpenAddVoucher,
  onViewVoucher,
  onDeleteVoucher,
}) => {
  const [selectedType, setSelectedType] = useState<FinancialRecordType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalReceipts = finance
    .filter((f) => f.type === 'receipt_voucher')
    .reduce((sum, f) => sum + f.totalWithTax, 0);

  const totalPayments = finance
    .filter((f) => f.type === 'payment_voucher')
    .reduce((sum, f) => sum + f.totalWithTax, 0);

  const netBalance = totalReceipts - totalPayments;

  const filteredRecords = finance.filter((rec) => {
    const matchesType = selectedType === 'ALL' || rec.type === selectedType;
    const matchesSearch =
      rec.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.caseNumber && rec.caseNumber.includes(searchQuery));

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 pt-3 font-['Cairo',sans-serif]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span>الحسابات والفواتير والمالية</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            أتعاب المحاماة، المصروفات القضائية، وسندات القبض والصرف
          </p>
        </div>

        <button
          onClick={onOpenAddVoucher}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md shadow-amber-600/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إصدار سند / فاتورة</span>
        </button>
      </div>

      {/* Financial Summary KPI Cards - Light Theme */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Receipts */}
        <div className="bg-white border border-emerald-200 p-3.5 rounded-3xl shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-1 font-bold">
            <span className="text-[11px]">المقبوضات</span>
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-black text-slate-900 font-mono block truncate">
            {formatCurrency(totalReceipts)}
          </span>
          <span className="text-[9px] text-slate-500 font-medium">أتعاب محصلة</span>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-rose-200 p-3.5 rounded-3xl shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 text-xs mb-1 font-bold">
            <span className="text-[11px]">المصروفات</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-black text-slate-900 font-mono block truncate">
            {formatCurrency(totalPayments)}
          </span>
          <span className="text-[9px] text-slate-500 font-medium">رسوم ومصاريف</span>
        </div>

        {/* Net Income */}
        <div className="bg-white border border-amber-200 p-3.5 rounded-3xl shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs mb-1 font-bold">
            <span className="text-[11px]">صافي الأرباح</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-black text-amber-800 font-mono block truncate">
            {formatCurrency(netBalance)}
          </span>
          <span className="text-[9px] text-slate-500 font-medium">الدخل الفعلي</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            selectedType === 'ALL'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          جميع السندات ({finance.length})
        </button>
        <button
          onClick={() => setSelectedType('receipt_voucher')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            selectedType === 'receipt_voucher'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          سندات القبض
        </button>
        <button
          onClick={() => setSelectedType('payment_voucher')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            selectedType === 'payment_voucher'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          سندات الصرف
        </button>
        <button
          onClick={() => setSelectedType('invoice')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            selectedType === 'invoice'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          الفواتير
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم السند، اسم الموكل، أو البيان..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 pr-10 shadow-xs transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
      </div>

      {/* Vouchers List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs shadow-xs">
          لا توجد سجلات مالية مطابقة للمعايير المحددة
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredRecords.map((rec) => {
            const isReceipt = rec.type === 'receipt_voucher';
            const isPayment = rec.type === 'payment_voucher';

            return (
              <div
                key={rec.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-4 transition shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isReceipt
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isPayment
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {isReceipt ? 'سند قبض' : isPayment ? 'سند صرف' : 'فاتورة ضريبية'}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-800">
                        {rec.voucherNumber}
                      </span>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {rec.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-1.5 truncate">
                      {rec.clientName}
                    </h4>

                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">
                      {rec.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                      <span>طريقة الدفع: <strong className="text-slate-800">{rec.paymentMethod}</strong></span>
                      <span>التصنيف: <strong className="text-blue-800">{rec.category}</strong></span>
                    </div>
                  </div>

                  {/* Amount Badge */}
                  <div className="text-left font-mono shrink-0">
                    <span
                      className={`text-base font-black block ${
                        isReceipt ? 'text-emerald-700' : isPayment ? 'text-rose-700' : 'text-blue-700'
                      }`}
                    >
                      {isReceipt ? '+' : isPayment ? '-' : ''}
                      {formatCurrency(rec.totalWithTax)}
                    </span>
                    {rec.taxAmount > 0 && (
                      <span className="text-[9px] text-slate-400 block font-medium">
                        شامل ضريبة {formatCurrency(rec.taxAmount)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {rec.caseNumber ? `مرتبط بقضية #${rec.caseNumber}` : 'معاملة عامة'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewVoucher(rec)}
                      className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-bold transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-700" />
                      <span>عرض السند والطباعة</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا السند المالي؟')) {
                          onDeleteVoucher(rec.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="حذف السند"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
