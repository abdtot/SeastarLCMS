import React, { useState } from 'react';
import {
  X,
  FileUp,
  Save,
  Database,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { LegalDocument, DocumentType, ConfidentialityLevel, LegalCase, Client } from '../../types';
import { StorageService } from '../../services/storage';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: LegalDocument) => void;
  cases: LegalCase[];
  clients: Client[];
  defaultCaseId?: string;
}

const DOC_TYPES: DocumentType[] = [
  'مذكرة دفاع',
  'لائحة دعوى',
  'عقد اتفاق',
  'صك حكم',
  'وكالة قضائية',
  'تقرير خبير',
  'مستند ثبوتي',
  'أخرى',
];

const CONF_LEVELS: ConfidentialityLevel[] = [
  'عام / سكرتارية',
  'محامي مساعد',
  'محامي رئيسي',
  'سري للغاية',
];

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cases,
  defaultCaseId,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('مذكرة دفاع');
  const [caseId, setCaseId] = useState(defaultCaseId || cases[0]?.id || '');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('محامي مساعد');

  React.useEffect(() => {
    if (defaultCaseId) {
      setCaseId(defaultCaseId);
    } else if (cases[0]?.id && !caseId) {
      setCaseId(cases[0].id);
    }
  }, [defaultCaseId, isOpen]);

  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [mimeType, setMimeType] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 35 * 1024 * 1024) {
        setErrorMsg('حجم الملف يتجاوز الحد الأقصى المسموح به (35 ميجابايت).');
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      setFileSizeBytes(file.size);
      setFileSize(formatBytes(file.size));
      setMimeType(file.type || 'application/octet-stream');

      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreviewUrl(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !fileName) {
      setErrorMsg('يرجى إدخال عنوان المستند أو اختيار ملف.');
      return;
    }

    const selectedCase = cases.find((c) => c.id === caseId);
    const tags = tagInput
      ? tagInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [type];

    const payload: Partial<LegalDocument> = {
      title: title.trim() || fileName.replace(/\.[^/.]+$/, ''),
      type,
      caseId: selectedCase?.id,
      caseNumber: selectedCase?.caseNumber,
      clientId: selectedCase?.clientId,
      clientName: selectedCase?.clientName,
      uploadDate: new Date().toISOString().split('T')[0],
      fileName: fileName || `${(title.trim() || 'وثيقة').replace(/\s+/g, '_')}.html`,
      fileSize: fileSize || '12 KB',
      fileSizeBytes: fileSizeBytes || undefined,
      mimeType: mimeType || 'application/octet-stream',
      confidentiality,
      tags,
      notes,
    };

    setIsSaving(true);
    setErrorMsg(null);

    try {
      // Direct binary upload to SQLite through server
      const savedDoc = await StorageService.uploadDocumentFile(payload, selectedFile);
      onSave(savedDoc);

      // Reset fields
      setTitle('');
      setSelectedFile(null);
      setFileName('');
      setFileSize('');
      setFileSizeBytes(0);
      setMimeType('');
      setImagePreviewUrl(null);
      setNotes('');
      setTagInput('');
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error('Document save error:', err);
      setErrorMsg(
        err?.message ||
          'تعذر رفع وحفظ المستند في قاعدة بيانات SQLite. يرجى التأكد من تشغيل الخادم والمحاولة مرة أخرى.'
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in font-['Cairo',sans-serif]">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        <div className="px-5 py-3.5 bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">أرشفة وحفظ مستند في قاعدة بيانات SQLite</h3>
              <p className="text-[10px] text-indigo-200 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>يتم تخزين الملف الثنائي (BLOB) فعلياً داخل ملف seastar.sqlite</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* File Picker Zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-4 text-center transition ${
              selectedFile
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/20'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.csv,.xlsx,.html"
              onChange={handleFileChange}
              disabled={isSaving}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer block space-y-1.5">
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-900 block text-xs">
                      تم اختيار الملف وجاهز للحفظ في SQLite
                    </span>
                    <span className="text-[11px] text-slate-700 font-mono font-bold block mt-0.5">
                      {fileName} ({fileSize})
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono">
                      النوع: {mimeType || selectedFile.type} • {fileSizeBytes.toLocaleString()} بايت
                    </span>
                  </div>
                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt="معاينة"
                      className="max-h-28 mx-auto rounded-xl border border-emerald-200 shadow-xs object-contain"
                    />
                  )}
                  <span className="inline-block text-[10px] text-indigo-700 underline font-bold">
                    انقر لاستبدال الملف بملف آخر
                  </span>
                </div>
              ) : (
                <>
                  <FileUp className="w-8 h-8 text-indigo-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-900 block text-xs">
                    انقر لاختيار ملف من جهازك (PDF، صور، Word، أو مستند نصي)
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    أو اتركه فارغاً ليقوم النظام بتوليد وثيقة رسمية من نص المذكرة أدناه وحفظها في SQLite
                  </span>
                </>
              )}
            </label>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              عنوان المستند والوصف <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSaving}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مذكرة دفاع جوابية في الدعوى التجارية..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">تصنيف المستند</label>
              <select
                value={type}
                disabled={isSaving}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition font-bold"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">مستوى السرية والصلاحيات</label>
              <select
                value={confidentiality}
                disabled={isSaving}
                onChange={(e) => setConfidentiality(e.target.value as ConfidentialityLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition font-bold"
              >
                {CONF_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">القضية المرتبطة</label>
            <select
              value={caseId}
              disabled={isSaving}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            >
              <option value="">-- بدون ارتباط بقضية معينة --</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  قضية #{c.caseNumber} - {c.clientName} ({c.court})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              الوسوم والكلمات المفتاحية (مفصولة بفاصلة)
            </label>
            <input
              type="text"
              disabled={isSaving}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="استئناف, تعويض, خبرة, مستند رسمي"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
              <span>ملاحظات / نص المذكرة أو الوثيقة</span>
              <span className="text-[10px] text-slate-400 font-normal">يُحفظ مع الوثيقة في قاعدة البيانات</span>
            </label>
            <textarea
              rows={3}
              disabled={isSaving}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملخص أو نص المذكرة القانونية أو بنود الوثيقة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-bold transition disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition shadow-md shadow-indigo-600/20 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ في SQLite...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ المستند في SQLite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
