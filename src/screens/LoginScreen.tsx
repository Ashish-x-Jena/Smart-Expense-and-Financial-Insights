import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

export const LoginScreen: React.FC = () => {
  const { login, signup, loginWithOAuth, quickDemoLogin, authToastMessage } = useFinance();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // Password strength for signup
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const signupStrength = getPasswordStrength(password);

  // Validation routines
  const validateLoginForm = (): boolean => {
    const errs: Record<string, string> = {};
    const cleanId = identifier.trim();

    if (!cleanId) {
      errs.identifier = 'Please enter your email or 10-digit mobile number.';
    } else if (cleanId.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId)) {
        errs.identifier = 'Please enter a valid email address (e.g., name@example.com).';
      }
    } else {
      const cleanDigits = cleanId.replace(/\D/g, '');
      if (cleanDigits.length !== 10) {
        errs.identifier = 'Mobile number must be exactly 10 digits.';
      }
    }

    if (!password) {
      errs.password = 'Please enter your account password.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Please enter your full name.';
    }

    const cleanEmail = signupEmail.trim();
    if (!cleanEmail) {
      errs.signupEmail = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.signupEmail = 'Please enter a valid email format (name@example.com).';
    }

    if (signupPhone.trim()) {
      const cleanDigits = signupPhone.replace(/\D/g, '');
      if (cleanDigits.length !== 10) {
        errs.signupPhone = 'Mobile number must be 10 digits.';
      }
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else {
      if (password.length < 8) {
        errs.password = 'Password must be at least 8 characters long.';
      } else if (!/[A-Z]/.test(password)) {
        errs.password = 'Include at least one uppercase letter (A-Z).';
      } else if (!/[0-9]/.test(password)) {
        errs.password = 'Include at least one numerical digit (0-9).';
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        errs.password = 'Include at least one special character (!@#$%^&*).';
      }
    }

    if (!agreeTerms) {
      errs.terms = 'Please accept the Terms of Service & Privacy Policy.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    const res = await login({ identifier, password, rememberMe });
    setIsLoading(false);

    if (!res.success && res.error) {
      setErrors({ form: res.error });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    setIsLoading(true);
    const res = await signup({
      name: fullName,
      email: signupEmail,
      phoneNumber: signupPhone,
      password,
    });
    setIsLoading(false);

    if (!res.success && res.error) {
      setErrors({ form: res.error });
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    await loginWithOAuth(provider);
    setOauthLoading(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7f9] text-[#0b1c30] flex flex-col justify-between relative overflow-hidden py-8 px-4 sm:px-6">
      {/* Ambient Radial Mesh Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#86f2e4]/20 via-[#eff4ff]/60 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#006a61]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#0d1c32]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Toast Notification */}
      {authToastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#0d1c32] text-white px-5 py-2.5 rounded-full font-['Manrope'] text-xs font-bold shadow-2xl z-50 flex items-center gap-2 border border-[#86f2e4]/30 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
            check_circle
          </span>
          <span>{authToastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2.5 mb-2 group">
            <div className="w-12 h-12 rounded-2xl bg-[#0d1c32] text-white flex items-center justify-center shadow-lg ring-4 ring-[#86f2e4]/25 transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[28px] text-[#86f2e4]">
                account_balance_wallet
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-[#0b1c30] leading-none">
                Smart Expense
              </span>
              <span className="font-['Manrope'] text-xs font-semibold text-[#006a61] mt-1 tracking-wide">
                Financial Insights
              </span>
            </div>
          </div>
          <p className="font-['Manrope'] text-xs text-[#44474d] max-w-xs mt-1">
            <em className="italic text-[#0b1c30]">"Smarter expenditure creates smarter wealth."</em>
          </p>
        </div>

        {/* Central Floating Auth Card */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(13,28,50,0.08)] border border-slate-100 flex flex-col gap-6 relative">
          {/* Tab Switcher: Log In vs Create Account */}
          <div className="w-full p-1 bg-[#eff4ff] rounded-2xl flex items-center relative">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrors({});
              }}
              className={`flex-1 py-2.5 text-xs font-['Space_Grotesk'] font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#0d1c32] text-white shadow-md'
                  : 'text-[#44474d] hover:text-[#0b1c30]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrors({});
              }}
              className={`flex-1 py-2.5 text-xs font-['Space_Grotesk'] font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#0d1c32] text-white shadow-md'
                  : 'text-[#44474d] hover:text-[#0b1c30]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Error Banner */}
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-['Manrope'] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errors.form}</span>
            </div>
          )}

          {/* 1. LOG IN VIEW */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              {/* Identifier Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#44474d]">
                    alternate_email
                  </span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
                    }}
                    placeholder="priyansh@example.com or 9876543210"
                    className={`w-full h-12 pl-10 pr-4 rounded-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] placeholder:text-[#44474d]/50 outline-none transition-all ${
                      errors.identifier
                        ? 'border border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                        : 'focus:bg-white focus:ring-2 focus:ring-[#006a61]'
                    }`}
                  />
                </div>
                {errors.identifier && (
                  <span className="font-['Manrope'] text-xs text-rose-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{errors.identifier}</span>
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="font-['Manrope'] text-xs font-semibold text-[#006a61] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#44474d]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Enter your vault password"
                    className={`w-full h-12 pl-10 pr-11 rounded-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] placeholder:text-[#44474d]/50 outline-none transition-all ${
                      errors.password
                        ? 'border border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                        : 'focus:bg-white focus:ring-2 focus:ring-[#006a61]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#44474d] hover:text-[#0b1c30] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <span className="font-['Manrope'] text-xs text-rose-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{errors.password}</span>
                  </span>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#006a61] cursor-pointer"
                  />
                  <span className="font-['Manrope'] text-xs text-[#44474d]">
                    Remember this device for 30 days
                  </span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#0d1c32] hover:bg-[#213145] text-white font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-75 cursor-pointer mt-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Log In to Vault</span>
                    <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              {/* Fast 1-Click Demo Login Pill */}
              <button
                type="button"
                onClick={quickDemoLogin}
                className="w-full h-11 rounded-xl bg-[#eff4ff] hover:bg-[#e2edff] text-[#006a61] border border-[#cbdbf5] font-['Space_Grotesk'] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                  bolt
                </span>
                <span>Quick Demo Account (Instant Access)</span>
              </button>
            </form>
          )}

          {/* 2. SIGN UP VIEW */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3.5">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#44474d]">
                    person
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. Priyansh Sharma"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] outline-none transition-all ${
                      errors.fullName
                        ? 'border border-rose-500'
                        : 'focus:bg-white focus:ring-2 focus:ring-[#006a61]'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <span className="font-['Manrope'] text-xs text-rose-500">
                    {errors.fullName}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#44474d]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      if (errors.signupEmail) setErrors((prev) => ({ ...prev, signupEmail: '' }));
                    }}
                    placeholder="name@example.com"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] outline-none transition-all ${
                      errors.signupEmail
                        ? 'border border-rose-500'
                        : 'focus:bg-white focus:ring-2 focus:ring-[#006a61]'
                    }`}
                  />
                </div>
                {errors.signupEmail && (
                  <span className="font-['Manrope'] text-xs text-rose-500">
                    {errors.signupEmail}
                  </span>
                )}
              </div>

              {/* Optional Phone */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                    Mobile Number
                  </label>
                  <span className="font-['Manrope'] text-[10px] text-[#75777e]">
                    For SMS Parsing Telemetry
                  </span>
                </div>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl bg-slate-200/80 font-['Space_Grotesk'] text-xs font-bold text-[#0b1c30] border-r border-slate-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => {
                      setSignupPhone(e.target.value);
                      if (errors.signupPhone) setErrors((prev) => ({ ...prev, signupPhone: '' }));
                    }}
                    placeholder="9876543210"
                    className="w-full h-11 pl-3 pr-4 rounded-r-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] outline-none focus:bg-white focus:ring-2 focus:ring-[#006a61] transition-all"
                  />
                </div>
                {errors.signupPhone && (
                  <span className="font-['Manrope'] text-xs text-rose-500">
                    {errors.signupPhone}
                  </span>
                )}
              </div>

              {/* Password & Live Strength Meter */}
              <div className="flex flex-col gap-1">
                <label className="font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                  Create Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#44474d]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] outline-none focus:bg-white focus:ring-2 focus:ring-[#006a61] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#44474d] hover:text-[#0b1c30] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex justify-between items-center text-[10px] font-['Manrope']">
                      <span className="text-[#44474d]">Strength:</span>
                      <span className={`font-bold ${signupStrength.text}`}>
                        {signupStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                      <div
                        className={`h-full transition-all duration-300 ${
                          signupStrength.score >= 1 ? signupStrength.color : 'bg-transparent'
                        } ${signupStrength.score === 1 ? 'w-1/3' : signupStrength.score === 2 ? 'w-2/3' : 'w-full'}`}
                      ></div>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <span className="font-['Manrope'] text-xs text-rose-500">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#006a61] mt-0.5 cursor-pointer"
                />
                <span className="font-['Manrope'] text-[11px] text-[#44474d] leading-tight">
                  I agree to the{' '}
                  <span className="text-[#006a61] underline font-semibold">Terms of Service</span>{' '}
                  and acknowledge the{' '}
                  <span className="text-[#006a61] underline font-semibold">Privacy Policy</span>.
                </span>
              </label>
              {errors.terms && (
                <span className="font-['Manrope'] text-xs text-rose-500">{errors.terms}</span>
              )}

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#006a61] hover:bg-[#005049] text-white font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-75 cursor-pointer mt-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Vault...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                      how_to_reg
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Auth Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="font-['Manrope'] text-xs text-[#75777e] uppercase font-semibold tracking-wider">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Official OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null}
              className="h-11 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 font-['Manrope'] text-xs font-bold text-[#0b1c30] transition-all active:scale-95 disabled:opacity-70 cursor-pointer shadow-sm"
            >
              {oauthLoading === 'google' ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Google</span>
            </button>

            {/* Apple OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              disabled={oauthLoading !== null}
              className="h-11 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 font-['Manrope'] text-xs font-bold text-[#0b1c30] transition-all active:scale-95 disabled:opacity-70 cursor-pointer shadow-sm"
            >
              {oauthLoading === 'apple' ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.79-11.97-14.24-7.2-10.9-12.87-23.77-17-38.61-4.14-14.84-6.21-29.07-6.21-42.69 0-16.53 4.2-30.56 12.61-42.09 8.4-11.53 19.12-17.43 32.14-17.7 4.7 0 10.15 1.34 16.36 4.02 6.2 2.68 10.17 4.08 11.91 4.2 1.63 0 5.75-1.42 12.36-4.26 6.61-2.84 12.16-4.15 16.65-3.93 12.83.63 23.36 5.37 31.6 14.22-11.2 6.78-16.66 16.14-16.37 28.08.3 11.45 4.87 21.04 13.72 28.77 8.85 7.73 19.34 12.08 31.47 13.06-2.5 7.62-5.77 15.42-9.82 23.39zM119.22 31.81c0-7.85 2.87-15.19 8.62-22.02 5.75-6.83 12.92-10.87 21.51-12.12.22 1.12.33 2.12.33 3 0 7.85-2.88 15.34-8.64 22.47-5.76 7.13-13.04 11.23-21.82 12.31 0-1.12 0-2.33 0-3.64z" />
                </svg>
              )}
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Security & Non-Custodial Footer Pill */}
        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-slate-200/60 shadow-xs text-[11px] font-['Manrope'] text-[#44474d]">
          <span className="material-symbols-outlined text-[15px] text-[#006a61]">
            verified_user
          </span>
          <span>100% On-Device Vault · Zero Cloud Financial Storage</span>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="text-center font-['Manrope'] text-[11px] text-[#75777e] mt-6">
        Smart Expense v2.4 · Smarter expenditure creates smarter wealth
      </footer>

      {/* Forgot Password & OTP Modal */}
      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        initialIdentifier={identifier}
      />
    </div>
  );
};
