import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Gavel,
  Calendar,
  Users,
  User,
  Phone,
  FileText,
  CreditCard,
  Send,
  Plus,
  Edit2,
  Trash2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Database,
  Share2,
  FileUp
} from 'lucide-react';
import { LegalCase, Session, LegalDocument, FinancialRecord, LitigationStage, CaseStatus } from '../../types';
import { formatCurrency, formatDateArabic } from '../../utils/formatters';
import { DocumentPreviewModal } from '../documents/DocumentPreviewModal';

interface CaseDetailModalProps {
  legalCase: LegalCase | null;
  onClose: () => void;
  sessions: Session[];
  documents: LegalDocument[];
  finance: FinancialRecord[];
  onEditCase: (c: LegalCase) => void;
  onDeleteCase: (id: string) => void;
  onAddSessionForCase: (caseId: string) => void;
  onAddDocumentForCase?: (caseId: string) => void;
  onPreviewDocument?: (doc: LegalDocument) => void;
  onDeleteDocument?: (id: string) => void;
  onUpdateCaseStage: (caseId: string, stage: LitigationStage) => void;
  onUpdateCaseStatus: (caseId: string, status: CaseStatus) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  legalCase,
  onClose,
  sessions,
  documents,
  finance,
  onEditCase,
  onDeleteCase,
  onAddSessionForCase,
  onAddDocumentForCase,
  onPreviewDocument,
  onDeleteDocument,
  onUpdateCaseStage,
  onUpdateCaseStatus,
}) => {
  if (!legalCase) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'sessions' | 'documents' | 'finance'>('info');
  const [localPreviewDoc, setLocalPreviewDoc] = useState<LegalDocument | null>(null);

  const caseSessions = sessions.filter((s) => s.caseId === legalCase.id);
  const caseDocs = documents.filter((d) => d.caseId === legalCase.id);
  const caseFinance = finance.filter((f) => f.caseId === legalCase.id);

  const stages: LitigationStage[] = ['ابتدائي', 'استئناف', 'عليا / تمييز', 'تنفيذ'];
  const statuses: CaseStatus[] = ['جارية', 'معلقة', 'محكومة', 'منتهية'];

  const shareWhatsAppSummary = () => {
    const text = `⚖️ بطاقة القضية القانونية - مكتب سيتار للمحاماة
رقم القضية: ${legalCase.caseNumber}
المحكمة: ${legalCase.court} - ${legalCase.circuit}
القاضي: ${legalCase.judgeName}
الموضوع: ${legalCase.caseType}
درجة التقاضي: ${legalCase.litigationStage}
الحالة: ${legalCase.status}
الموكل: ${legalCase.clientName} (${legalCase.clientRole})
الخصم: ${legalCase.opponentName}
محامي الخصم: ${legalCase.opponentLawyer || 'غير مسجل'}
المحامي المسؤول: ${legalCase.assignedLawyerName}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareWhatsAppDoc = (doc: LegalDocument) => {
    const text = `📄 مستند قضائي - قضية #${legalCase.caseNumber}:
العنوان: ${doc.title}
التصنيف: ${doc.type}
الملف: ${doc.fileName} (${doc.fileSize})
المحكمة: ${legalCase.court}
الموكل: ${legalCase.clientName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white border-t sm:border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-right">
        {/* Android Drag Handle */}
        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-blue-800">
                  قضية #{legalCase.caseNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (قيد: {legalCase.generalRegistrationNumber})
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-800 truncate max-w-[220px]">
                {legalCase.court}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={shareWhatsAppSummary}
              className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs flex items-center gap-1 font-bold transition"
              title="مشاركة تفاصيل القضية عبر واتساب"
            >
              <Send className="w-4 h-4" />
              <span className="text-[11px] hidden xs:inline">مشاركة</span>
            </button>
            <button
              onClick={() => onEditCase(legalCase)}
              className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl transition"
              title="تعديل بيانات القضية"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
                  onDeleteCase(legalCase.id);
                  onClose();
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
              title="حذف القضية"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center border-b border-slate-100 bg-slate-50/70 px-4 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-blue-700 text-blue-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            بيانات الدعوى والأطراف
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'border-blue-700 text-blue-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>الجلسات</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.2 rounded-full font-mono">
              {caseSessions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-blue-700 text-blue-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>المستندات واللوائح</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.2 rounded-full font-mono">
              {caseDocs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`py-3 px-3 font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'finance'
                ? 'border-blue-700 text-blue-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>المالية والسندات</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.2 rounded-full font-mono">
              {caseFinance.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: General Info & Parties */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Subject */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-blue-700 font-bold block mb-1">
                  موضوع الدعوى
                </span>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">
                  {legalCase.caseType}
                </p>
                {legalCase.claimAmount && (
                  <p className="text-xs text-emerald-700 font-mono mt-1 font-bold">
                    قيمة المطالبة: {formatCurrency(legalCase.claimAmount)}
                  </p>
                )}
              </div>

              {/* Litigation Stage Switcher */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">مرحلة التقاضي الحالية</span>
                  <span className="text-[10px] text-slate-500">انقر لتحديث المرحلة</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {stages.map((stg) => {
                    const active = legalCase.litigationStage === stg;
                    return (
                      <button
                        key={stg}
                        onClick={() => onUpdateCaseStage(legalCase.id, stg)}
                        className={`py-2 px-1 text-[11px] rounded-xl font-bold transition border ${
                          active
                            ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {stg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Switcher */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">حالة القضية</span>
                  <span className="text-[10px] text-slate-500">انقر لتغيير الحالة</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {statuses.map((stat) => {
                    const active = legalCase.status === stat;
                    return (
                      <button
                        key={stat}
                        onClick={() => onUpdateCaseStatus(legalCase.id, stat)}
                        className={`py-2 px-1 text-[11px] rounded-xl font-bold transition border ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {stat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Court Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">المحكمة المختصة:</span>
                  <span className="font-bold text-slate-900">{legalCase.court}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">الدائرة القضائية:</span>
                  <span className="font-bold text-slate-900">{legalCase.circuit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">فضيلة القاضي:</span>
                  <span className="font-semibold text-slate-800">{legalCase.judgeName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">المحامي المكلف:</span>
                  <span className="font-bold text-blue-700">{legalCase.assignedLawyerName}</span>
                </div>
              </div>

              {/* Parties Section */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-700" />
                    <span>أطراف الدعوى والشهود والخبراء</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-200/80">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold ml-1.5">
                        الموكل ({legalCase.clientRole})
                      </span>
                      <span className="text-xs font-bold text-slate-900">{legalCase.clientName}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-200/80">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold ml-1.5">
                        الخصم
                      </span>
                      <span className="text-xs font-bold text-slate-900">{legalCase.opponentName}</span>
                    </div>
                  </div>

                  {legalCase.opponentLawyer && (
                    <div className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-200/80">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold ml-1.5">
                          محامي الخصم
                        </span>
                        <span className="text-xs text-slate-700">{legalCase.opponentLawyer}</span>
                      </div>
                    </div>
                  )}

                  {legalCase.parties
                    .filter((p) => p.role !== 'client' && p.role !== 'opponent')
                    .map((p) => (
                      <div
                        key={p.id}
                        className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-200/80 text-xs"
                      >
                        <div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold ml-1.5">
                            {p.role === 'expert' ? 'خبير معين' : p.role === 'witness' ? 'شاهد' : 'طرف آخر'}
                          </span>
                          <span className="text-slate-800 font-medium">{p.name}</span>
                          {p.note && <span className="text-[11px] text-slate-500 block">{p.note}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Description & Notes */}
              {legalCase.description && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">
                    ملاحظات وسجل القضية:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {legalCase.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  جلسات القضية (#{legalCase.caseNumber})
                </span>
                <button
                  onClick={() => onAddSessionForCase(legalCase.id)}
                  className="flex items-center gap-1 text-[11px] bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>جدولة جلسة</span>
                </button>
              </div>

              {caseSessions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد جلسات مسجلة لهذه القضية حتى الآن
                </div>
              ) : (
                <div className="space-y-2">
                  {caseSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-800">
                          {sess.date} ({sess.time})
                        </span>
                        <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          {sess.sessionType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {sess.hall}
                      </p>
                      {sess.requirements && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
                          {sess.requirements}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    مستندات ولوائح القضية (#{legalCase.caseNumber})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    مخزنة في قاعدة بيانات SQLite ({caseDocs.length} وثيقة)
                  </span>
                </div>
                {onAddDocumentForCase && (
                  <button
                    type="button"
                    onClick={() => onAddDocumentForCase(legalCase.id)}
                    className="flex items-center gap-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>أرشفة مستند</span>
                  </button>
                )}
              </div>

              {caseDocs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>لا توجد مستندات مرتبطة مباشرة برقم هذه القضية حتى الآن</p>
                  {onAddDocumentForCase && (
                    <button
                      type="button"
                      onClick={() => onAddDocumentForCase(legalCase.id)}
                      className="text-xs text-indigo-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة أول مستند لهذه القضية</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {caseDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        if (onPreviewDocument) {
                          onPreviewDocument(doc);
                        } else {
                          setLocalPreviewDoc(doc);
                        }
                      }}
                      className="bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-indigo-300 p-3.5 rounded-2xl transition shadow-2xs hover:shadow-xs cursor-pointer group space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-2xs">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition truncate">
                              {doc.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5 font-mono">
                              {doc.fileName} • {doc.fileSize}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[9px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                            {doc.confidentiality}
                          </span>
                          <div className="flex items-center gap-1">
                            {doc.fileName.toLowerCase().endsWith('.pdf') ? (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                                PDF
                              </span>
                            ) : doc.fileName.toLowerCase().endsWith('.docx') || doc.fileName.toLowerCase().endsWith('.doc') ? (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                                Word
                              </span>
                            ) : /\.(png|jpe?g|webp)$/i.test(doc.fileName) ? (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                                صورة
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-0.5 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Database className="w-2.5 h-2.5" />
                              <span>SQLite</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar for each document */}
                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-1.5 text-[11px]">
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                          {doc.type} • {doc.uploadDate}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              shareWhatsAppDoc(doc);
                            }}
                            className="p-1.5 rounded-xl bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition"
                            title="مشاركة تفاصيل المستند عبر واتساب"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={`/api/documents/${encodeURIComponent(doc.id)}/download`}
                            download={doc.fileName || `${doc.title}.pdf`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 hover:bg-slate-50 font-bold transition shadow-2xs"
                            title="تنزيل الملف الأصلي من قاعدة بيانات SQLite"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            <span>تنزيل</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onPreviewDocument) {
                                onPreviewDocument(doc);
                              } else {
                                setLocalPreviewDoc(doc);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-2xs"
                            title="معاينة الملف المرفق"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Finance */}
          {activeTab === 'finance' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                الحسابات والسندات المرتبطة بالقضية
              </span>

              {caseFinance.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد سندات مالية مسجلة لهذه القضية حتى الآن
                </div>
              ) : (
                <div className="space-y-2">
                  {caseFinance.map((fin) => (
                    <div
                      key={fin.id}
                      className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                              fin.type === 'receipt_voucher'
                                ? 'bg-emerald-100 text-emerald-800'
                                : fin.type === 'payment_voucher'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {fin.type === 'receipt_voucher'
                              ? 'سند قبض'
                              : fin.type === 'payment_voucher'
                              ? 'سند صرف'
                              : 'فاتورة'}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {fin.voucherNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">{fin.description}</p>
                      </div>

                      <div className="text-left font-mono font-bold text-xs text-emerald-700">
                        {formatCurrency(fin.totalWithTax)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Document Preview Modal for Case Documents */}
      {localPreviewDoc && (
        <DocumentPreviewModal
          document={localPreviewDoc}
          onClose={() => setLocalPreviewDoc(null)}
          onDelete={(id) => {
            onDeleteDocument?.(id);
            setLocalPreviewDoc(null);
          }}
        />
      )}
    </div>
  );
};
