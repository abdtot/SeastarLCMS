import {
  Session,
  Client,
  AppSettings,
  ExternalAlertItem
} from '../types/index.ts';
import {
  getDaysRemaining,
  detectSessionConflicts,
  generateWhatsAppSessionReminder,
  generateWhatsAppPoaReminder
} from '../utils/formatters.ts';

const DISPATCHED_STORAGE_KEY = 'seastar_dispatched_external_alerts';

export const NotificationEngine = {
  // 1. Register Service Worker for Android / Desktop Push Notifications
  registerServiceWorker: async (): Promise<ServiceWorkerRegistration | null> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      return reg;
    } catch {
      return null;
    }
  },

  // 2. Check Browser Notification API permission status
  getPermissionStatus: (): 'granted' | 'denied' | 'default' | 'unsupported' => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  // 3. Request Browser Notification API permission
  requestPermission: async (): Promise<'granted' | 'denied' | 'default' | 'unsupported'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch {
      return Notification.permission;
    }
  },

  // 4. Synthesize subtle notification chime using Web Audio API
  playNotificationSound: (urgency: 'critical' | 'warning' | 'info' = 'warning') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(urgency === 'critical' ? 880 : 659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(urgency === 'critical' ? 1174.66 : 880, now + 0.18);

      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.45);
    } catch {
      // AudioContext might be blocked before user interaction
    }
  },

  // 5. Dispatch native OS/Browser notification (outside app window)
  dispatchNativeOSNotification: async (alert: ExternalAlertItem): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission !== 'granted') {
      return false;
    }

    const options: NotificationOptions = {
      body: alert.body,
      dir: 'rtl',
      lang: 'ar',
      tag: alert.id,
      silent: false,
    };

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(alert.title, options);
          return true;
        }
      }
      new Notification(alert.title, options);
      return true;
    } catch {
      return false;
    }
  },

  // 6. Evaluate all sessions & POAs against user-configured settings
  evaluateAlerts: (
    sessions: Session[],
    clients: Client[],
    settings: AppSettings
  ): ExternalAlertItem[] => {
    const alerts: ExternalAlertItem[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const alertHoursThreshold = settings.sessionAlertBeforeHours ?? 24;
    const secondAlertMinsThreshold = settings.sessionSecondAlertMinutes ?? 120;
    const poaWarningDays = settings.poaExpiryWarningDays ?? 14;

    // A. Check upcoming sessions based on configured hours/minutes
    const scheduledSessions = sessions.filter((s) => s.status === 'scheduled');
    for (const sess of scheduledSessions) {
      const [h, m] = (sess.time || '10:00').split(':').map(Number);
      const sessDateObj = new Date(`${sess.date}T00:00:00`);
      sessDateObj.setHours(h || 10, m || 0, 0, 0);

      const diffMs = sessDateObj.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffMinutes = diffMs / (1000 * 60);

      const isToday = sess.date === todayStr;
      const client = clients.find((c) => c.id === sess.clientId);

      // If session is today or within configured alert hours window
      if (isToday || (diffHours >= -4 && diffHours <= alertHoursThreshold)) {
        const isImmediate = diffMinutes > -120 && diffMinutes <= secondAlertMinsThreshold;
        const timeBadge = isToday
          ? `اليوم الساعة ${sess.time}`
          : `بتاريخ ${sess.date} الساعة ${sess.time} (خلال أقل من ${alertHoursThreshold} ساعة)`;

        alerts.push({
          id: `ext-sess-${sess.id}-${todayStr}`,
          type: 'session_upcoming',
          title: isImmediate
            ? `🔔 تنبيه جلسة عاجل (${sess.time}) - قضية #${sess.caseNumber}`
            : `⚖️ تذكير بموعد جلسة قادمة - قضية #${sess.caseNumber}`,
          body: `${sess.caseTitle} • ${sess.court} (${sess.hall}) • الموعد: ${timeBadge}`,
          timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
          urgency: isImmediate || isToday ? 'critical' : 'warning',
          whatsappUrl: generateWhatsAppSessionReminder(sess, client?.phone),
          sessionId: sess.id,
        });
      }
    }

    // B. Check POA expirations based on configured poaExpiryWarningDays
    for (const client of clients) {
      for (const poa of client.poas || []) {
        const daysLeft = getDaysRemaining(poa.expiryDate);
        if (daysLeft <= poaWarningDays) {
          const statusText =
            daysLeft < 0
              ? `منتهية منذ ${Math.abs(daysLeft)} يوم`
              : daysLeft === 0
              ? 'تنتهي اليوم!'
              : `متبقي ${daysLeft} أيام على انتهائها`;

          alerts.push({
            id: `ext-poa-${poa.id}-${todayStr}`,
            type: 'poa_expiring',
            title: `⚠️ تنبيه صلاحية وكالة قضائية (#${poa.poaNumber})`,
            body: `الموكل: ${client.fullName} • الحالة: ${statusText} (تاريخ الانتهاء: ${poa.expiryDate})`,
            timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
            urgency: daysLeft <= 3 ? 'critical' : 'warning',
            whatsappUrl: generateWhatsAppPoaReminder(
              client.fullName,
              poa.poaNumber,
              poa.expiryDate,
              client.phone
            ),
            clientId: client.id,
          });
        }
      }
    }

    // C. Check session conflicts if enabled in settings
    if (settings.enableConflictDetection !== false) {
      const conflicts = detectSessionConflicts(sessions);
      conflicts.forEach((conf, idx) => {
        alerts.push({
          id: `ext-conf-${conf.session1.id}-${conf.session2.id}-${todayStr}-${idx}`,
          type: 'session_conflict',
          title: `🚨 تحذير تعارض مواعيد جلسات قضائية!`,
          body: conf.reason,
          timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
          urgency: 'critical',
          sessionId: conf.session1.id,
        });
      });
    }

    return alerts;
  },

  // 7. Filter only undispatched alerts (or all if force=true) and mark as dispatched
  getNewAlertsToDispatch: (
    alerts: ExternalAlertItem[],
    forceAll = false
  ): ExternalAlertItem[] => {
    if (forceAll) return alerts;
    try {
      const raw = localStorage.getItem(DISPATCHED_STORAGE_KEY);
      const dispatchedIds: string[] = raw ? JSON.parse(raw) : [];
      const newOnes = alerts.filter((a) => !dispatchedIds.includes(a.id));
      if (newOnes.length > 0) {
        const updated = Array.from(new Set([...dispatchedIds, ...newOnes.map((a) => a.id)])).slice(-100);
        localStorage.setItem(DISPATCHED_STORAGE_KEY, JSON.stringify(updated));
      }
      return newOnes;
    } catch {
      return alerts;
    }
  },

  clearDispatchedHistory: () => {
    try {
      localStorage.removeItem(DISPATCHED_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
