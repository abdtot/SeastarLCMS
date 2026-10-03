import {
  Client,
  LegalCase,
  Session,
  LegalDocument,
  FinancialRecord,
  LegalTask,
  LawyerMember,
  OfficeProfile,
  AppSettings,
  CourtInfo,
  PurchaseCode,
  AppLicense,
  UserAccount
} from '../types/index.ts';

const STORAGE_KEYS = {
  CLIENTS: 'seastar_clients',
  CASES: 'seastar_cases',
  SESSIONS: 'seastar_sessions',
  DOCUMENTS: 'seastar_documents',
  FINANCE: 'seastar_finance',
  TASKS: 'seastar_tasks',
  OFFICE: 'seastar_office',
  LAWYERS: 'seastar_lawyers',
  SETTINGS: 'seastar_settings',
  COURTS: 'seastar_courts',
  CURRENT_USER: 'seastar_current_user',
  LICENSE: 'seastar_license',
};

export const DEFAULT_SETTINGS: AppSettings = {
  currencyCode: 'YER',
  currencySymbol: 'ر.ي',
  currencyName: 'ريال يمني',
  defaultTaxRate: 5,
  enableTaxByDefault: false,
  poaExpiryWarningDays: 14,
  enableConflictDetection: true,
  whatsappCountryCode: '+967',
  lastBackupDate: undefined,
  autoBackupReminder: true,
  enableExternalNotifications: true,
  enableSoundAlerts: true,
  sessionAlertBeforeHours: 24,
  sessionSecondAlertMinutes: 120,
};

export const DEFAULT_OFFICE: OfficeProfile = {
  name: 'مكتب سيتار للمحاماة والاستشارات القانونية',
  title: 'SeaStar Legal Practice & Advocacy',
  licenseNumber: 'ترخيص وزارة العدل رقم: 4410/ق/2019',
  phone: '+966 50 123 4567',
  email: 'info@seastar-law.com',
  address: 'الرياض - طريق الملك فهد - برج الميزان للأعمال - الطابق 14',
  taxNumber: '310928374600003',
  bankAccount: 'SA44 8000 0214 6080 1012 3456',
  iban: 'SA4480000214608010123456',
  bankName: 'مصرف الراجحي - فرع الشركات',
};

export const LAWYERS: LawyerMember[] = [
  {
    id: 'lawyer-1',
    name: 'أ. د. طارق الشمري',
    role: 'المحامي الرئيسي والشريك المؤسس',
    email: 'tariq@seastar-law.com',
    phone: '+966 50 123 4567',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'lawyer-2',
    name: 'أ. فيصل السبيعي',
    role: 'محامي استئناف ومستشار قضايا تجارية',
    email: 'faisal@seastar-law.com',
    phone: '+966 55 987 6543',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'lawyer-3',
    name: 'أ. ريم العتيبي',
    role: 'محامية متخصصة بالدعاوى العمالية والشركات',
    email: 'reem@seastar-law.com',
    phone: '+966 54 222 3344',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'lawyer-4',
    name: 'أ. خالد المنصور',
    role: 'باحث قانوني ومسؤول صياغة اللوائح والمذكرات',
    email: 'khaled@seastar-law.com',
    phone: '+966 56 777 8899',
    avatarColor: 'bg-purple-600',
  },
];

