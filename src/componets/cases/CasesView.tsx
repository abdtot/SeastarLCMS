import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Gavel,
  Scale,
  Calendar,
  User,
  Users,
  Send,
  Eye,
  CheckCircle,
  Clock,
  ChevronLeft,
  X,
  Edit2,
  Trash2,
  FileText
} from 'lucide-react';
import { LegalCase, LitigationStage, CaseStatus, Session, Client } from '../../types';
import { formatCurrency, formatDateArabic } from '../../utils/formatters';

interface CasesViewProps {
  cases: LegalCase[];
  sessions: Session[];
  clients: Client[];
  onOpenAddCase: () => void;
  onEditCase: (c: LegalCase) => void;
  onDeleteCase: (id: string) => void;
  onSelectCase: (c: LegalCase) => void;
  onOpenNewSessionForCase: (caseId: string) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  sessions,
  clients,
  onOpenAddCase,
  onEditCase,
  onDeleteCase,
  onSelectCase,
  onOpenNewSessionForCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<LitigationStage | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'ALL'>('ALL');

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.opponentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = selectedStage === 'ALL' || c.litigationStage === selectedStage;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

    return matchesSearch && matchesStage && matchesStatus;
  });

  const stages: LitigationStage[] = ['ابتدائي', 'استئناف', 'عليا / تمييز', 'تنفيذ'];

  const getStageBadgeColor = (stage: LitigationStage) => {
    switch (stage) {
      case 'ابتدائي':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'استئناف':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'عليا / تمييز':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'تنفيذ':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getStatusBadgeColor = (status: CaseStatus) => {
    switch (status) {
      case 'جارية':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'معلقة':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'محكومة':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'منتهية':
        return 'bg-slate-200 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 pt-3 font-['Cairo',sans-serif]">
      {/* Top Header & New Case Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-700" />
            <span>إدارة القضايا والتقاضي</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {filteredCases.length} قضية مسجلة بالنظام
          </p>
        </div>

        <button
          onClick={onOpenAddCase}
          className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md shadow-blue-700/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>قضية جديدة</span>
        </button>
      </div>

      {/* Search Input - Light Material 3 Style */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم القضية، الموكل، الخصم، أو المحكمة..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 pr-10 shadow-xs transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters: Stages & Statuses pills */}
      <div className="space-y-2">
        {/* Stage Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedStage('ALL')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition text-xs font-bold ${
              selectedStage === 'ALL'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            جميع المراحل
          </button>
          {stages.map((stg) => (
            <button
              key={stg}
              onClick={() => setSelectedStage(stg)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition text-xs font-bold ${
                selectedStage === stg
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-400">الحالة:</span>
            {(['ALL', 'جارية', 'معلقة', 'محكومة', 'منتهية'] as const).map((stat) => (
              <button
                key={stat}
                onClick={() => setSelectedStatus(stat)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
                  selectedStatus === stat
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {stat === 'ALL' ? 'الكل' : stat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case List Cards */}
      {filteredCases.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2 shadow-xs">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">لا توجد قضايا مطابقة للبحث</p>
          <p className="text-xs text-slate-400">جرب تغيير كلمات البحث أو الفلاتر المحددة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => {
            const caseSessions = sessions.filter((s) => s.caseId === c.id);
            const nextSession = caseSessions.find(
              (s) => s.status === 'scheduled' && s.date >= new Date().toISOString().split('T')[0]
            );

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className="bg-white hover:bg-slate-50/80 border border-slate-200 rounded-3xl p-4 transition shadow-xs cursor-pointer group"
              >
                {/* Header: Case #, Court & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        قضية #{c.caseNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStageBadgeColor(
                          c.litigationStage
                        )}`}
                      >
                        {c.litigationStage}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1 group-hover:text-blue-700 transition">
                      {c.caseType}
                    </h3>
                  </div>

                  <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition" />
                </div>

                {/* Court & Circuit */}
                <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Gavel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.court}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 truncate">{c.circuit}</span>
                </div>

                {/* Parties: Client vs Opponent */}
                <div className="mt-3 bg-slate-50 rounded-2xl p-3 border border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      الموكل ({c.clientRole}):
                    </span>
                    <span className="font-bold text-emerald-700 truncate block mt-0.5">
                      {c.clientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">الخصم:</span>
                    <span className="font-bold text-rose-700 truncate block mt-0.5">
                      {c.opponentName}
                    </span>
                  </div>
                </div>

                {/* Litigation Stage Progress Indicator */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
                    <span>مراحل التقاضي</span>
                    <span className="text-blue-800 font-bold">
                      المرحلة الحالية: {c.litigationStage}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {stages.map((stg, i) => {
                      const stageIndex = stages.indexOf(c.litigationStage);
                      const isCompleted = i < stageIndex;
                      const isCurrent = i === stageIndex;

                      return (
                        <div key={stg} className="text-center">
                          <div
                            className={`h-1.5 rounded-full ${
                              isCurrent
                                ? 'bg-blue-600 shadow-xs'
                                : isCompleted
                                ? 'bg-emerald-500'
                                : 'bg-slate-200'
                            }`}
                          />
                          <span
                            className={`text-[9px] mt-1 block truncate font-bold ${
                              isCurrent
                                ? 'text-blue-800'
                                : isCompleted
                                ? 'text-slate-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {stg}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Hearing snippet */}
                {nextSession && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-2.5 flex items-center justify-between text-xs text-amber-900 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>
                        الجلسة القادمة: {nextSession.date} ({nextSession.time})
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      {nextSession.sessionType}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
