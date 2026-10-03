import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  LegalCase,
  Session,
  Client,
  FinancialRecord,
  LegalDocument,
  LegalTask,
  OfficeProfile,
  LawyerMember,
  AppSettings,
  ExternalAlertItem,
  CourtInfo,
  LitigationStage,
  CaseStatus,
  SessionStatus,
  TaskStatus,
  UserAccount,
  AppLicense
} from './types';
import { StorageService, LAWYERS } from './services/storage';
import { NotificationEngine } from './services/notificationEngine';
import { getDaysRemaining } from './utils/formatters';

// Components
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidSystemBar } from './components/AndroidSystemBar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { QuickActionsFAB } from './components/QuickActionsFAB';
import { DashboardView } from './components/dashboard/DashboardView';
import { CasesView } from './components/cases/CasesView';
import { CaseDetailModal } from './components/cases/CaseDetailModal';
import { AddCaseModal } from './components/cases/AddCaseModal';
import { SessionsView } from './components/sessions/SessionsView';
import { AddSessionModal } from './components/sessions/AddSessionModal';
import { RecordSessionModal } from './components/sessions/RecordSessionModal';
import { ClientsView } from './components/clients/ClientsView';
import { AddClientModal } from './components/clients/AddClientModal';
import { ClientPortalModal } from './components/modals/ClientPortalModal';
import { FinanceView } from './components/finance/FinanceView';
import { AddVoucherModal } from './components/finance/AddVoucherModal';
import { OfficialVoucherModal } from './components/finance/OfficialVoucherModal';
import { DocumentsView } from './components/documents/DocumentsView';
import { AddDocumentModal } from './components/documents/AddDocumentModal';
import { DocumentPreviewModal } from './components/documents/DocumentPreviewModal';
import { TasksView } from './components/tasks/TasksView';
import { AddTaskModal } from './components/tasks/AddTaskModal';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { ExternalNotificationBanner } from './components/notifications/ExternalNotificationBanner';
import { SearchModal } from './components/modals/SearchModal';
import { AddCourtModal } from './components/modals/AddCourtModal';
import { ActivationGatekeeper } from './components/auth/ActivationGatekeeper';

