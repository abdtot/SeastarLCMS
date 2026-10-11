import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  Briefcase,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  ExternalLink,
  ChevronLeft,
  X,
  Edit2,
  Trash2,
  Share2
} from 'lucide-react';
import { Client, LegalCase, PowerOfAttorney } from '../../types';
import {
  getDaysRemaining,
  formatDaysRemainingLabel,
  generateWhatsAppPoaReminder
} from '../../utils/formatters';

interface ClientsViewProps {
  clients: Client[];
  cases: LegalCase[];
  onOpenAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onOpenClientPortal: (client: Client) => void;
  onSelectCase: (c: LegalCase) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  cases,
  onOpenAddClient,
  onEditClient,
  onDeleteClient,
  onOpenClientPortal,
  onSelectCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nationalId.includes(searchQuery) ||
      c.phone.includes(searchQuery) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 pt-3 font-['Cairo',sans-serif]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700" />
            <span>إدارة الموكلين والعملاء</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            قاعدة بيانات الموكلين، أرشيف الوكالات، وبوابة المشاركة
          </p>
        </div>

        <button
          onClick={onOpenAddClient}
          className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md shadow-purple-700/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>موكل جديد</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم، رقم الهوية/السجل التجاري، أو الجوال..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 pr-10 shadow-xs transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs shadow-xs">
          لا يوجد موكلين مسجلين بهذه البيانات
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const clientCases = cases.filter((c) => c.clientId === client.id);
            const activePoa = client.poas[0];
            const daysRemaining = activePoa ? getDaysRemaining(activePoa.expiryDate) : null;
            const poaStatus = daysRemaining !== null ? formatDaysRemainingLabel(daysRemaining) : null;

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="bg-white hover:bg-slate-50/80 border border-slate-200 rounded-3xl p-4 transition shadow-xs cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 border border-purple-200 text-purple-800 font-bold flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition shadow-2xs">
                      {client.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition">
                          {client.fullName}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                          {client.clientRole}
                        </span>
                      </div>
                      {client.companyName && (
                        <p className="text-xs text-blue-800 font-bold mt-0.5">
                          {client.companyName}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 font-medium">
                        هوية/سجل: {client.nationalId} • {client.phone}
                      </p>
                    </div>
                  </div>

                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transition" />
                </div>

                {/* Power of Attorney Status Alert Card */}
                {activePoa && poaStatus && (
                  <div
                    className={`mt-3 p-3 rounded-2xl border text-xs flex items-center justify-between ${
                      daysRemaining! <= 7
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-[11px]">
                          وكالة شرعية (#{activePoa.poaNumber})
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          تاريخ الانتهاء: {activePoa.expiryDate}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        daysRemaining! <= 7
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {poaStatus.text}
                    </span>
                  </div>
                )}

                {/* Cases Count & Quick Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                    <span>
                      {clientCases.length} قضايا مرتبطة
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenClientPortal(client)}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-bold transition"
                      title="بوابة الموكل الإلكترونية"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>بوابة الموكل</span>
                    </button>

                    <a
                      href={`tel:${client.phone}`}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition"
                      title="اتصال هاتف"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Details Drawer / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 w-full sm:max-w-xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
            {/* Android Drag Handle */}
            <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 sm:hidden" />

            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-100 border border-purple-200 text-purple-800 flex items-center justify-center font-bold">
                  {selectedClient.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedClient.fullName}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedClient.clientRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onEditClient(selectedClient);
                    setSelectedClient(null);
                  }}
                  className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl text-xs transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('هل أنت متأكد من حذف بيانات هذا الموكل؟')) {
                      onDeleteClient(selectedClient.id);
                      setSelectedClient(null);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl text-xs transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Details Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Contact info grid */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">رقم الهوية / السجل:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedClient.nationalId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">رقم الهاتف:</span>
                  <a href={`tel:${selectedClient.phone}`} className="font-mono text-emerald-700 font-bold dir-ltr block text-right">
                    {selectedClient.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">البريد الإلكتروني:</span>
                  <span className="text-slate-700 truncate block font-medium">{selectedClient.email || 'غير مسجل'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">العنوان الوطني:</span>
                  <span className="text-slate-700 truncate block font-medium">{selectedClient.address || 'غير محدد'}</span>
                </div>
              </div>

              {/* Power of Attorney Archive */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>أرشيف الوكالات القضائية الرسمية</span>
                  </h4>
                </div>

                {selectedClient.poas.length === 0 ? (
                  <p className="text-slate-400 text-xs">لا توجد وكالة شرعية مسجلة للموكل</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.poas.map((poa) => {
                      const days = getDaysRemaining(poa.expiryDate);
                      const statusInfo = formatDaysRemainingLabel(days);

                      return (
                        <div
                          key={poa.id}
                          className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-800">
                              وكالة رقم #{poa.poaNumber}
                            </span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                              {statusInfo.text}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2 font-medium">
                            <div>
                              <span className="text-slate-400 block text-[10px]">جهة الإصدار:</span>
                              <span>{poa.issuer}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">تاريخ الانتهاء:</span>
                              <span className="font-mono font-bold text-slate-800">{poa.expiryDate}</span>
                            </div>
                          </div>

                          {poa.notes && (
                            <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                              {poa.notes}
                            </p>
                          )}

                          {/* WhatsApp Reminder Button */}
                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <a
                              href={generateWhatsAppPoaReminder(
                                selectedClient.fullName,
                                poa.poaNumber,
                                poa.expiryDate,
                                selectedClient.phone
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>إرسال تنبيه تجديد الوكالة عبر واتساب</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Client Portal Link */}
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-slate-900 text-xs">بوابة الموكل الإلكترونية</span>
                  </div>
                  <button
                    onClick={() => {
                      onOpenClientPortal(selectedClient);
                      setSelectedClient(null);
                    }}
                    className="text-[11px] bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                  >
                    معاينة البوابة
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  يمكنك مشاركة رابط البوابة الخاصة بالموكل ليتمكن من متابعة مستجدات قضاياه ومواعيد جلساته بدون الاطلاع على ملاحظات المحامي الداخلية.
                </p>
              </div>

              {/* Associated Cases */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-xs text-slate-900 block">
                  القضايا المرتبطة بالموكل
                </span>
                {cases.filter((c) => c.clientId === selectedClient.id).length === 0 ? (
                  <p className="text-slate-400 text-xs">لا توجد قضايا مسجلة لهذا الموكل</p>
                ) : (
                  <div className="space-y-1.5">
                    {cases
                      .filter((c) => c.clientId === selectedClient.id)
                      .map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedClient(null);
                            onSelectCase(c);
                          }}
                          className="bg-white hover:bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
                        >
                          <div>
                            <span className="text-xs font-mono font-bold text-blue-800 ml-2">
                              #{c.caseNumber}
                            </span>
                            <span className="text-xs text-slate-900 font-bold">{c.caseType}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold">{c.litigationStage}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
