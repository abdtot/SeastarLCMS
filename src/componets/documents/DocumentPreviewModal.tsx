import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  Share2,
  ShieldCheck,
  Database,
  ExternalLink,
  Trash2,
  Loader2,
  Eye
} from 'lucide-react';
import { LegalDocument } from '../../types';
import { StorageService } from '../../services/storage';

interface DocumentPreviewModalProps {
  document: LegalDocument | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onDelete,
}) => {
  const [fullDoc, setFullDoc] = useState<LegalDocument | null>(document);
  const [isLoadingSqlite, setIsLoadingSqlite] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setFullDoc(document);
    setConfirmDelete(false);
    if (document?.id) {
      setIsLoadingSqlite(true);
      StorageService.fetchDocumentFromSqlite(document.id)
        .then((fetched) => {
          if (fetched) {
            setFullDoc(fetched);
          }
        })
        .finally(() => {
          setIsLoadingSqlite(false);
        });
    }
  }, [document]);

  if (!document || !fullDoc) return null;

  const downloadUrl = `/api/documents/${encodeURIComponent(fullDoc.id)}/download`;
  const inlineUrl = `/api/documents/${encodeURIComponent(fullDoc.id)}/inline`;
  const mime = fullDoc.mimeType || '';
  const isImage =
    mime.startsWith('image/') ||
    (fullDoc.fileDataUri && fullDoc.fileDataUri.startsWith('data:image/')) ||
    /\.(png|jpe?g|webp|gif)$/i.test(fullDoc.fileName);
  const isPdf =
    mime.includes('pdf') ||
    fullDoc.fileName.toLowerCase().endsWith('.pdf');
  const isWord =
    mime.includes('word') ||
    mime.includes('officedocument') ||
    fullDoc.fileName.toLowerCase().endsWith('.docx') ||
    fullDoc.fileName.toLowerCase().endsWith('.doc');
  const isHtmlOrText =
    mime.includes('html') ||
    mime.includes('text') ||
    fullDoc.fileName.toLowerCase().endsWith('.html') ||
    fullDoc.fileName.toLowerCase().endsWith('.txt');

  const handleRealDownload = () => {
    const a = window.document.createElement('a');
    a.href = downloadUrl;
    a.download = fullDoc.fileName || `${fullDoc.title}.pdf`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const shareViaWhatsApp = () => {
    const text = `📄 مستند قضائي معتمد من مكتب سيتار للمحاماة:
العنوان: ${fullDoc.title}
التصنيف: ${fullDoc.type}
الملف: ${fullDoc.fileName} (${fullDoc.fileSize})
${fullDoc.caseNumber ? `القضية: #${fullDoc.caseNumber}` : ''}
${fullDoc.clientName ? `الموكل: ${fullDoc.clientName}` : ''}`;

    const a = window.document.createElement('a');
    a.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in font-['Cairo',sans-serif]">
      <div className="bg-white border border-slate-200 w-full max-w-lg max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{fullDoc.title}</h3>
              <p className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>محفوظ فعلياً في قاعدة بيانات SQLite (BLOB)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={shareViaWhatsApp}
              className="p-2 text-emerald-300 hover:bg-white/10 rounded-xl transition"
              title="مشاركة التفاصيل عبر واتساب"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRealDownload}
              className="p-2 text-sky-300 hover:bg-white/10 rounded-xl transition"
              title="تحميل الملف الأصلي من SQLite"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* SQLite Storage Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-emerald-950 block truncate">{fullDoc.fileName}</span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  الحجم: {fullDoc.fileSize}
                  {fullDoc.fileSizeBytes ? ` (${fullDoc.fileSizeBytes.toLocaleString()} بايت)` : ''} • الصيغة:{' '}
                  {fullDoc.mimeType ? fullDoc.mimeType.split(';')[0] : 'وثيقة قانونية'}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-[10px] text-emerald-800 font-bold shrink-0">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{fullDoc.confidentiality}</span>
            </span>
          </div>

          {/* Live Embedded Document Viewer from SQLite */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <div className="px-3 py-2 bg-slate-800 text-slate-200 text-[10px] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>معاينة حية للملف المخزن في SQLite</span>
              </span>
              <a
                href={inlineUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 hover:underline flex items-center gap-1"
              >
                <span>فتح في تبويب مستقل</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {isLoadingSqlite ? (
              <div className="p-8 text-center text-slate-300 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                <span>جاري استرجاع الملف الثنائي (BLOB) من قاعدة بيانات SQLite...</span>
              </div>
            ) : isImage ? (
              <div className="p-3 bg-slate-950 flex flex-col items-center justify-center gap-2">
                <img
                  src={fullDoc.fileDataUri || inlineUrl}
                  alt={fullDoc.title}
                  className="max-h-72 rounded-xl object-contain shadow-lg"
                />
                <a
                  href={downloadUrl}
                  download={fullDoc.fileName}
                  className="text-[11px] text-sky-300 hover:underline flex items-center gap-1 mt-1 font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الصورة بدقتها الأصلية</span>
                </a>
              </div>
            ) : isWord ? (
              <div className="p-6 bg-slate-50 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-inner border border-blue-200">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{fullDoc.fileName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    مستند Microsoft Word أصلي محفوظ في قاعدة بيانات SQLite ({fullDoc.fileSize})
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleRealDownload}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition shadow-md shadow-blue-700/20 active:scale-95 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل وفتح مستند Word الأصلي</span>
                  </button>
                </div>
              </div>
            ) : isPdf || isHtmlOrText ? (
              <iframe
                src={inlineUrl}
                title={fullDoc.title}
                className="w-full h-72 bg-white border-0"
              />
            ) : (
              <div className="p-6 bg-slate-50 text-center space-y-3">
                <FileText className="w-10 h-10 text-indigo-600 mx-auto" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {fullDoc.fileName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ملف ثنائي أصلي محفوظ في قاعدة بيانات SQLite ({fullDoc.fileSize})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRealDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20 active:scale-95 text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل الملف الأصلي</span>
                </button>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-3 font-medium">
            <div>
              <span className="text-[10px] text-slate-400 block">تاريخ الإيداع والأرشفة:</span>
              <span className="font-bold text-slate-800 font-mono">{fullDoc.uploadDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">تصنيف الوثيقة:</span>
              <span className="font-bold text-indigo-700">{fullDoc.type}</span>
            </div>
            {fullDoc.caseNumber && (
              <div>
                <span className="text-[10px] text-slate-400 block">رقم القضية المرتبطة:</span>
                <span className="font-bold font-mono text-blue-800">#{fullDoc.caseNumber}</span>
              </div>
            )}
            {fullDoc.clientName && (
              <div>
                <span className="text-[10px] text-slate-400 block">الموكل المعني:</span>
                <span className="font-bold text-emerald-800">{fullDoc.clientName}</span>
              </div>
            )}
          </div>

          {fullDoc.tags && fullDoc.tags.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-medium block mb-1.5">الوسوم والتصنيفات:</span>
              <div className="flex flex-wrap gap-1.5">
                {fullDoc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fullDoc.notes && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-medium block mb-1">ملاحظات ومحتوى المذكرة:</span>
              <p className="text-slate-700 text-xs leading-relaxed font-medium whitespace-pre-wrap">
                {fullDoc.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-2 rounded-xl hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف من SQLite</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onDelete(fullDoc.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleRealDownload}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تحميل الوثيقة الأصلية (SQLite)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