export default function App() {
  // License & Authentication State
  const [license, setLicense] = useState<AppLicense>(StorageService.getLicense());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(StorageService.getCurrentUser());
  const [isCheckingLicense, setIsCheckingLicense] = useState(true);

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lawyers, setLawyers] = useState<LawyerMember[]>(StorageService.getLawyers());
  const [currentLawyer, setCurrentLawyer] = useState<LawyerMember>(StorageService.getLawyers()[0] || LAWYERS[0]);

  // App Data State
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [finance, setFinance] = useState<FinancialRecord[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [tasks, setTasks] = useState<LegalTask[]>([]);
  const [courts, setCourts] = useState<CourtInfo[]>(StorageService.getCourts());
  const [office, setOffice] = useState<OfficeProfile>(StorageService.getOffice());
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  const refreshAllData = () => {
    setCases(StorageService.getCases());
    setSessions(StorageService.getSessions());
    setClients(StorageService.getClients());
    setFinance(StorageService.getFinance());
    setDocuments(StorageService.getDocuments());
    setTasks(StorageService.getTasks());
    setCourts(StorageService.getCourts());
    setOffice(StorageService.getOffice());
    setLawyers(StorageService.getLawyers());
    setSettings(StorageService.getSettings());
    const storedLic = StorageService.getLicense();
    if (storedLic) setLicense(storedLic);
    const storedUser = StorageService.getCurrentUser();
    if (storedUser) setCurrentUser(storedUser);

    StorageService.syncFromSqliteServer().then((serverData) => {
      if (serverData) {
        if (serverData.cases) setCases(serverData.cases);
        if (serverData.sessions) setSessions(serverData.sessions);
        if (serverData.clients) setClients(serverData.clients);
        if (serverData.finance) setFinance(serverData.finance);
        if (serverData.documents) setDocuments(serverData.documents);
        if (serverData.tasks) setTasks(serverData.tasks);
        if (serverData.courts) setCourts(serverData.courts);
        if (serverData.office) setOffice(serverData.office);
        if (serverData.lawyers) {
          setLawyers(serverData.lawyers);
          if (serverData.lawyers.length > 0) {
            setCurrentLawyer(serverData.lawyers[0]);
          }
        }
        if (serverData.settings) setSettings(serverData.settings);
        if (serverData.license) setLicense(serverData.license);
        if (serverData.user) setCurrentUser(serverData.user);
      }
    });
  };

  useEffect(() => {
    StorageService.fetchLicenseStatus().then((status) => {
      if (status.license) setLicense(status.license);
      if (status.user) setCurrentUser(status.user);
      setIsCheckingLicense(false);
    }).catch(() => {
      setIsCheckingLicense(false);
    });
    refreshAllData();
  }, []);

  const handleActivated = (newLicense: AppLicense, newUser: UserAccount, newOffice?: OfficeProfile) => {
    setLicense(newLicense);
    setCurrentUser(newUser);
    if (newOffice) {
      setOffice(newOffice);
      StorageService.saveOffice(newOffice);
    }
    refreshAllData();
  };

  const handleLogin = (loggedUser: UserAccount) => {
    setCurrentUser(loggedUser);
    refreshAllData();
  };

  const handleLogout = () => {
    StorageService.saveCurrentUser(null);
    setCurrentUser(null);
  };

  // Modal States
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<LegalCase | null>(null);

  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [recordingSession, setRecordingSession] = useState<Session | null>(null);
  const [defaultCaseIdForSession, setDefaultCaseIdForSession] = useState<string | undefined>();

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [portalClient, setPortalClient] = useState<Client | null>(null);

  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [viewingVoucher, setViewingVoucher] = useState<FinancialRecord | null>(null);

  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [defaultCaseIdForDocument, setDefaultCaseIdForDocument] = useState<string | undefined>();
  const [previewingDoc, setPreviewingDoc] = useState<LegalDocument | null>(null);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [externalAlertsQueue, setExternalAlertsQueue] = useState<ExternalAlertItem[]>([]);

  // Register Service Worker for external notifications on mount
  useEffect(() => {
    NotificationEngine.registerServiceWorker();
  }, []);

  // Dispatch external notifications (OS / Browser + Android Heads-Up + Sound)
  const dispatchExternalAlerts = (alertsToDispatch: ExternalAlertItem[], currentSettings: AppSettings) => {
    if (alertsToDispatch.length === 0) return;

    setExternalAlertsQueue((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const uniqueNew = alertsToDispatch.filter((a) => !existingIds.has(a.id));
      return [...uniqueNew, ...prev];
    });

    if (currentSettings.enableSoundAlerts !== false) {
      const hasCritical = alertsToDispatch.some((a) => a.urgency === 'critical');
      NotificationEngine.playNotificationSound(hasCritical ? 'critical' : 'warning');
    }

    // Also dispatch to native OS/Browser Notification API outside the app window
    alertsToDispatch.slice(0, 3).forEach((alertItem) => {
      NotificationEngine.dispatchNativeOSNotification(alertItem);
    });
  };

  // Evaluate upcoming sessions and expiring POAs automatically based on configured settings
  useEffect(() => {
    if (settings.enableExternalNotifications === false) return;
    if (sessions.length === 0 && clients.length === 0) return;

    const runCheck = (forceAll = false) => {
      const evaluated = NotificationEngine.evaluateAlerts(sessions, clients, settings);
      const newOnes = NotificationEngine.getNewAlertsToDispatch(evaluated, forceAll);
      if (newOnes.length > 0) {
        dispatchExternalAlerts(newOnes, settings);
      }
    };

    const initialTimer = setTimeout(() => runCheck(false), 1200);
    const interval = setInterval(() => runCheck(false), 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [sessions, clients, settings]);

  const handleTriggerAllDueExternalAlerts = () => {
    const evaluated = NotificationEngine.evaluateAlerts(sessions, clients, settings);
    if (evaluated.length > 0) {
      dispatchExternalAlerts(evaluated, settings);
    } else {
      handleTriggerTestExternalAlert();
    }
  };

  const handleTriggerTestExternalAlert = () => {
    const testAlert: ExternalAlertItem = {
      id: `test-ext-${Date.now()}`,
      type: 'session_upcoming',
      title: `🔔 إشعار خارجي نشط (قبل الجلسة بـ ${settings.sessionAlertBeforeHours ?? 24} ساعة / الوكالة بـ ${settings.poaExpiryWarningDays ?? 14} يوم)`,
      body: `نظام الإنذار الخارجي يعمل بنجاح وفق إعداداتك لتنبيهك بمواعيد الجلسات وانتهاء صلاحية الوكالات القضائية.`,
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      urgency: 'critical',
    };
    dispatchExternalAlerts([testAlert], settings);
  };

  const handleOpenExternalAlertTarget = (alertItem: ExternalAlertItem) => {
    setExternalAlertsQueue((prev) => prev.filter((a) => a.id !== alertItem.id));
    if (alertItem.sessionId) {
      const targetSess = sessions.find((s) => s.id === alertItem.sessionId);
      if (targetSess) {
        setRecordingSession(targetSess);
        return;
      }
      setActiveTab('sessions');
    } else if (alertItem.clientId) {
      const targetClient = clients.find((c) => c.id === alertItem.clientId);
      if (targetClient) {
        setPortalClient(targetClient);
        return;
      }
      setActiveTab('clients');
    } else {
      setIsNotificationsOpen(true);
    }
  };

  // Computations for alerts
  const nowObj = new Date();
  const todayStr = nowObj.toISOString().split('T')[0];
  const alertHoursWindow = settings.sessionAlertBeforeHours ?? 24;
  const urgentSessionsCount = sessions.filter((s) => {
    if (s.status !== 'scheduled') return false;
    if (s.date === todayStr) return true;
    const [h, m] = (s.time || '10:00').split(':').map(Number);
    const sessDate = new Date(`${s.date}T00:00:00`);
    sessDate.setHours(h || 10, m || 0, 0, 0);
    const diffHours = (sessDate.getTime() - nowObj.getTime()) / (1000 * 60 * 60);
    return diffHours >= -4 && diffHours <= alertHoursWindow;
  }).length;

  let expiringPoasCount = 0;
  clients.forEach((c) => {
    c.poas.forEach((p) => {
      const d = getDaysRemaining(p.expiryDate);
      if (d <= (settings.poaExpiryWarningDays || 14)) expiringPoasCount++;
    });
  });

  // --- Handlers ---
  const handleSaveCase = (caseData: Partial<LegalCase>) => {
    let updated: LegalCase[];
    if (caseData.id) {
      updated = cases.map((c) => (c.id === caseData.id ? ({ ...c, ...caseData } as LegalCase) : c));
    } else {
      const newCase: LegalCase = {
        ...caseData,
        id: `case-${Date.now()}`,
      } as LegalCase;
      updated = [newCase, ...cases];
    }
    setCases(updated);
    StorageService.saveCases(updated);
    if (selectedCaseDetail && selectedCaseDetail.id === caseData.id) {
      setSelectedCaseDetail(updated.find((c) => c.id === caseData.id) || null);
    }
  };

  const handleDeleteCase = (caseId: string) => {
    const updated = cases.filter((c) => c.id !== caseId);
    setCases(updated);
    StorageService.saveCases(updated);
    if (selectedCaseDetail?.id === caseId) setSelectedCaseDetail(null);
  };

  const handleUpdateCaseStage = (caseId: string, stage: LitigationStage) => {
    const updated = cases.map((c) => (c.id === caseId ? { ...c, litigationStage: stage } : c));
    setCases(updated);
    StorageService.saveCases(updated);
    if (selectedCaseDetail?.id === caseId) {
      setSelectedCaseDetail({ ...selectedCaseDetail, litigationStage: stage });
    }
  };

  const handleUpdateCaseStatus = (caseId: string, status: CaseStatus) => {
    const updated = cases.map((c) => (c.id === caseId ? { ...c, status } : c));
    setCases(updated);
    StorageService.saveCases(updated);
    if (selectedCaseDetail?.id === caseId) {
      setSelectedCaseDetail({ ...selectedCaseDetail, status });
    }
  };

  const handleSaveSession = (sessionData: Partial<Session>) => {
    let updated: Session[];
    if (sessionData.id) {
      updated = sessions.map((s) => (s.id === sessionData.id ? ({ ...s, ...sessionData } as Session) : s));
    } else {
      const newSession: Session = {
        ...sessionData,
        id: `sess-${Date.now()}`,
      } as Session;
      updated = [newSession, ...sessions];
    }
    setSessions(updated);
    StorageService.saveSessions(updated);
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    StorageService.saveSessions(updated);
  };

  const handleSaveSessionDecision = (
    sessionId: string,
    decisionNotes: string,
    status: SessionStatus,
    nextSessionDate?: string
  ) => {
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          decisionNotes,
          status,
          nextSessionDate,
        };
      }
      return s;
    });

    if (nextSessionDate) {
      const original = sessions.find((s) => s.id === sessionId);
      if (original) {
        const nextSession: Session = {
          id: `sess-${Date.now()}`,
          caseId: original.caseId,
          caseNumber: original.caseNumber,
          caseTitle: original.caseTitle,
          clientId: original.clientId,
          clientName: original.clientName,
          court: original.court,
          hall: original.hall,
          date: nextSessionDate,
          time: '10:00',
          sessionType: 'مرافعة',
          requirements: 'جلسة محددة بناءً على قرار المحكمة السابق',
          status: 'scheduled',
          remindersSent: { before24h: false, before2h: false },
        };
        updated.push(nextSession);
      }
    }

    setSessions(updated);
    StorageService.saveSessions(updated);
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    let updated: Client[];
    if (clientData.id) {
      updated = clients.map((c) => (c.id === clientData.id ? ({ ...c, ...clientData } as Client) : c));
    } else {
      const newClient: Client = {
        ...clientData,
        id: `c-${Date.now()}`,
      } as Client;
      updated = [newClient, ...clients];
    }
    setClients(updated);
    StorageService.saveClients(updated);
  };

  const handleDeleteClient = (clientId: string) => {
    const updated = clients.filter((c) => c.id !== clientId);
    setClients(updated);
    StorageService.saveClients(updated);
  };

  const handleSaveVoucher = (recData: Partial<FinancialRecord>) => {
    const newRecord: FinancialRecord = {
      ...recData,
      id: `fin-${Date.now()}`,
    } as FinancialRecord;
    const updated = [newRecord, ...finance];
    setFinance(updated);
    StorageService.saveFinance(updated);
  };

  const handleDeleteVoucher = (id: string) => {
    const updated = finance.filter((f) => f.id !== id);
    setFinance(updated);
    StorageService.saveFinance(updated);
  };

  const handleSaveDocument = (savedDoc: LegalDocument) => {
    // Document is already safely persisted into SQLite with its real binary blob
    const updated = [
      savedDoc,
      ...documents.filter((d) => d.id !== savedDoc.id),
    ];
    setDocuments(updated);
    StorageService.saveDocuments(updated);
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    StorageService.saveDocuments(updated);
    StorageService.deleteDocumentFromSqlite(id);
  };

  const handleSaveTask = (taskData: Partial<LegalTask>) => {
    const newTask: LegalTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    } as LegalTask;
    const updated = [newTask, ...tasks];
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleUpdateTaskProgress = (taskId: string, progress: number, status: TaskStatus) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, progressPercentage: progress, status } : t
    );
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleAddTaskComment = (taskId: string, text: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const newCm = {
          id: `cm-${Date.now()}`,
          authorName: currentLawyer.name,
          authorRole: currentLawyer.role.split(' ')[0],
          text,
          createdAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        };
        return {
          ...t,
          comments: [...t.comments, newCm],
        };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const handleSaveCourt = (courtData: CourtInfo) => {
    const exists = courts.some((c) => c.id === courtData.id);
    const updated = exists
      ? courts.map((c) => (c.id === courtData.id ? courtData : c))
      : [courtData, ...courts];
    setCourts(updated);
    StorageService.saveCourts(updated);
  };

  const handleDeleteCourt = (courtId: string) => {
    const updated = courts.filter((c) => c.id !== courtId);
    setCourts(updated);
    StorageService.saveCourts(updated);
  };

  // If app is not activated or user not logged in, enforce the purchase code activation & account creation gatekeeper!
  if (!license.isActivated || !currentUser) {
    return (
      <AndroidDeviceFrame urgentAlertsCount={0}>
        <div className="w-full h-full flex flex-col relative bg-slate-950">
          <AndroidStatusBar urgentAlertsCount={0} />
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ActivationGatekeeper
              onActivated={handleActivated}
              onLogin={handleLogin}
            />
          </div>
          <AndroidSystemBar />
        </div>
      </AndroidDeviceFrame>
    );
  }

  return (
    <AndroidDeviceFrame urgentAlertsCount={urgentSessionsCount + expiringPoasCount}>
      <div className="w-full h-full flex flex-col relative bg-[#F8FAFC]">
        {/* Android Native Status Bar */}
        <AndroidStatusBar
          urgentAlertsCount={urgentSessionsCount + expiringPoasCount}
          onTriggerExternalBanner={handleTriggerAllDueExternalAlerts}
        />

        {/* External OS / Android Heads-Up Notification Banner */}
        <ExternalNotificationBanner
          alertsQueue={externalAlertsQueue}
          onDismissCurrent={() => setExternalAlertsQueue((prev) => prev.slice(1))}
          onDismissAll={() => setExternalAlertsQueue([])}
          onOpenAlertTarget={handleOpenExternalAlertTarget}
        />

        {/* Top Mobile App Bar */}
        <Header
          currentLawyer={currentLawyer}
          setCurrentLawyer={setCurrentLawyer}
          lawyers={lawyers}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setActiveTab('settings')}
          urgentSessionsCount={urgentSessionsCount}
          expiringPoasCount={expiringPoasCount}
        />

        {/* Dynamic Main Body Scroll Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#F8FAFC]">
          {activeTab === 'dashboard' && (
            <DashboardView
              cases={cases}
              sessions={sessions}
              clients={clients}
              finance={finance}
              tasks={tasks}
              setActiveTab={setActiveTab}
              onOpenSessionDetails={(s) => setRecordingSession(s)}
              onOpenCaseDetails={(c) => setSelectedCaseDetail(c)}
            />
          )}

          {activeTab === 'cases' && (
            <CasesView
              cases={cases}
              sessions={sessions}
              clients={clients}
              onOpenAddCase={() => {
                setEditingCase(null);
                setIsAddCaseOpen(true);
              }}
              onEditCase={(c) => {
                setEditingCase(c);
                setIsAddCaseOpen(true);
              }}
              onDeleteCase={handleDeleteCase}
              onSelectCase={(c) => setSelectedCaseDetail(c)}
              onOpenNewSessionForCase={(cId) => {
                setDefaultCaseIdForSession(cId);
                setIsAddSessionOpen(true);
              }}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsView
              sessions={sessions}
              cases={cases}
              clients={clients}
              onOpenAddSession={() => {
                setEditingSession(null);
                setDefaultCaseIdForSession(undefined);
                setIsAddSessionOpen(true);
              }}
              onEditSession={(s) => {
                setEditingSession(s);
                setIsAddSessionOpen(true);
              }}
              onDeleteSession={handleDeleteSession}
              onRecordDecision={(s) => setRecordingSession(s)}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              cases={cases}
              onOpenAddClient={() => {
                setEditingClient(null);
                setIsAddClientOpen(true);
              }}
              onEditClient={(client) => {
                setEditingClient(client);
                setIsAddClientOpen(true);
              }}
              onDeleteClient={handleDeleteClient}
              onOpenClientPortal={(client) => setPortalClient(client)}
              onSelectCase={(c) => setSelectedCaseDetail(c)}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              finance={finance}
              office={office}
              onOpenAddVoucher={() => setIsAddVoucherOpen(true)}
              onViewVoucher={(voucher) => setViewingVoucher(voucher)}
              onDeleteVoucher={handleDeleteVoucher}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onOpenAddDocument={() => setIsAddDocumentOpen(true)}
              onPreviewDocument={(doc) => setPreviewingDoc(doc)}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              currentLawyer={currentLawyer}
              onOpenAddTask={() => setIsAddTaskOpen(true)}
              onUpdateTaskProgress={handleUpdateTaskProgress}
              onAddComment={handleAddTaskComment}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              cases={cases}
              sessions={sessions}
              clients={clients}
              finance={finance}
              tasks={tasks}
              office={office}
              onRefreshData={refreshAllData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              office={office}
              settings={settings}
              lawyers={lawyers}
              cases={cases}
              sessions={sessions}
              clients={clients}
              finance={finance}
              documents={documents}
              tasks={tasks}
              currentUser={currentUser}
              license={license}
              onUpdateOffice={(updatedOffice) => {
                setOffice(updatedOffice);
                StorageService.saveOffice(updatedOffice);
              }}
              onUpdateSettings={(updatedSettings) => {
                setSettings(updatedSettings);
                StorageService.saveSettings(updatedSettings);
              }}
              onUpdateLawyers={(updatedLawyers) => {
                setLawyers(updatedLawyers);
                StorageService.saveLawyers(updatedLawyers);
              }}
              onRefreshData={refreshAllData}
              onTriggerTestExternalAlert={handleTriggerTestExternalAlert}
              onTriggerAllDueExternalAlerts={handleTriggerAllDueExternalAlerts}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Quick Action Floating Action Button (FAB) */}
        <QuickActionsFAB
          onAddCase={() => {
            setEditingCase(null);
            setIsAddCaseOpen(true);
          }}
          onAddSession={() => {
            setEditingSession(null);
            setDefaultCaseIdForSession(undefined);
            setIsAddSessionOpen(true);
          }}
          onAddClient={() => {
            setEditingClient(null);
            setIsAddClientOpen(true);
          }}
          onAddVoucher={() => setIsAddVoucherOpen(true)}
          onAddDocument={() => setIsAddDocumentOpen(true)}
          onAddTask={() => setIsAddTaskOpen(true)}
          onAddCourt={() => setIsAddCourtOpen(true)}
        />

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          urgentSessionsCount={urgentSessionsCount}
        />

        {/* Android System Navigation Gesture Bar */}
        <AndroidSystemBar onHome={() => setActiveTab('dashboard')} />

        {/* MODALS & DRAWERS */}
        <CaseDetailModal
          legalCase={selectedCaseDetail}
          onClose={() => setSelectedCaseDetail(null)}
          sessions={sessions}
          documents={documents}
          finance={finance}
          onEditCase={(c) => {
            setEditingCase(c);
            setIsAddCaseOpen(true);
          }}
          onDeleteCase={handleDeleteCase}
          onAddSessionForCase={(cId) => {
            setDefaultCaseIdForSession(cId);
            setIsAddSessionOpen(true);
          }}
          onAddDocumentForCase={(cId) => {
            setDefaultCaseIdForDocument(cId);
            setIsAddDocumentOpen(true);
          }}
          onPreviewDocument={(doc) => setPreviewingDoc(doc)}
          onDeleteDocument={handleDeleteDocument}
          onUpdateCaseStage={handleUpdateCaseStage}
          onUpdateCaseStatus={handleUpdateCaseStatus}
        />

        <AddCaseModal
          isOpen={isAddCaseOpen}
          onClose={() => setIsAddCaseOpen(false)}
          onSave={handleSaveCase}
          clients={clients}
          courts={courts}
          onOpenAddCourt={() => {
            setIsAddCaseOpen(false);
            setIsAddCourtOpen(true);
          }}
          initialData={editingCase}
        />

        <AddCourtModal
          isOpen={isAddCourtOpen}
          onClose={() => setIsAddCourtOpen(false)}
          courts={courts}
          onSaveCourt={handleSaveCourt}
          onDeleteCourt={handleDeleteCourt}
        />

        <AddSessionModal
          isOpen={isAddSessionOpen}
          onClose={() => setIsAddSessionOpen(false)}
          onSave={handleSaveSession}
          cases={cases}
          clients={clients}
          initialData={editingSession}
          defaultCaseId={defaultCaseIdForSession}
        />

        <RecordSessionModal
          session={recordingSession}
          onClose={() => setRecordingSession(null)}
          onSaveDecision={handleSaveSessionDecision}
        />

        <AddClientModal
          isOpen={isAddClientOpen}
          onClose={() => setIsAddClientOpen(false)}
          onSave={handleSaveClient}
          initialData={editingClient}
        />

        <ClientPortalModal
          client={portalClient}
          cases={cases}
          sessions={sessions}
          finance={finance}
          onClose={() => setPortalClient(null)}
        />

        <AddVoucherModal
          isOpen={isAddVoucherOpen}
          onClose={() => setIsAddVoucherOpen(false)}
          onSave={handleSaveVoucher}
          cases={cases}
          clients={clients}
        />

        <OfficialVoucherModal
          voucher={viewingVoucher}
          office={office}
          onClose={() => setViewingVoucher(null)}
        />

        <AddDocumentModal
          isOpen={isAddDocumentOpen}
          onClose={() => {
            setIsAddDocumentOpen(false);
            setDefaultCaseIdForDocument(undefined);
          }}
          onSave={handleSaveDocument}
          cases={cases}
          clients={clients}
          defaultCaseId={defaultCaseIdForDocument}
        />

        <DocumentPreviewModal
          document={previewingDoc}
          onClose={() => setPreviewingDoc(null)}
          onDelete={handleDeleteDocument}
        />

        <AddTaskModal
          isOpen={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
          onSave={handleSaveTask}
          cases={cases}
        />

        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          sessions={sessions}
          clients={clients}
          tasks={tasks}
          cases={cases}
          settings={settings}
          onSelectSession={(s) => {
            setIsNotificationsOpen(false);
            setRecordingSession(s);
          }}
          onSelectClient={(c) => {
            setIsNotificationsOpen(false);
            setPortalClient(c);
          }}
          onTriggerExternalBroadcast={handleTriggerAllDueExternalAlerts}
          onOpenSettings={() => setActiveTab('settings')}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          cases={cases}
          clients={clients}
          sessions={sessions}
          documents={documents}
          onSelectCase={(c) => setSelectedCaseDetail(c)}
          onSelectClient={(c) => setPortalClient(c)}
          onSelectSession={(s) => setRecordingSession(s)}
          onSelectDocument={(d) => setPreviewingDoc(d)}
        />
      </div>
    </AndroidDeviceFrame>
  );
}
