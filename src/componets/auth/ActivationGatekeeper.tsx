import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  FileCheck,
  Loader2,
  LogIn
} from 'lucide-react';
import { PurchaseCode, AppLicense, UserAccount, OfficeProfile } from '../../types';
import { StorageService } from '../../services/storage';
import { normalizePurchaseCode, isValidPurchaseCodeFormat } from '../../services/purchaseCodes';

interface ActivationGatekeeperProps {
  onActivated: (license: AppLicense, user: UserAccount, office?: OfficeProfile) => void;
  onLogin: (user: UserAccount) => void;
}

export const ActivationGatekeeper: React.FC<ActivationGatekeeperProps> = ({
  onActivated,
  onLogin,
}) => {
  // Step: 'code' | 'account' | 'login'
  const [step, setStep] = useState<'code' | 'account' | 'login'>('code');

  // Step 1: Code Verification State
  const [inputCode, setInputCode] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);

  // Step 2: Account Creation Form State
  const [formData, setFormData] = useState({
    name: '',
    firmName: '',
    licenseNumber: '',
    email: '',
    phone: '',
    city: 'صنعاء',
    password: '',
  });
  const [isActivating, setIsActivating] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Format code on typing (auto uppercase & clean)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    setInputCode(raw);
    setCodeError(null);
    setCodeSuccess(null);
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const target = normalizePurchaseCode(codeToVerify || inputCode);
    if (!target) {
      setCodeError('يرجى إدخال كود الشراء أولاً');
      return;
    }

    setIsVerifying(true);
    setCodeError(null);
    setCodeSuccess(null);

    try {
      const res = await StorageService.verifyPurchaseCode(target);
      if (res.ok) {
        setVerifiedCode(target);
        setCodeSuccess('تم التحقق بنجاح من كود الشراء! جاري الانتقال لإنشاء الحساب...');
        setTimeout(() => {
          setStep('account');
        }, 700);
      } else {
        setCodeError(res.message || 'كود الشراء غير صالح أو مستخدم مسبقاً');
      }
    } catch (err: any) {
      setCodeError(err?.message || 'تعذر الاتصال بخادم التحقق من التراخيص');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateAccountAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedCode) {
      setAccountError('لم يتم التحقق من كود الشراء');
      return;
    }
    if (!formData.name.trim()) {
      setAccountError('يرجى إدخال الاسم الكامل للمحامي');
      return;
    }
    if (!formData.firmName.trim()) {
      setAccountError('يرجى إدخال اسم مكتب المحاماة');
      return;
    }
    if (!formData.email.trim()) {
      setAccountError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setIsActivating(true);
    setAccountError(null);

    try {
      const res = await StorageService.activateAppLicense({
        code: verifiedCode,
        name: formData.name,
        firmName: formData.firmName,
        licenseNumber: formData.licenseNumber,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        password: formData.password,
      });

      if (res.ok && res.license && res.user) {
        onActivated(res.license, res.user, res.office);
      } else {
        setAccountError(res.error || 'فشل تفعيل النسخة وإنشاء الحساب');
      }
    } catch (err: any) {
      setAccountError(err?.message || 'حدث خطأ أثناء تفعيل النسخة');
    } finally {
      setIsActivating(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.ok && data.user) {
        StorageService.saveCurrentUser(data.user);
        onLogin(data.user);
      } else {
        setLoginError(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'فشل الاتصال بالخادم لتسجيل الدخول');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* Top Banner / Branding */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900/60 via-slate-900 to-slate-950 p-6 pt-10 text-center border-b border-indigo-950/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-600/30 mb-3 border border-indigo-400/30">
          <Scale className="w-8 h-8" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>نظام سيتار لإدارة مكاتب المحاماة والاستشارات</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            بوابة التفعيل والترخيص الرسمي
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            {step === 'code' && 'أدخل كود الشراء المعتمد لتفعيل نسختك القانونية لأول مرة'}
            {step === 'account' && 'قم بإنشاء حساب المدير والمحامي المسؤول للدخول إلى مكتبك'}
            {step === 'login' && 'تسجيل الدخول إلى حسابك القانوني المفعل مسبقاً'}
          </p>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="flex-1 p-4 sm:p-6 max-w-md mx-auto w-full flex flex-col justify-center">
        {/* STEP 1: ENTER PURCHASE CODE */}
        {step === 'code' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>كود الشراء والتفعيل السري</span>
                </label>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    value={inputCode}
                    onChange={handleCodeChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerifyCode();
                    }}
                    placeholder="SEASTAR-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3.5 text-center font-mono text-sm sm:text-base tracking-widest uppercase bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
                  />
                </div>

                <div className="text-[11px] text-slate-400 text-center px-1">
                  <span>الصيغة المعتمدة: SEASTAR-XXXX-XXXX-XXXX</span>
                </div>
              </div>

              {codeError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{codeError}</span>
                </div>
              )}

              {codeSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{codeSuccess}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleVerifyCode()}
                disabled={isVerifying || !inputCode.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق من كود الشراء...</span>
                  </>
                ) : (
                  <>
                    <span>التحقق من الكود والمتابعة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Login option for previously registered users */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>لديك حساب مفعل مسبقاً؟ تسجيل الدخول</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CREATE USER ACCOUNT & ACTIVATE */}
        {step === 'account' && (
          <form
            onSubmit={handleCreateAccountAndActivate}
            className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300"
          >
            {/* Verified Code Header Pill */}
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">كود الشراء المعتمد:</span>{' '}
                  <span className="font-mono font-bold tracking-wider">{verifiedCode}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('code')}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                تغيير
              </button>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3.5">
              <div className="border-b border-slate-800 pb-2 mb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>إنشاء حساب المدير والمحامي المسؤول</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  سيتم تهيئة ملف المكتب بالاسم والبيانات التالية مباشرة
                </p>
              </div>

              {/* Lawyer Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  اسم المحامي / المدير المسؤول *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: أ. د. طارق الشمري"
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Law Firm Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  اسم مكتب المحاماة / الشركة *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    placeholder="مثال: مكتب الشمري للمحاماة والاستشارات"
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* License Number & City */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    رقم الترخيص / القيد
                  </label>
                  <div className="relative">
                    <FileCheck className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="رقم القيد بوزارة العدل"
                      className="w-full pr-8 pl-2 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    المدينة / المقر
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="الرياض / صنعاء..."
                      className="w-full pr-8 pl-2 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    البريد الإلكتروني المهني *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="lawyer@office.com"
                      className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    رقم الجوال / الواتساب
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+966 50 123 4567"
                      className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  كلمة المرور / الرمز السري للحساب
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    dir="ltr"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {accountError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{accountError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isActivating}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تفعيل النسخة وإنشاء الحساب...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>تأكيد التفعيل والدخول إلى التطبيق</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('code')}
                className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 font-medium"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة لإدخال كود آخر</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: LOGIN WITH EXISTING ACCOUNT */}
        {step === 'login' && (
          <form
            onSubmit={handleLoginSubmit}
            className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300"
          >
            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <LogIn className="w-4 h-4 text-indigo-400" />
                  <span>تسجيل دخول المستخدم</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  للمستخدمين وأصحاب المكاتب المسجلين مسبقاً على هذا النظام
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  البريد الإلكتروني المسجل
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="lawyer@office.com"
                    className="w-full pr-9 pl-3 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    dir="ltr"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-3 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول والدخول إلى المكتب</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('code')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>لديك كود شراء جديد وتريد تفعيل حساب جديد؟</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer / System note */}
      <div className="p-4 text-center border-t border-slate-900 bg-slate-950 text-slate-500 text-[11px]">
        <span>نظام سيتار للمحاماة &copy; {new Date().getFullYear()} • حماية التراخيص المشفرة بقاعدة بيانات SQLite</span>
      </div>
    </div>
  );
};
