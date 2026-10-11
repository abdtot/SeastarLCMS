import React, { useState } from 'react';
import {
  X,
  Search,
  Briefcase,
  Users,
  Calendar,
  FileText,
  CreditCard,
  ChevronLeft
} from 'lucide-react';
import { LegalCase, Client, Session, LegalDocument } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: LegalCase[];
  clients: Client[];
  sessions: Session[];
  documents: LegalDocument[];
  onSelectCase: (c: LegalCase) => void;
  onSelectClient: (c: Client) => void;
  onSelectSession: (s: Session) => void;
  onSelectDocument: (d: LegalDocument) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  cases,
  clients,
  sessions,
  documents,
  onSelectCase,
  onSelectClient,
  onSelectSession,
  onSelectDocument,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const matchedCases = q
    ? cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.caseType.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.opponentName.toLowerCase().includes(q)
      )
    : [];

  const matchedClients = q
    ? clients.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.nationalId.includes(q) ||
          c.phone.includes(q)
      )
    : [];

  const matchedSessions = q
    ? sessions.filter(
        (s) =>
          s.caseNumber.toLowerCase().includes(q) ||
          s.caseTitle.toLowerCase().includes(q) ||
          s.clientName.toLowerCase().includes(q) ||
          s.court.toLowerCase().includes(q)
      )
    : [];

  const matchedDocs = q
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q) ||
          (d.caseNumber && d.caseNumber.includes(q))
      )
    : [];

  const hasResults =
    matchedCases.length > 0 ||
    matchedClients.length > 0 ||
    matchedSessions.length > 0 ||
    matchedDocs.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center p-3 pt-12 animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5">
          <Search className="w-5 h-5 text-blue-700 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في جميع القضايا، الموكلين، الجلسات، أو المستندات..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {!query && (
            <p className="text-center text-slate-400 py-8 font-medium">
              اكتب رقم قضية، اسم موكل، محكمة، أو كلمة مفتاحية للبحث السريع...
            </p>
          )}

          {query && !hasResults && (
            <p className="text-center text-slate-400 py-8 font-medium">
              لا توجد نتائج مطابقة لـ "{query}"
            </p>
          )}

          {/* Cases */}
          {matchedCases.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">
                القضايا ({matchedCases.length})
              </span>
              {matchedCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectCase(c);
                    onClose();
                  }}
                  className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        قضية #{c.caseNumber} - {c.caseType}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {c.clientName} ضد {c.opponentName} • {c.court}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Clients */}
          {matchedClients.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">
                الموكلين والعملاء ({matchedClients.length})
              </span>
              {matchedClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    onSelectClient(client);
                    onClose();
                  }}
                  className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-purple-700 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{client.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        هوية: {client.nationalId} • هاتف: {client.phone}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Sessions */}
          {matchedSessions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                الجلسات القضائية ({matchedSessions.length})
              </span>
              {matchedSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s);
                    onClose();
                  }}
                  className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{s.caseTitle}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {s.date} ({s.time}) • {s.court}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {matchedDocs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">
                المستندات والأرشفة ({matchedDocs.length})
              </span>
              {matchedDocs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    onSelectDocument(d);
                    onClose();
                  }}
                  className="bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{d.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {d.type} • {d.fileSize}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