export const INITIAL_COURTS: CourtInfo[] = [
  {
    id: 'court-1',
    name: 'المحكمة التجارية بالأمانة - صنعاء',
    type: 'تجارية',
    city: 'صنعاء',
    address: 'شارع العدل - مجمع المحاكم التجارية',
    defaultCircuit: 'الدائرة التجارية الأولى - قاعة 2',
    chiefJudge: 'القاضي العلامة د. يحيى المرواني',
    secretaryPhone: '+967 1 274 500',
    workingHours: '08:30 ص - 01:30 م',
    notes: 'يتطلب إحضار أصل السجل التجاري والوكالة المصدقة عند قيد الدعوى.',
    createdAt: '2026-01-10',
  },
  {
    id: 'court-2',
    name: 'محكمة استئناف أمانة العاصمة',
    type: 'استئناف',
    city: 'صنعاء',
    address: 'شارع الزبيري - مبنى محكمة الاستئناف',
    defaultCircuit: 'الشعبة المدنية والتجارية الثانية',
    chiefJudge: 'القاضي عبدالكريم الشامي',
    secretaryPhone: '+967 1 251 800',
    workingHours: '08:30 ص - 01:30 م',
    notes: 'إيداع عرائض الاستئناف عبر قلم الكتاب المركزي في الدور الأول.',
    createdAt: '2026-01-12',
  },
  {
    id: 'court-3',
    name: 'المحكمة التجارية بعدن',
    type: 'تجارية',
    city: 'عدن',
    address: 'خور مكسر - المجمع القضائي',
    defaultCircuit: 'الدائرة التجارية البحرية والمقاولات',
    chiefJudge: 'القاضي فؤاد باعلوي',
    secretaryPhone: '+967 2 234 110',
    workingHours: '08:00 ص - 01:00 م',
    notes: 'تختص بمنازعات الشركات والملاحة البحرية والاعتمادات المستندية.',
    createdAt: '2026-02-01',
  },
  {
    id: 'court-4',
    name: 'محكمة جنوب غرب الأمانة الابتدائية',
    type: 'ابتدائية / عامة',
    city: 'صنعاء',
    address: 'حي حدة - جوار جولة المصباحي',
    defaultCircuit: 'الدائرة المدنية والعقارية الأولى',
    chiefJudge: 'القاضي محمد المتوكل',
    secretaryPhone: '+967 1 415 990',
    workingHours: '08:30 ص - 01:30 م',
    notes: 'مختصة بالدعاوى المدنية والمطالبات العقارية وقسمة التركات.',
    createdAt: '2026-02-15',
  },
  {
    id: 'court-5',
    name: 'المحكمة التجارية بالرياض',
    type: 'تجارية',
    city: 'الرياض',
    address: 'طريق الملك فهد - مجمع المحاكم التجارية',
    defaultCircuit: 'الدائرة التجارية الرابعة - قاعة 12',
    chiefJudge: 'فضيلة القاضي د. عبدالله بن سعد التميمي',
    secretaryPhone: '+966 11 405 7777',
    workingHours: '08:00 ص - 02:30 م',
    notes: 'يدعم حضور الجلسات عن بُعد عبر بوابة ناجز والتقاضي الإلكتروني.',
    createdAt: '2026-01-05',
  },
  {
    id: 'court-6',
    name: 'المحكمة العمالية بالرياض',
    type: 'عمالية',
    city: 'الرياض',
    address: 'حي المربع - شارع الوشم',
    defaultCircuit: 'الدائرة العمالية الثانية',
    chiefJudge: 'فضيلة القاضي أ. منصور بن فهد الدوسري',
    secretaryPhone: '+966 11 402 1100',
    workingHours: '08:00 ص - 02:30 م',
    notes: 'يشترط إرفاق محضر التسوية الودية قبل قيد اللائحة.',
    createdAt: '2026-01-08',
  },
  {
    id: 'court-7',
    name: 'المحكمة العامة بالرياض',
    type: 'ابتدائية / عامة',
    city: 'الرياض',
    address: 'شارع الملك فيصل - الديرة',
    defaultCircuit: 'الدائرة الحقوقية والعقارية الأولى',
    chiefJudge: 'فضيلة القاضي الشيخ عبدالرحمن السديس',
    secretaryPhone: '+966 11 411 8800',
    workingHours: '08:00 ص - 02:30 م',
    notes: 'الدعاوى العقارية والإنهاءات والتركات.',
    createdAt: '2026-01-09',
  },
];

// Empty default collections (Clean slate for new office account)
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_CASES: LegalCase[] = [];
export const INITIAL_SESSIONS: Session[] = [];
export const INITIAL_DOCUMENTS: LegalDocument[] = [];
export const INITIAL_FINANCE: FinancialRecord[] = [];
export const INITIAL_TASKS: LegalTask[] = [];

// LocalStorage cache & SQLite Server Sync helpers
export const loadData = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key: ${key}`, err);
    return fallback;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key: ${key}`, err);
  }
};

