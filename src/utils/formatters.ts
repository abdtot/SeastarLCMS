import { Session } from '../types';

const getCurrencySettings = (): { symbol: string; name: string } => {
  try {
    const raw = localStorage.getItem('seastar_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.currencySymbol && parsed.currencyName) {
        return { symbol: parsed.currencySymbol, name: parsed.currencyName };
      }
    }
  } catch {
    // ignore
  }
  return { symbol: 'ر.ي', name: 'ريال يمني' };
};

export const formatCurrency = (amount: number): string => {
  const { symbol } = getCurrencySettings();
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
  return `${formattedNumber} ${symbol}`;
};

export const formatDateArabic = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const getDaysRemaining = (targetDateStr: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDaysRemainingLabel = (days: number): { text: string; color: string; badge: string } => {
  if (days < 0) {
    return { text: `منتهية منذ ${Math.abs(days)} يوم`, color: 'text-red-400', badge: 'bg-red-500/20 text-red-600 border-red-500/30' };
  }
  if (days === 0) {
    return { text: 'تنتهي اليوم!', color: 'text-red-500 font-bold', badge: 'bg-red-500/30 text-red-700 border-red-500' };
  }
  if (days === 1) {
    return { text: 'تنتهي غداً!', color: 'text-amber-500 font-bold', badge: 'bg-amber-500/20 text-amber-800 border-amber-500/40' };
  }
  if (days <= 7) {
    return { text: `متبقي ${days} أيام (عاجل)`, color: 'text-amber-500', badge: 'bg-amber-500/20 text-amber-800 border-amber-500/30' };
  }
  if (days <= 30) {
    return { text: `متبقي ${days} يوماً`, color: 'text-blue-500', badge: 'bg-blue-500/20 text-blue-800 border-blue-500/30' };
  }
  return { text: `سارية (${Math.floor(days / 30)} شهر)`, color: 'text-emerald-500', badge: 'bg-emerald-500/20 text-emerald-800 border-emerald-500/30' };
};

// Check for session conflicts (same date, within 50 mins of each other)
export const detectSessionConflicts = (sessions: Session[]): { session1: Session; session2: Session; reason: string }[] => {
  try {
    const raw = localStorage.getItem('seastar_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.enableConflictDetection === false) return [];
    }
  } catch {
    // ignore
  }

  const conflicts: { session1: Session; session2: Session; reason: string }[] = [];
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');

  for (let i = 0; i < scheduledSessions.length; i++) {
    for (let j = i + 1; j < scheduledSessions.length; j++) {
      const s1 = scheduledSessions[i];
      const s2 = scheduledSessions[j];

      if (s1.date === s2.date) {
        const [h1, m1] = s1.time.split(':').map(Number);
        const [h2, m2] = s2.time.split(':').map(Number);
        const mins1 = h1 * 60 + m1;
        const mins2 = h2 * 60 + m2;
        const diff = Math.abs(mins1 - mins2);

        if (diff <= 50) {
          conflicts.push({
            session1: s1,
            session2: s2,
            reason: s1.court !== s2.court
              ? `تعارض محاكم: جلستان في محكمتين مختلفتين (${s1.court} و ${s2.court}) بفارق ${diff} دقيقة فقط!`
              : `تعارض توقيت: جلستان في نفس المحكمة بفارق ${diff} دقيقة فقط!`,
          });
        }
      }
    }
  }

  return conflicts;
};

// Generate pre-written WhatsApp message for hearing reminders
export const generateWhatsAppSessionReminder = (session: Session, clientPhone?: string): string => {
  const text = `السلام عليكم ورحمة الله وبركاته،
سعادة الموكل المكرم: ${session.clientName}

نود تذكيركم بموعد الجلسة القضائية القادمة من مكتب سيتار للمحاماة:
⚖️ القضية: ${session.caseTitle} (رقم: ${session.caseNumber})
🏛️ المحكمة: ${session.court}
📍 القاعة/الدائرة: ${session.hall}
📅 التاريخ: ${session.date}
⏰ التوقيت: ${session.time}
📝 المطلوب بالجلسة: ${session.requirements || 'لا يوجد متطلبات إضافية'}

فريق العمل القانوني جاهز ومتابع للملف، في حال وجود أي استفسار يرجى التواصل معنا.`;

  const phone = clientPhone ? clientPhone.replace(/[^0-9]/g, '') : '';
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// Generate WhatsApp message for POA renewal reminder
export const generateWhatsAppPoaReminder = (clientName: string, poaNumber: string, expiryDate: string, clientPhone?: string): string => {
  const text = `السلام عليكم ورحمة الله وبركاته،
الموكل العزيز: ${clientName}

نحيطكم علماً بأن الوكالة القضائية رقم (${poaNumber}) المعتمدة لمكتب سيتار للمحاماة ستنتهي صلاحيتها بتاريخ: ${expiryDate}.
حفاظاً على سير إجراءات قضاياكم دون تعليق أو تأجيل، يرجى التفضل بتجديد الوكالة وإفادتنا برقم الوكالة الجديد.

شاكرين لكم حسن تعاونكم.
مكتب سيتار للمحاماة والاستشارات القانونية`;

  const phone = clientPhone ? clientPhone.replace(/[^0-9]/g, '') : '';
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// Helper for Arabic number to words (تفقيط الأرقام بالريال اليمني)
const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

const convertThreeDigits = (n: number): string => {
  if (n === 0) return '';
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rem = n % 100;

  if (h > 0) parts.push(hundreds[h]);

  if (rem > 0) {
    if (rem < 20) {
      parts.push(ones[rem]);
    } else {
      const u = rem % 10;
      const t = Math.floor(rem / 10);
      if (u > 0) {
        parts.push(`${ones[u]} و${tens[t]}`);
      } else {
        parts.push(tens[t]);
      }
    }
  }

  return parts.join(' و');
};

export const numberToArabicWords = (num: number): string => {
  const { name: currencyName } = getCurrencySettings();
  const n = Math.round(Math.abs(num || 0));
  if (n === 0) return `صفر ${currencyName}`;

  const parts: string[] = [];
  const millions = Math.floor(n / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(`${ones[millions]} ملايين`);
    else parts.push(`${convertThreeDigits(millions)} مليون`);
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(`${ones[thousands]} آلاف`);
    else parts.push(`${convertThreeDigits(thousands)} ألف`);
  }

  if (remainder > 0) {
    parts.push(convertThreeDigits(remainder));
  }

  return `${parts.join(' و')} ${currencyName} فقط لا غير`;
};
