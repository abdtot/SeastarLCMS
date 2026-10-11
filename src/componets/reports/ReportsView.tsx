import React from 'react';
import {
  BarChart3,
  Download,
  Upload,
  RotateCcw,
  Scale,
  Award,
  ShieldCheck,
  Printer
} from 'lucide-react';
import {
  LegalCase,
  Session,
  Client,
  FinancialRecord,
  LegalTask,
  OfficeProfile
} from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { LAWYERS, StorageService } from '../../services/storage';

interface ReportsViewProps {
  cases: LegalCase[];
  sessions: Session[];
  clients: Client[];
  finance: FinancialRecord[];
  tasks: LegalTask[];
  office: OfficeProfile;
  onRefreshData: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  cases,
  sessions,
  finance,
  tasks,
  onRefreshData,
}) => {
  const activeCases = cases.filter((c) => c.status === 'جارية');

  const courtDistribution: { [court: string]: number } = {};
  cases.forEach((c) => {
    courtDistribution[c.court] = (courtDistribution[c.court] || 0) + 1;
  });

  const lawyerStats = LAWYERS.map((lawyer) => {
    const assignedCases = cases.filter((c) => c.assignedLawyerId === lawyer.id);
    const assignedTasks = tasks.filter((t) => t.assignedToId === lawyer.id);
    const completedTasks = assignedTasks.filter((t) => t.status === 'completed' || t.progressPercentage === 100);

    return {
      lawyer,
      casesCount: assignedCases.length,
      tasksCount: assignedTasks.length,
      completedTasksCount: completedTasks.length,
      completionRate: assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 100,
    };
  });

  const totalRevenue = finance
    .filter((f) => f.type === 'receipt_voucher')
    .reduce((sum, f) => sum + f.totalWithTax, 0);

  const totalExpenses = finance
    .filter((f) => f.type === 'payment_voucher')
    .reduce((sum, f) => sum + f.totalWithTax, 0);

  const netIncome = totalRevenue - totalExpenses;

  const handleBackupExport = () => {
    StorageService.exportBackup();
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importBackup(content);
      if (success) {
        alert('تم استعادة النسخة الاحتياطية بنجاح!');
        onRefreshData();
      } else {
        alert('فشل استيراد النسخة، يرجى التأكد من صحة الملف.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    if (confirm('هل ترغب حقاً في إعادة ضبط البيانات إلى بيانات العرض التوضيحي الأصلية؟')) {
      StorageService.resetToDefault();
      onRefreshData();
      alert('تم إعادة ضبط النظام بنجاح!');
    }
  };

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 pt-3 font-['Cairo',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            <span>التقارير والمؤشرات التحليلية</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            مؤشرات أداء المكتب، نسب الإنجاز، والتقرير المالي
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-2xl text-xs font-bold border border-slate-200 shadow-2xs transition"
        >
          <Printer className="w-4 h-4 text-blue-700" />
          <span>طباعة التقرير</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block mb-1">إجمالي القضايا</span>
          <span className="text-xl font-black font-mono text-slate-900 block">{cases.length}</span>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
            {activeCases.length} نشطة ومباشرة
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block mb-1">جلسات مجدولة</span>
          <span className="text-xl font-black font-mono text-slate-900 block">
            {sessions.filter((s) => s.status === 'scheduled').length}
          </span>
          <span className="text-[10px] text-amber-700 font-bold mt-1 block">
            من إجمالي {sessions.length} جلسة
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block mb-1">صافي الأرباح</span>
          <span className="text-sm font-black font-mono text-emerald-700 block truncate">
            {formatCurrency(netIncome)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block font-medium">أتعاب مطروحة المصاريف</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block mb-1">نسبة إنجاز المهام</span>
          <span className="text-xl font-black font-mono text-slate-900 block">
            {tasks.length > 0
              ? Math.round(
                  (tasks.filter((t) => t.status === 'completed' || t.progressPercentage === 100).length /
                    tasks.length) *
                    100
                )
              : 100}
            %
          </span>
          <span className="text-[10px] text-purple-700 font-bold mt-1 block">
            {tasks.filter((t) => t.status === 'completed').length} من {tasks.length} مهمة
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-blue-700" />
          <span>توزيع القضايا حسب المحاكم المختصة</span>
        </h3>

        <div className="space-y-3">
          {Object.entries(courtDistribution).map(([court, count]) => {
            const percentage = Math.round((count / cases.length) * 100);
            return (
              <div key={court} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-medium">{court}</span>
                  <span className="font-mono text-blue-800 font-bold">
                    {count} قضية ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-blue-700" />
          <span>مؤشرات أداء فريق المحامين والمستشارين</span>
        </h3>

        <div className="space-y-2.5">
          {lawyerStats.map((stat) => (
            <div
              key={stat.lawyer.id}
              className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full ${stat.lawyer.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}
                >
                  {stat.lawyer.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{stat.lawyer.name}</p>
                  <p className="text-[10px] text-slate-500 truncate font-medium">{stat.lawyer.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left font-mono shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">القضايا</span>
                  <span className="font-bold text-blue-800">{stat.casesCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">المهام المنجزة</span>
                  <span className="font-bold text-emerald-700">
                    {stat.completedTasksCount}/{stat.tasksCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>إدارة النسخ الاحتياطية وأمان البيانات</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          جميع بيانات القضايا والجلسات والموكلين وسندات المالية محفوظة محلياً. يمكنك تصدير نسخة احتياطية مشفرة بضغطة زر أو استعادتها في أي وقت.
        </p>

        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            onClick={handleBackupExport}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition shadow-2xs">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>استيراد نسخة احتياطية</span>
            <input
              type="file"
              accept=".json"
              onChange={handleBackupImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetDemoData}
            className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>إعادة ضبط البيانات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