const syncToSqliteServer = (collection: string, data: any) => {
  if (typeof window === 'undefined') return;
  fetch(`/api/sync/${collection}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  }).catch((err) => {
    console.warn(`SQLite background sync warning (${collection}):`, err);
  });
};

// Data service backed by SQLite + local fast cache
export const StorageService = {
  getClients: (): Client[] => loadData(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS),
  saveClients: (clients: Client[]) => {
    saveData(STORAGE_KEYS.CLIENTS, clients);
    syncToSqliteServer('clients', clients);
  },

  getCases: (): LegalCase[] => loadData(STORAGE_KEYS.CASES, INITIAL_CASES),
  saveCases: (cases: LegalCase[]) => {
    saveData(STORAGE_KEYS.CASES, cases);
    syncToSqliteServer('cases', cases);
  },

  getSessions: (): Session[] => loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS),
  saveSessions: (sessions: Session[]) => {
    saveData(STORAGE_KEYS.SESSIONS, sessions);
    syncToSqliteServer('sessions', sessions);
  },

  getDocuments: (): LegalDocument[] => loadData(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
  saveDocuments: (docs: LegalDocument[]) => {
    // Keep localStorage cache lightweight while syncing metadata to SQLite
    const lightDocs = docs.map((d) => ({
      ...d,
      fileDataUri: d.fileDataUri && d.fileDataUri.length > 150000 ? undefined : d.fileDataUri,
      hasStoredBlob: true,
    }));
    saveData(STORAGE_KEYS.DOCUMENTS, lightDocs);
    // Sync to SQLite tables without sending massive base64 arrays in PUT
    syncToSqliteServer('documents', lightDocs);
  },

  uploadDocumentFile: async (
    docMeta: Partial<LegalDocument>,
    file?: File | null
  ): Promise<LegalDocument> => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (docMeta.id) formData.append('id', docMeta.id);
    if (docMeta.title) formData.append('title', docMeta.title);
    if (docMeta.type) formData.append('type', docMeta.type);
    if (docMeta.caseId) formData.append('caseId', docMeta.caseId);
    if (docMeta.caseNumber) formData.append('caseNumber', docMeta.caseNumber);
    if (docMeta.clientId) formData.append('clientId', docMeta.clientId);
    if (docMeta.clientName) formData.append('clientName', docMeta.clientName);
    if (docMeta.confidentiality) formData.append('confidentiality', docMeta.confidentiality);
    if (docMeta.notes) formData.append('notes', docMeta.notes);
    if (docMeta.tags && docMeta.tags.length > 0) {
      formData.append('tags', docMeta.tags.join(','));
    }
    if (docMeta.fileDataUri && !file) {
      formData.append('fileDataUri', docMeta.fileDataUri);
    }

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok || !json.ok || !json.document) {
      throw new Error(json?.error || 'فشل حفظ وأرشفة المستند في قاعدة بيانات SQLite');
    }
    return json.document as LegalDocument;
  },

  uploadDocumentToSqlite: async (doc: LegalDocument): Promise<LegalDocument | null> => {
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: doc }),
      });
      const json = await res.json();
      if (json.ok && json.document) {
        return json.document;
      }
      return null;
    } catch (err) {
      console.warn('Could not upload document directly to SQLite:', err);
      return null;
    }
  },

  fetchDocumentFromSqlite: async (id: string): Promise<LegalDocument | null> => {
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.ok ? json.document : null;
    } catch {
      return null;
    }
  },

  deleteDocumentFromSqlite: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  getFinance: (): FinancialRecord[] => loadData(STORAGE_KEYS.FINANCE, INITIAL_FINANCE),
  saveFinance: (records: FinancialRecord[]) => {
    saveData(STORAGE_KEYS.FINANCE, records);
    syncToSqliteServer('finance', records);
  },

  getTasks: (): LegalTask[] => loadData(STORAGE_KEYS.TASKS, INITIAL_TASKS),
  saveTasks: (tasks: LegalTask[]) => {
    saveData(STORAGE_KEYS.TASKS, tasks);
    syncToSqliteServer('tasks', tasks);
  },

  getOffice: (): OfficeProfile => loadData(STORAGE_KEYS.OFFICE, DEFAULT_OFFICE),
  saveOffice: (office: OfficeProfile) => {
    saveData(STORAGE_KEYS.OFFICE, office);
    syncToSqliteServer('office', office);
  },

  getLawyers: (): LawyerMember[] => loadData(STORAGE_KEYS.LAWYERS, LAWYERS),
  saveLawyers: (lawyers: LawyerMember[]) => {
    saveData(STORAGE_KEYS.LAWYERS, lawyers);
    syncToSqliteServer('lawyers', lawyers);
  },

  getSettings: (): AppSettings => loadData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: AppSettings) => {
    saveData(STORAGE_KEYS.SETTINGS, settings);
    syncToSqliteServer('settings', settings);
  },

  getCourts: (): CourtInfo[] => loadData(STORAGE_KEYS.COURTS, INITIAL_COURTS),
  saveCourts: (courts: CourtInfo[]) => {
    saveData(STORAGE_KEYS.COURTS, courts);
    syncToSqliteServer('courts', courts);
  },

  syncFromSqliteServer: async (): Promise<any | null> => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) return null;
      const json = await res.json();
      if (json.ok && json.data) {
        const d = json.data;
        if (d.clients) saveData(STORAGE_KEYS.CLIENTS, d.clients);
        if (d.cases) saveData(STORAGE_KEYS.CASES, d.cases);
        if (d.sessions) saveData(STORAGE_KEYS.SESSIONS, d.sessions);
        if (d.documents) saveData(STORAGE_KEYS.DOCUMENTS, d.documents);
        if (d.finance) saveData(STORAGE_KEYS.FINANCE, d.finance);
        if (d.tasks) saveData(STORAGE_KEYS.TASKS, d.tasks);
        if (d.office) saveData(STORAGE_KEYS.OFFICE, d.office);
        if (d.lawyers) saveData(STORAGE_KEYS.LAWYERS, d.lawyers);
        if (d.settings) saveData(STORAGE_KEYS.SETTINGS, d.settings);
        if (d.courts) saveData(STORAGE_KEYS.COURTS, d.courts);
        return d;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch bootstrap from SQLite server:', err);
      return null;
    }
  },

  fetchSqliteStats: async (): Promise<any | null> => {
    try {
      const res = await fetch('/api/sqlite/stats');
      if (!res.ok) return null;
      const json = await res.json();
      return json.ok ? json.stats : null;
    } catch {
      return null;
    }
  },

  runSqliteQuery: async (sql: string): Promise<{ ok: boolean; rows?: any[]; error?: string }> => {
    try {
      const res = await fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, error: err?.message || 'فشل الاتصال بمحرك SQLite' };
    }
  },

  downloadSqliteDatabase: () => {
    const a = document.createElement('a');
    a.href = '/api/sqlite/download';
    a.download = `SeaStar_Database_${new Date().toISOString().slice(0, 10)}.sqlite`;
    a.click();
  },

  uploadSqliteDatabase: async (file: File): Promise<boolean> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await fetch('/api/sqlite/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: arrayBuffer,
      });
      const json = await res.json();
      if (json.ok && json.data) {
        const d = json.data;
        if (d.clients) saveData(STORAGE_KEYS.CLIENTS, d.clients);
        if (d.cases) saveData(STORAGE_KEYS.CASES, d.cases);
        if (d.sessions) saveData(STORAGE_KEYS.SESSIONS, d.sessions);
        if (d.documents) saveData(STORAGE_KEYS.DOCUMENTS, d.documents);
        if (d.finance) saveData(STORAGE_KEYS.FINANCE, d.finance);
        if (d.tasks) saveData(STORAGE_KEYS.TASKS, d.tasks);
        if (d.office) saveData(STORAGE_KEYS.OFFICE, d.office);
        if (d.lawyers) saveData(STORAGE_KEYS.LAWYERS, d.lawyers);
        if (d.settings) saveData(STORAGE_KEYS.SETTINGS, d.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  resetToDefault: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.CASES);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
      localStorage.removeItem(STORAGE_KEYS.FINANCE);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.OFFICE);
      localStorage.removeItem(STORAGE_KEYS.LAWYERS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.COURTS);
    }
    if (typeof window !== 'undefined') {
      fetch('/api/sqlite/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'demo' }),
      }).catch(() => {});
    }
  },

  clearAllEmpty: () => {
    StorageService.saveClients([]);
    StorageService.saveCases([]);
    StorageService.saveSessions([]);
    StorageService.saveDocuments([]);
    StorageService.saveFinance([]);
    StorageService.saveTasks([]);
    if (typeof window !== 'undefined') {
      fetch('/api/sqlite/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'empty' }),
      }).catch(() => {});
    }
  },

  exportBackup: (): string => {
    const nowIso = new Date().toISOString();
    const currentSettings = StorageService.getSettings();
    const updatedSettings: AppSettings = {
      ...currentSettings,
      lastBackupDate: nowIso,
    };
    StorageService.saveSettings(updatedSettings);

    const payload = {
      clients: StorageService.getClients(),
      cases: StorageService.getCases(),
      sessions: StorageService.getSessions(),
      documents: StorageService.getDocuments(),
      finance: StorageService.getFinance(),
      tasks: StorageService.getTasks(),
      office: StorageService.getOffice(),
      lawyers: StorageService.getLawyers(),
      courts: StorageService.getCourts(),
      settings: updatedSettings,
      exportedAt: nowIso,
      version: '2.0',
      appName: 'SeaStar Legal Practice Management',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SeaStar_Legal_Backup_${nowIso.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return nowIso;
  },

  exportFinanceCSV: () => {
    const records = StorageService.getFinance();
    const settings = StorageService.getSettings();
    const headers = ['رقم السند', 'النوع', 'التاريخ', 'الموكل', 'رقم القضية', 'التصنيف', 'المبلغ الأساسي', 'الضريبة', `الإجمالي (${settings.currencySymbol})`, 'طريقة الدفع', 'البيان'];
    const rows = records.map(r => [
      r.voucherNumber,
      r.type === 'receipt_voucher' ? 'سند قبض' : r.type === 'payment_voucher' ? 'سند صرف' : 'فاتورة',
      r.date,
      `"${r.clientName.replace(/"/g, '""')}"`,
      r.caseNumber || '-',
      r.category,
      r.amount,
      r.taxAmount,
      r.totalWithTax,
      r.paymentMethod,
      `"${r.description.replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SeaStar_Finance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportCasesCSV: () => {
    const cases = StorageService.getCases();
    const settings = StorageService.getSettings();
    const headers = ['رقم القضية', 'رقم القيد', 'المحكمة', 'الدائرة', 'درجة التقاضي', 'الحالة', 'الموكل', 'الخصم', `المطالبة المالية (${settings.currencySymbol})`, 'المحامي المكلف'];
    const rows = cases.map(c => [
      c.caseNumber,
      c.generalRegistrationNumber,
      `"${c.court}"`,
      `"${c.circuit}"`,
      c.litigationStage,
      c.status,
      `"${c.clientName.replace(/"/g, '""')}"`,
      `"${c.opponentName.replace(/"/g, '""')}"`,
      c.claimAmount || 0,
      `"${c.assignedLawyerName}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SeaStar_Cases_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackup: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;
      if (data.clients) StorageService.saveClients(data.clients);
      if (data.cases) StorageService.saveCases(data.cases);
      if (data.sessions) StorageService.saveSessions(data.sessions);
      if (data.documents) StorageService.saveDocuments(data.documents);
      if (data.finance) StorageService.saveFinance(data.finance);
      if (data.tasks) StorageService.saveTasks(data.tasks);
      if (data.office) StorageService.saveOffice(data.office);
      if (data.lawyers) StorageService.saveLawyers(data.lawyers);
      if (data.courts) StorageService.saveCourts(data.courts);
      if (data.settings) StorageService.saveSettings(data.settings);
      if (data.license) StorageService.saveLicense(data.license);
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  },

  getLicense: (): AppLicense =>
    loadData<AppLicense>(STORAGE_KEYS.LICENSE, { isActivated: false }),
  saveLicense: (license: AppLicense) => {
    saveData(STORAGE_KEYS.LICENSE, license);
    syncToSqliteServer('license', license);
  },

  getCurrentUser: (): UserAccount | null =>
    loadData<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null),
  saveCurrentUser: (user: UserAccount | null) => {
    if (!user) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } else {
      saveData(STORAGE_KEYS.CURRENT_USER, user);
    }
  },

  verifyPurchaseCode: async (
    code: string
  ): Promise<{ ok: boolean; message: string; isUsed?: boolean }> => {
    try {
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, message: err?.message || 'تعذر الاتصال بخادم التراخيص' };
    }
  },

  activateAppLicense: async (payload: {
    code: string;
    name: string;
    email: string;
    phone: string;
    firmName: string;
    licenseNumber: string;
    city: string;
    password?: string;
  }): Promise<{
    ok: boolean;
    error?: string;
    license?: AppLicense;
    user?: UserAccount;
    office?: OfficeProfile;
  }> => {
    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok && data.license) {
        StorageService.saveLicense(data.license);
        if (data.user) StorageService.saveCurrentUser(data.user);
        if (data.office) StorageService.saveOffice(data.office);
      }
      return data;
    } catch (err: any) {
      return { ok: false, error: err?.message || 'فشل الاتصال لتفعيل النسخة' };
    }
  },

  fetchLicenseStatus: async (): Promise<{
    isActivated: boolean;
    license?: AppLicense;
    user?: UserAccount;
  }> => {
    try {
      const res = await fetch('/api/license/status');
      const data = await res.json();
      if (data.ok && data.license) {
        StorageService.saveLicense(data.license);
        if (data.user) StorageService.saveCurrentUser(data.user);
        return { isActivated: data.license.isActivated, license: data.license, user: data.user };
      }
      return { isActivated: false };
    } catch {
      return { isActivated: StorageService.getLicense().isActivated };
    }
  },

  clearAllData: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEYS.CASES);
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
      localStorage.removeItem(STORAGE_KEYS.FINANCE);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
    }
  },
};
