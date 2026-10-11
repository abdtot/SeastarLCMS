import React, { useState } from 'react';
import {
  FileText,
  Search,
  FileUp,
  Database,
  Download
} from 'lucide-react';
import { LegalDocument, DocumentType, ConfidentialityLevel } from '../../types';

interface DocumentsViewProps {
  documents: LegalDocument[];
  onOpenAddDocument: () => void;
  onPreviewDocument: (doc: LegalDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onOpenAddDocument,
  onPreviewDocument,
}) => {
  const [selectedType, setSelectedType] = useState<DocumentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const docTypes: DocumentType[] = [
    'مذكرة دفاع',
    'لائحة دعوى',
    'عقد اتفاق',
    'صك حكم',
    'وكالة قضائية',
    'تقرير خبير',
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesType = selectedType === 'ALL' || doc.type === selectedType;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.caseNumber && doc.caseNumber.includes(searchQuery)) ||
      (doc.clientName && doc.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const getConfidentialityBadge = (level: ConfidentialityLevel) => {
    switch (level) {
      case 'سري للغاية':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'محامي رئيسي':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'محامي مساعد':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 pt-3 font-['Cairo',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>المستندات والأرشفة الرقمية</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            أرشيف المذكرات، اللوائح، العقود، والأحكام القضائية
          </p>
        </div>

        <button
          onClick={onOpenAddDocument}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition"
        >
          <FileUp className="w-4 h-4 stroke-[3]" />
          <span>أرشفة مستند</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
            selectedType === 'ALL'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          جميع الوثائق ({documents.length})
        </button>
        {docTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
              selectedType === type
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالعنوان، رقم القضية، اسم الملف، أو الوسم..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 pr-10 shadow-xs transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
      </div>

      {filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs shadow-xs">
          لا توجد مستندات مسجلة بهذه المعايير
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onPreviewDocument(doc)}
              className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-3xl p-4 transition shadow-xs cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition truncate">
                      {doc.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                      <span className="font-bold text-indigo-700">{doc.type}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{doc.fileSize}</span>
                      <span>•</span>
                      <span className="text-[11px]">{doc.uploadDate}</span>
                    </div>

                    {doc.caseNumber && (
                      <p className="text-[11px] text-blue-700 mt-1 font-mono font-bold">
                        مرتبط بقضية #{doc.caseNumber} ({doc.clientName})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold ${getConfidentialityBadge(
                      doc.confidentiality
                    )}`}
                  >
                    {doc.confidentiality}
                  </span>

                  <div className="flex items-center gap-1.5">
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

                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Database className="w-2.5 h-2.5" />
                      <span>SQLite BLOB</span>
                    </span>

                    <a
                      href={`/api/documents/${encodeURIComponent(doc.id)}/download`}
                      download={doc.fileName || `${doc.title}.pdf`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                      title="تحميل الملف مباشرة من قاعدة بيانات SQLite"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {doc.tags.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-semibold shrink-0"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
