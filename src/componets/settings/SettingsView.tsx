import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Building2,
  Users,
  Coins,
  BellRing,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Save,
  Plus,
  UserPlus,
  Clock,
  HardDrive,
  Terminal,
  Play,
  KeyRound,
  LogOut,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  FileCheck
} from 'lucide-react';
import {
  OfficeProfile,
  LawyerMember,
  AppSettings,
  LegalCase,
  Session,
  Client,
  FinancialRecord,
  LegalDocument,
  LegalTask,
  UserAccount,
  AppLicense
} from '../../types';
import { StorageService } from '../../services/storage';
import { NotificationEngine } from '../../services/notificationEngine';
import { formatDateArabic } from '../../utils/formatters';

interface SettingsViewProps {
  office: OfficeProfile;
  settings: AppSettings;
  lawyers: LawyerMember[];
  cases: LegalCase[];
  sessions: Session[];
  clients: Client[];
  finance: FinancialRecord[];
  documents: LegalDocument[];
  tasks: LegalTask[];
  currentUser?: UserAccount | null;
  license?: AppLicense;
  onUpdateOffice: (office: OfficeProfile) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateLawyers: (lawyers: LawyerMember[]) => void;
  onRefreshData: () => void;
  onTriggerTestExternalAlert?: () => void;
  onTriggerAllDueExternalAlerts?: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  office,
  settings,
  lawyers,
  cases,
  sessions,
  clients,
  finance,
  documents,
  tasks,
  currentUser,
  license,
  onUpdateOffice,
  onUpdateSettings,
  onUpdateLawyers,
  onRefreshData,
  onTriggerTestExternalAlert,
  onTriggerAllDueExternalAlerts,
  onLogout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'license' | 'backup' | 'currency' | 'office' | 'team'>('license');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLicenseCode, setCopiedLicenseCode] = useState(false);
  const [osPermStatus, setOsPermStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>(
    NotificationEngine.getPermissionStatus()
  );

  // Office form state
  const [officeForm, setOfficeForm] = useState<OfficeProfile>(office);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<AppSettings>(settings);

  // New Lawyer state
  const [newLawyerName, setNewLawyerName] = useState('');
  const [newLawyerRole, setNewLawyerRole] = useState('محامي ومستشار قانوني');
  const [newLawyerPhone, setNewLawyerPhone] = useState('+967 7');
  const [newLawyerEmail, setNewLawyerEmail] = useState('');
  const [newLawyerColor, setNewLawyerColor] = useState('bg-blue-600');

  // Confirmation states for destructive actions
  const [confirmResetDemo, setConfirmResetDemo] = useState(false);
  const [confirmClearEmpty, setConfirmClearEmpty] = useState(false);

  // SQLite Engine Stats & SQL Query Explorer state
  const [sqliteStats, setSqliteStats] = useState<any>(null);
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT case_number, court, client_name, claim_amount, status FROM cases');
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isRunningSql, setIsRunningSql] = useState(false);

  useEffect(() => {
    StorageService.fetchSqliteStats().then((st) => {
      if (st) setSqliteStats(st);
    });
  }, [cases.length, clients.length, finance.length, sessions.length]);

  const handleExecuteSql = async (customSql?: string) => {
    const targetSql = customSql || sqlQuery;
    if (customSql) setSqlQuery(customSql);
    setIsRunningSql(true);
    setSqlError(null);
    const res = await StorageService.runSqliteQuery(targetSql);
    setIsRunningSql(false);
    if (res.ok && res.rows) {
      setSqlResults(res.rows);
    } else {
      setSqlResults(null);
      setSqlError(res.error || 'خطأ في تنفيذ استعلام SQLite');
    }
  };

  const handleUploadSqliteBinary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await StorageService.uploadSqliteDatabase(file);
    if (ok) {
      onRefreshData();
      const st = await StorageService.fetchSqliteStats();
      if (st) setSqliteStats(st);
      showToast('تم استيراد واستعادة ملف قاعدة بيانات SQLite بنجاح!');
    } else {
      showToast('الملف المرفوع ليس ملف قاعدة بيانات SQLite 3 صالح', 'error');
    }
    e.target.value = '';
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  // Calculate approximate local storage size in KB
  const calculateStorageSizeKB = (): string => {
    try {
      let totalChars = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('seastar_')) {
          const val = localStorage.getItem(key) || '';
          totalChars += key.length + val.length;
        }
      }
      return ((totalChars * 2) / 1024).toFixed(1);
    } catch {
      return '24.5';
    }
  };

  // Currency presets
  const handleSelectCurrency = (code: 'YER' | 'SAR' | 'USD') => {
    let symbol = 'ر.ي';
    let name = 'ريال يمني';
    if (code === 'SAR') {
      symbol = 'ر.س';
      name = 'ريال سعودي';
    } else if (code === 'USD') {
      symbol = '$';
      name = 'دولار أمريكي';
    }
    const updated: AppSettings = {
      ...settingsForm,
      currencyCode: code,
      currencySymbol: symbol,
      currencyName: name,
    };
    setSettingsForm(updated);
    onUpdateSettings(updated);
    showToast(`تم اعتماد العملة: ${name} (${symbol}) في جميع شاشات النظام`);
  };

  const handleSaveSettingsForm = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    showToast('تم حفظ الإعدادات المتقدمة بنجاح');
  };

  const handleSaveOfficeForm = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOffice(officeForm);
    showToast('تم تحديث بيانات المكتب والترويسة الرسمية بنجاح');
  };

  const handleAddLawyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLawyerName.trim()) return;
    const newMember: LawyerMember = {
      id: `lawyer-${Date.now()}`,
      name: newLawyerName.trim(),
      role: newLawyerRole.trim() || 'محامي',
      phone: newLawyerPhone.trim(),
      email: newLawyerEmail.trim() || 'lawyer@seastar-law.com',
      avatarColor: newLawyerColor,
    };
    const updated = [...lawyers, newMember];
    onUpdateLawyers(updated);
    setNewLawyerName('');
    setNewLawyerEmail('');
    showToast(`تمت إضافة ${newMember.name} إلى طاقم المكتب`);
  };

  const handleDeleteLawyer = (id: string) => {
    if (lawyers.length <= 1) {
      showToast('يجب بقاء محامٍ واحد على الأقل في النظام', 'error');
      return;
    }
    const updated = lawyers.filter((l) => l.id !== id);
    onUpdateLawyers(updated);
    showToast('تم حذف عضو الفريق من القائمة');
  };

  const handleExportFullBackup = () => {
    const iso = StorageService.exportBackup();
    const updated = { ...settingsForm, lastBackupDate: iso };
    setSettingsForm(updated);
    onUpdateSettings(updated);
    showToast('تم تصدير وتحميل النسخة الاحتياطية الشاملة (JSON) بنجاح');
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importBackup(content);
      if (success) {
        onRefreshData();
        setOfficeForm(StorageService.getOffice());
        setSettingsForm(StorageService.getSettings());
        showToast('تم استيراد واستعادة النسخة الاحتياطية بنجاح!');
      } else {
        showToast('ملف النسخة الاحتياطية غير صالح، يرجى التأكد من صيغة JSON', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pb-24 px-3 sm:px-4 pt-3 font-['Cairo',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-700" />
            <span>الإعدادات المتقدمة والنسخ الاحتياطي</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            إدارة العملة ({settingsForm.currencySymbol})، النسخ الاحتياطي، بيانات المكتب، والفريق
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          {settingsForm.currencyName} ({settingsForm.currencySymbol})
        </span>
      </div>

      {/* Status Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Sub-navigation Pills */}
      <div className="grid grid-cols-5 gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs text-xs">
        <button
          onClick={() => setActiveSubTab('license')}
          className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
            activeSubTab === 'license'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px]">الترخيص</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
            activeSubTab === 'backup'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span className="text-[10px]">النسخ الاحتياطي</span>
        </button>

        <button
          onClick={() => setActiveSubTab('currency')}
          className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
            activeSubTab === 'currency'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span className="text-[10px]">العملة والنظام</span>
        </button>

        <button
          onClick={() => setActiveSubTab('office')}
          className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
            activeSubTab === 'office'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span className="text-[10px]">بيانات المكتب</span>
        </button>

        <button
          onClick={() => setActiveSubTab('team')}
          className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
            activeSubTab === 'team'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">فريق العمل</span>
        </button>
      </div>

      {/* SUB-TAB: SYSTEM LICENSE & PURCHASE CODE */}
      {activeSubTab === 'license' && (
        <div className="space-y-3.5">
          {/* License Status Hero */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-5 shadow-md border border-indigo-900/60 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-white">الترخيص وكود الشراء الرسمي</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      مفعل ومعتمد
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    النسخة مرخصة قانونياً للعمل الكامل ومربوطة بمحرك SQLite
                  </p>
                </div>
              </div>
            </div>

            {/* Active License Code Box */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">كود الشراء والتفعيل النشط</div>
                <div className="font-mono text-sm sm:text-base font-black text-amber-300 tracking-wider mt-0.5">
                  {license?.licenseCode || 'SEASTAR-OFFICIAL-LICENSE'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (license?.licenseCode) {
                    navigator.clipboard.writeText(license.licenseCode);
                    setCopiedLicenseCode(true);
                    setTimeout(() => setCopiedLicenseCode(false), 2000);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition text-slate-200"
              >
                {copiedLicenseCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الكود</span>
                  </>
                )}
              </button>
            </div>

            {/* License Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">المحامي / المدير المرخص له</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  {license?.licenseeName || currentUser?.name || 'أ. المحامي العام'}
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">اسم المكتب / المنشأة القانونية</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {license?.firmName || currentUser?.firmName || office.name}
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">رقم القيد / ترخيص وزارة العدل</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {license?.licenseNumber || currentUser?.licenseNumber || office.licenseNumber || 'مرخص رسمياً'}
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">تاريخ التفعيل والاعتماد</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {license?.activatedAt ? new Date(license.activatedAt).toLocaleString('ar-SA') : 'تفعيل دائم'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions for License */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>أمان وحماية رخصة النظام</span>
            </h4>

            <p className="text-xs text-slate-600">
              رخصة النظام سرية ومشفرة ومسجلة في قاعدة بيانات SQLite المحلية لمكتبكم. يُرجى الحفاظ على سرية كود الشراء وعدم مشاركته لضمان أمان البيانات.
            </p>

            {onLogout && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-700 font-bold text-xs transition shadow-2xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 1: BACKUP & RESTORE CENTER */}
      {activeSubTab === 'backup' && (
        <div className="space-y-3.5">
          {/* Storage Status Banner */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-300">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">محرك قاعدة بيانات SQLite 3 العلائقية</h3>
                  <p className="text-[11px] text-blue-200">
                    الملف: <span className="font-mono font-bold text-amber-300">{sqliteStats?.dbFileName || 'seastar.sqlite'}</span> • الحجم: <span className="font-mono font-bold">{sqliteStats?.fileSizeKB || calculateStorageSizeKB()} KB</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold font-mono">
                SQLite v{sqliteStats?.sqliteVersion || '3.51'} ({sqliteStats?.journalMode || 'WAL'})
              </span>
            </div>

            {/* Record Counts Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white/10 rounded-2xl p-2 border border-white/10">
                <span className="text-base font-black font-mono block">{cases.length}</span>
                <span className="text-[10px] text-blue-200">جدول القضايا (cases)</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2 border border-white/10">
                <span className="text-base font-black font-mono block">{clients.length}</span>
                <span className="text-[10px] text-blue-200">جدول الموكلين (clients)</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2 border border-white/10">
                <span className="text-base font-black font-mono block">{finance.length}</span>
                <span className="text-[10px] text-blue-200">جدول المالية (finance)</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2 border border-white/10">
                <span className="text-base font-black font-mono block">{sessions.length}</span>
                <span className="text-[10px] text-blue-200">جدول الجلسات (sessions)</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2 border border-white/10">
                <span className="text-base font-black font-mono block">{documents.length}</span>
                <span className="text-[10px] text-blue-200">جدول الوثائق (documents)</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2 border border-white/10">
                <span className="text-base font-black font-mono block">{tasks.length}</span>
                <span className="text-[10px] text-blue-200">جدول المهام (tasks)</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-blue-200 border-t border-white/10">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>آخر نسخة احتياطية:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {settingsForm.lastBackupDate
                  ? formatDateArabic(settingsForm.lastBackupDate)
                  : 'مزامنة فورية تلقائية (SQLite WAL)'}
              </span>
            </div>
          </div>

          {/* Native SQLite File (.sqlite) Download & Upload */}
          <div className="bg-white border border-blue-200 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-700" />
                <span>ملف قاعدة البيانات الأصلي (SQLite Binary File)</span>
              </h4>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200 font-bold">
                .sqlite / .db
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              حمّل ملف قاعدة بيانات SQLite الفعلي (<code className="font-mono text-blue-800">seastar.sqlite</code>) لفتحه في أي برنامج إدارة قواعد بيانات (مثل DB Browser for SQLite) أو استعد ملف قاعدة بيانات مباشرة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  StorageService.downloadSqliteDatabase();
                  showToast('جاري تحميل ملف قاعدة بيانات SQLite الأصلي (.sqlite)');
                }}
                className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white px-4 py-3 rounded-2xl text-xs font-bold shadow-md shadow-blue-700/20 transition"
              >
                <Download className="w-4 h-4" />
                <span>تحميل قاعدة بيانات (.sqlite)</span>
              </button>

              <label className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer shadow-md transition">
                <Upload className="w-4 h-4" />
                <span>استعادة ملف قاعدة (.sqlite / .db)</span>
                <input
                  type="file"
                  accept=".sqlite,.db,.sqlite3"
                  onChange={handleUploadSqliteBinary}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Interactive SQLite Query Explorer */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>مستعرض الجداول ومشغل استعلامات SQLite</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">SELECT / PRAGMA</span>
            </div>

            {/* Quick Table Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[10px]">
              <button
                type="button"
                onClick={() => handleExecuteSql('SELECT case_number, court, client_name, claim_amount, status FROM cases')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold whitespace-nowrap transition"
              >
                جدول القضايا (cases)
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSql('SELECT voucher_number, type, client_name, total_with_tax, date FROM finance')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold whitespace-nowrap transition"
              >
                جدول المالية (finance)
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSql('SELECT full_name, national_id, phone, client_role, poas_count FROM clients')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold whitespace-nowrap transition"
              >
                جدول الموكلين (clients)
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSql('SELECT case_number, court, date, time, session_type, status FROM sessions')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold whitespace-nowrap transition"
              >
                جدول الجلسات (sessions)
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSql("SELECT name, type FROM sqlite_master WHERE type='table'")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold whitespace-nowrap transition"
              >
                هيكلة الجداول (sqlite_master)
              </button>
            </div>

            {/* SQL Input Box */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                dir="ltr"
                className="flex-1 bg-slate-900 text-emerald-300 font-mono text-[11px] px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 text-left"
                placeholder="SELECT * FROM cases LIMIT 10"
              />
              <button
                type="button"
                onClick={() => handleExecuteSql()}
                disabled={isRunningSql}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunningSql ? 'جاري...' : 'تنفيذ'}</span>
              </button>
            </div>

            {sqlError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
                {sqlError}
              </div>
            )}

            {sqlResults && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-slate-600 border-b border-slate-200">
                  <span>نتائج استعلام SQLite ({sqlResults.length} سجل)</span>
                  <button
                    type="button"
                    onClick={() => setSqlResults(null)}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    إخفاء النتائج
                  </button>
                </div>
                {sqlResults.length === 0 ? (
                  <p className="p-4 text-center text-slate-400 text-xs">لا توجد سجلات مطابقة للاستعلام</p>
                ) : (
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-right border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
                          {Object.keys(sqlResults[0]).map((col) => (
                            <th key={col} className="p-2 border-l border-slate-200 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlResults.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-blue-50/40">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="p-2 border-l border-slate-100 truncate max-w-[160px] text-slate-800">
                                {val === null || val === undefined ? '-' : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Backup & Restore Actions */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>النسخ الاحتياطي الشامل والاستعادة (JSON)</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              قم بحفظ نسخة احتياطية كاملة تحتوي على جميع القضايا، الجلسات، الموكلين، السندات المالية، المستندات، وإعدادات المكتب في ملف واحد، واسترجعها في أي وقت أو على أي جهاز آخر.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleExportFullBackup}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-4 py-3 rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <Download className="w-4 h-4" />
                <span>تصدير نسخة احتياطية شاملة</span>
              </button>

              <label className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer shadow-md shadow-blue-600/20 transition">
                <Upload className="w-4 h-4" />
                <span>استعادة نسخة احتياطية (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackupFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Accounting & Cases CSV Exports */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>تصدير الجداول المحاسبية والقضائية (Excel / CSV)</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              تصدير السجلات المالية والقضايا بصيغة CSV متوافقة مع برنامج Excel للمراجعة المحاسبية بالريال اليمني ({settingsForm.currencySymbol}).
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  StorageService.exportFinanceCSV();
                  showToast('تم تحميل جدول السندات المالية (CSV)');
                }}
                className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 py-2.5 px-3 rounded-2xl text-xs font-bold transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>تصدير السجل المالي (CSV)</span>
              </button>

              <button
                onClick={() => {
                  StorageService.exportCasesCSV();
                  showToast('تم تحميل سجل القضايا (CSV)');
                }}
                className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 py-2.5 px-3 rounded-2xl text-xs font-bold transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>تصدير سجل القضايا (CSV)</span>
              </button>
            </div>
          </div>

          {/* System Reset & Clean Slate */}
          <div className="bg-white border border-rose-200 rounded-3xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>إدارة البيانات وإعادة الضبط المصنعي</span>
            </h4>

            <div className="space-y-2">
              {!confirmResetDemo ? (
                <button
                  onClick={() => setConfirmResetDemo(true)}
                  className="w-full flex items-center justify-between bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-700" />
                    <span>استعادة البيانات التجريبية الافتراضية</span>
                  </span>
                  <span className="text-[10px] text-amber-700">إعادة ضبط</span>
                </button>
              ) : (
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-amber-950">
                    هل أنت متأكد من استعادة البيانات التوضيحية الافتراضية؟
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setConfirmResetDemo(false)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => {
                        StorageService.resetToDefault();
                        onRefreshData();
                        setConfirmResetDemo(false);
                        showToast('تمت استعادة البيانات الافتراضية بنجاح');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold"
                    >
                      نعم، استعادة الافتراضي
                    </button>
                  </div>
                </div>
              )}

              {!confirmClearEmpty ? (
                <button
                  onClick={() => setConfirmClearEmpty(true)}
                  className="w-full flex items-center justify-between bg-rose-50 hover:bg-rose-100/80 text-rose-900 border border-rose-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>تفريغ كافة السجلات (بدء مكتب جديد فارغ)</span>
                  </span>
                  <span className="text-[10px] text-rose-700">مسح الكل</span>
                </button>
              ) : (
                <div className="bg-rose-50 border border-rose-300 p-3 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-rose-950">
                    تحذير: سيتم مسح جميع القضايا والموكلين والسندات الحالية للبدء على نظافة. هل تود المتابعة؟
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setConfirmClearEmpty(false)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => {
                        StorageService.clearAllEmpty();
                        onRefreshData();
                        setConfirmClearEmpty(false);
                        showToast('تم تفريغ السجلات بنجاح والنظام جاهز للإدخال الجديد');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold"
                    >
                      تأكيد المسح الشامل
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CURRENCY, TAX & ALERTS SETTINGS */}
      {activeSubTab === 'currency' && (
        <form onSubmit={handleSaveSettingsForm} className="space-y-3.5 text-xs">
          {/* Currency Selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>العملة الرسمية للنظام والفواتير</span>
              </h4>
              <span className="text-[11px] font-bold text-blue-700">
                العملة الحالية: {settingsForm.currencyName} ({settingsForm.currencySymbol})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectCurrency('YER')}
                className={`p-3 rounded-2xl border text-center transition ${
                  settingsForm.currencyCode === 'YER'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base font-black block font-mono">ر.ي (YER)</span>
                <span className="text-[11px] font-bold block mt-0.5">الريال اليمني</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCurrency('SAR')}
                className={`p-3 rounded-2xl border text-center transition ${
                  settingsForm.currencyCode === 'SAR'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base font-black block font-mono">ر.س (SAR)</span>
                <span className="text-[11px] font-bold block mt-0.5">الريال السعودي</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCurrency('USD')}
                className={`p-3 rounded-2xl border text-center transition ${
                  settingsForm.currencyCode === 'USD'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base font-black block font-mono">$ (USD)</span>
                <span className="text-[11px] font-bold block mt-0.5">الدولار الأمريكي</span>
              </button>
            </div>
          </div>

          {/* Tax & Financial Defaults */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">إعدادات الضرائب والفوترة</h4>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">تفعيل الضريبة تلقائياً في السندات</span>
                <span className="text-[10px] text-slate-500">إضافة النسبة الضريبية تلقائياً عند إنشاء سند جديد</span>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.enableTaxByDefault}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, enableTaxByDefault: e.target.checked })
                }
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                نسبة الضريبة الافتراضية (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={settingsForm.defaultTaxRate}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, defaultTaxRate: Number(e.target.value) })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          {/* Smart Alerts & External OS Notification Settings */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-blue-600" />
                <span>نظام الإشعارات الخارجي والإنذار المبكر</span>
              </h4>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  settingsForm.enableExternalNotifications !== false
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {settingsForm.enableExternalNotifications !== false ? 'الإشعارات الخارجية مفعلة' : 'الإشعارات متوقفة'}
              </span>
            </div>

            {/* Native OS / Browser Notification Permission Box */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-xs text-sky-300 block">
                    إشعارات نظام التشغيل والمتصفح (خارج التطبيق)
                  </span>
                  <span className="text-[10px] text-slate-300">
                    حالة الإذن:{' '}
                    {osPermStatus === 'granted'
                      ? '✅ مفعّل ومسموح به على النظام'
                      : osPermStatus === 'denied'
                      ? '⚠️ تم الحظر من المتصفح (يعمل شريط أندرويد العلوي البديل)'
                      : osPermStatus === 'default'
                      ? '⏳ بانتظار منح الإذن للإشعارات الخارجية'
                      : '📱 يعمل عبر محاكي إشعارات نظام أندرويد المدمج'}
                  </span>
                </div>
                {osPermStatus !== 'granted' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await NotificationEngine.requestPermission();
                      setOsPermStatus(res);
                      if (res === 'granted') {
                        showToast('تم تفعيل إذن الإشعارات الخارجية على نظام التشغيل بنجاح!');
                      } else {
                        showToast('تم تفعيل شريط إشعارات نظام أندرويد العلوي المنبثق تلقائياً');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] shrink-0 transition"
                  >
                    تفعيل إذن النظام
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(settingsForm);
                    if (onTriggerTestExternalAlert) onTriggerTestExternalAlert();
                    showToast('تم إطلاق إشعار خارجي تجريبي مع التنبيه الصوتي!');
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/15 text-white py-2 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-300" />
                  <span>إشعار خارجي تجريبي</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(settingsForm);
                    NotificationEngine.clearDispatchedHistory();
                    if (onTriggerAllDueExternalAlerts) onTriggerAllDueExternalAlerts();
                    showToast('تم فحص جميع الجلسات والوكالات وإطلاق التنبيهات المستحقة!');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>فحص وبث التنبيهات الآن</span>
                </button>
              </div>
            </div>

            {/* External Notification Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">
                    تفعيل التنبيهات الخارجية عند اقتراب الجلسات أو انتهاء الوكالات
                  </span>
                  <span className="text-[10px] text-slate-500">
                    إرسال إشعار منبثق خارج التطبيق وفي شريط النظام حسب المهل المحددة أدناه
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.enableExternalNotifications !== false}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      enableExternalNotifications: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">تفعيل الرنين الصوتي للإشعارات الخارجية</span>
                  <span className="text-[10px] text-slate-500">إصدار نغمة تنبيه عند وصول إشعار جلسة عاجلة أو وكالة</span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.enableSoundAlerts !== false}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      enableSoundAlerts: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Configurable Time Thresholds for Sessions & POAs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  تنبيه اقتراب الجلسة قبل (ساعة)
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={settingsForm.sessionAlertBeforeHours ?? 24}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      sessionAlertBeforeHours: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400">افتراضي: 24 ساعة قبل الجلسة</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  التنبيه العاجل الثاني قبل (دقيقة)
                </label>
                <input
                  type="number"
                  min={15}
                  max={360}
                  value={settingsForm.sessionSecondAlertMinutes ?? 120}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      sessionSecondAlertMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400">افتراضي: 120 دقيقة (ساعتين)</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  تنبيه انتهاء الوكالة قبل (يوم)
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={settingsForm.poaExpiryWarningDays}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      poaExpiryWarningDays: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400">افتراضي: قبل 14 يوماً من الانتهاء</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  مفتاح الدولة للواتساب
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappCountryCode}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      whatsappCountryCode: e.target.value,
                    })
                  }
                  placeholder="+967"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono dir-ltr text-right font-bold"
                />
                <span className="text-[10px] text-slate-400">لتنبيهات الموكلين السريعة</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">كشف تعارض مواعيد الجلسات آلياً</span>
                <span className="text-[10px] text-slate-500">تنبيه فوري عند تقارب جلستين بأقل من 50 دقيقة</span>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.enableConflictDetection}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    enableConflictDetection: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-2xl shadow-md shadow-blue-700/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات المالية وإعدادات الإشعارات الخارجية</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: OFFICE PROFILE SETTINGS */}
      {activeSubTab === 'office' && (
        <form onSubmit={handleSaveOfficeForm} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3 text-xs">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>بيانات المكتب والترويسة الرسمية للسندات</span>
          </h4>

          <div>
            <label className="block text-slate-700 font-bold mb-1">اسم المكتب (بالعربية)</label>
            <input
              type="text"
              required
              value={officeForm.name}
              onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">الاسم الإنجليزي / الشعار اللفظي</label>
            <input
              type="text"
              value={officeForm.title}
              onChange={(e) => setOfficeForm({ ...officeForm, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">رقم ترخيص المزاولة</label>
              <input
                type="text"
                value={officeForm.licenseNumber}
                onChange={(e) => setOfficeForm({ ...officeForm, licenseNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">الرقم الضريبي</label>
              <input
                type="text"
                value={officeForm.taxNumber}
                onChange={(e) => setOfficeForm({ ...officeForm, taxNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">هاتف المكتب</label>
              <input
                type="text"
                value={officeForm.phone}
                onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono dir-ltr text-right"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={officeForm.email}
                onChange={(e) => setOfficeForm({ ...officeForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">عنوان المكتب</label>
            <input
              type="text"
              value={officeForm.address}
              onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">اسم البنك المعتمد</label>
              <input
                type="text"
                value={officeForm.bankName}
                onChange={(e) => setOfficeForm({ ...officeForm, bankName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">رقم الحساب البنكي / IBAN</label>
              <input
                type="text"
                value={officeForm.iban}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, iban: e.target.value, bankAccount: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-2xl shadow-md shadow-blue-700/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>حفظ بيانات وهوية المكتب</span>
          </button>
        </form>
      )}

      {/* SUB-TAB 4: TEAM MANAGEMENT */}
      {activeSubTab === 'team' && (
        <div className="space-y-3.5 text-xs">
          {/* Add New Lawyer Form */}
          <form onSubmit={handleAddLawyer} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-700" />
              <span>إضافة محامٍ أو مستشار جديد للمكتب</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newLawyerName}
                  onChange={(e) => setNewLawyerName(e.target.value)}
                  placeholder="أ. محمد عبدالله..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">المسمى الوظيفي / التخصص</label>
                <input
                  type="text"
                  value={newLawyerRole}
                  onChange={(e) => setNewLawyerRole(e.target.value)}
                  placeholder="محامي استئناف..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={newLawyerPhone}
                  onChange={(e) => setNewLawyerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono dir-ltr text-right"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">لون الشارة التمييزي</label>
                <select
                  value={newLawyerColor}
                  onChange={(e) => setNewLawyerColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="bg-blue-600">أزرق ملكي</option>
                  <option value="bg-emerald-600">أخضر زمردي</option>
                  <option value="bg-amber-600">ذهبي كهرماني</option>
                  <option value="bg-purple-600">بنفسجي</option>
                  <option value="bg-rose-600">قرمزي</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-2xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إلى طاقم المكتب</span>
            </button>
          </form>

          {/* Current Team List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900">
              أعضاء الفريق المسجلين ({lawyers.length})
            </h4>

            <div className="space-y-2">
              {lawyers.map((member) => (
                <div
                  key={member.id}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{member.role}</p>
                      <p className="text-[10px] text-blue-700 font-mono dir-ltr text-right">{member.phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLawyer(member.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                    title="حذف العضو"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
