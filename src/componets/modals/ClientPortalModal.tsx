import React, { useState } from 'react';
import {
  X,
  Share2,
  Send,
  Copy,
  Check,
  Scale,
  Briefcase,
  Calendar,
  ShieldCheck,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { Client, LegalCase, Session, FinancialRecord } from '../../types';
import {
  formatCurrency,
  formatDateArabic,
  getDaysRemaining,
  formatDaysRemainingLabel
} from '../../utils/formatters';

interface ClientPortalModalProps {
  client: Client | null;
  cases: LegalCase[];
  sessions: Session[];
  finance: FinancialRecord[];
  onClose: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
  client,
  cases,
  sessions,
  finance,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!client) return null;

  const clientCases = cases.filter((c) => c.clientId === client.id);
  const clientSessions = sessions.filter((s) => s.clientId === client.id && s.status === 'scheduled');
  const clientReceipts = finance.filter((f) => f.clientId === client.id && f.type === 'receipt_voucher');

  const totalPaid = clientReceipts.reduce((sum, r) => sum + r.totalWithTax, 0);

  const poa = client.poas[0];
  const daysPoa = poa ? getDaysRemaining(poa.expiryDate) : null;
  const poaStatus = daysPoa !== null ? formatDaysRemainingLabel(daysPoa) : null;

  const portalUrl = `https://seastar-law.portal/client/${client.portalToken}`;

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = `عزيزي الموكل: ${client.fullName}
مرحباً بك في بوابتك الإلكترونية الخاصة بمكتب سيتار للمحاماة والاستشارات القانونية.

يمكنك متابعة مواعيد جلساتك وتحديثات قضاياك والوكالات القضائية مباشرة عبر الرابط التالي:
🔗 ${portalUrl}

ملخص سريع لحسابكم:
⚖️ عدد القضايا النشطة: ${clientCases.length}
📅 الجلسة القادمة: ${clientSessions[0] ? `${clientSessions[0].date} (${clientSessions[0].time}) - ${clientSessions[0].court}` : 'لا توجد جلسات قادمة محددة'}

نحن بخدمتكم دائماً.
مكتب سيتار للمحاماة`;

    const phone = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-700" />
            <span className="font-bold text-xs text-slate-900">
              معاينة بوابة الموكل الإلكترونية (Client Portal)
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share actions header */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-blue-900 font-bold truncate">رابط الموكل:</span>
            <span className="font-mono text-[10px] text-slate-600 truncate">{portalUrl}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={copyPortalLink}
              className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs flex items-center gap-1 font-bold shadow-2xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>مشاركة واتساب</span>
            </button>
          </div>
        </div>

        {/* Portal Screen */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/50 text-xs">
          {/* Client Welcome Hero */}
          <div className="bg-gradient-to-l from-blue-700 via-blue-800 to-indigo-900 text-white p-5 rounded-3xl text-center relative overflow-hidden shadow-sm">
            <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 text-white mx-auto flex items-center justify-center mb-2 shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base">{client.fullName}</h3>
            <p className="text-xs text-blue-200 mt-0.5 font-medium">
              بوابة الموكل - مكتب سيتار للمحاماة والاستشارات القانونية
            </p>
            <p className="text-[10px] text-blue-300 mt-1 font-mono">
              رقم ملف الموكل: #{client.id.toUpperCase()} • {client.companyName || 'حساب فردي'}
            </p>
          </div>

          {/* Power of Attorney Status */}
          {poa && poaStatus && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900 block">حالة الوكالة القضائية</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    رقم الوكالة: {poa.poaNumber}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${poaStatus.badge}`}>
                {poaStatus.text}
              </span>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>مواعيد الجلسات القادمة</span>
              </h4>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-700">
                {clientSessions.length} جلسات
              </span>
            </div>

            {clientSessions.length === 0 ? (
              <p className="text-slate-400 py-3 text-center text-xs">
                لا توجد جلسات قضائية مجدولة حالياً
              </p>
            ) : (
              <div className="space-y-2">
                {clientSessions.map((s) => (
                  <div key={s.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-800 font-mono">
                        {s.date} ({s.time})
                      </span>
                      <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        {s.sessionType}
                      </span>
                    </div>
                    <p className="text-slate-900 font-bold mt-1">{s.court} - {s.hall}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">قضية #{s.caseNumber}</p>
                    {s.requirements && (
                      <p className="text-[10px] text-slate-600 mt-1.5 bg-white p-2 rounded-xl border border-slate-200">
                        المطلوب: {s.requirements}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Cases */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-700" />
                <span>موقف القضايا والنزاعات</span>
              </h4>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-700">
                {clientCases.length} قضايا
              </span>
            </div>

            <div className="space-y-2">
              {clientCases.map((c) => (
                <div key={c.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-800">#{c.caseNumber}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      المرحلة: {c.litigationStage}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900">{c.caseType}</h5>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{c.court}</span>
                    <span className="text-emerald-700 font-bold">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-900 block">إجمالي المدفوعات المسددة</span>
                <span className="text-[10px] text-slate-500">سندات القبض المعتمدة</span>
              </div>
            </div>
            <span className="font-mono font-black text-emerald-700 text-sm">
              {formatCurrency(totalPaid)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
