import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialIdentifier = '',
}) => {
  const { sendOtp, resetPasswordWithOtp } = useFinance();

  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [identifierError, setIdentifierError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 6-digit OTP state
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('request');
      setIdentifier(initialIdentifier || '');
      setIdentifierError('');
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setTimer(45);
      setCanResend(false);
    }
  }, [isOpen, initialIdentifier]);

  // Resend countdown timer
  useEffect(() => {
    let interval: any = null;
    if (step === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  if (!isOpen) return null;

  // Password strength calculation
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

  const strength = getPasswordStrength(newPassword);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError('');

    const clean = identifier.trim();
    if (!clean) {
      setIdentifierError('Please enter your registered email or phone number.');
      return;
    }

    const isEmail = clean.includes('@');
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setIdentifierError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }
    if (!isEmail && !/^\d{10}$/.test(clean.replace(/\D/g, ''))) {
      setIdentifierError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    await sendOtp(clean);
    setIsLoading(false);
    setStep('verify');
    setTimer(45);
    setCanResend(false);
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError('');

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }
    setStep('reset');
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    await sendOtp(identifier);
    setIsLoading(false);
    setTimer(45);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    otpInputsRef.current[0]?.focus();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must include at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must include at least one number (0-9).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    const result = await resetPasswordWithOtp(identifier, otp.join(''), newPassword);
    setIsLoading(false);

    if (result.success) {
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setPasswordError(result.error || 'Password reset failed. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1c32]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col gap-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#44474d] hover:text-[#0b1c30] transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="w-13 h-13 rounded-2xl bg-[#0d1c32] text-white flex items-center justify-center shadow-lg mb-3 ring-4 ring-[#86f2e4]/20">
            <span className="material-symbols-outlined text-[26px] text-[#86f2e4]">
              {step === 'verify' ? 'phonelink_lock' : step === 'reset' ? 'lock_reset' : 'key'}
            </span>
          </div>

          <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#0b1c30]">
            {step === 'request' && 'Password Recovery'}
            {step === 'verify' && 'Verify Security Code'}
            {step === 'reset' && 'Set New Password'}
            {step === 'success' && 'Password Updated!'}
          </h3>

          <p className="font-['Manrope'] text-xs text-[#44474d] mt-1 max-w-xs leading-relaxed">
            {step === 'request' &&
              'Enter your registered email address or phone number to receive a 6-digit verification code.'}
            {step === 'verify' &&
              `We have dispatched a 6-digit OTP code to ${identifier}. Enter it below.`}
            {step === 'reset' &&
              'Create a strong, unique password to secure your personal finance vault.'}
            {step === 'success' &&
              'Your password has been successfully reset. Redirecting to your financial dashboard...'}
          </p>
        </div>

        {/* Step 1: Identifier Input Form */}
        {step === 'request' && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
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
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setIdentifierError('');
                  }}
                  placeholder="name@example.com or 9876543210"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] placeholder:text-[#44474d]/60 outline-none transition-all ${
                    identifierError
                      ? 'border border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                      : 'focus:bg-white focus:ring-2 focus:ring-[#006a61]'
                  }`}
                />
              </div>
              {identifierError && (
                <span className="font-['Manrope'] text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{identifierError}</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#0d1c32] hover:bg-[#213145] text-white font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 mt-1 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 6-Digit OTP Form */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex justify-between gap-2 w-full max-w-xs">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 text-center font-['Space_Grotesk'] text-xl font-bold rounded-xl bg-[#eff4ff] text-[#0b1c30] outline-none border border-transparent focus:border-[#006a61] focus:bg-white focus:ring-2 focus:ring-[#006a61]/25 transition-all shadow-sm"
                  />
                ))}
              </div>

              {otpError && (
                <span className="font-['Manrope'] text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{otpError}</span>
                </span>
              )}

              {/* Resend Countdown */}
              <div className="flex items-center justify-between w-full pt-1 px-1 text-xs font-['Manrope']">
                <span className="text-[#44474d]">Didn't get the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className={`font-bold transition-colors ${
                    canResend
                      ? 'text-[#006a61] hover:underline cursor-pointer'
                      : 'text-[#75777e] cursor-not-allowed'
                  }`}
                >
                  {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#0d1c32] hover:bg-[#213145] text-white font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Verify & Continue</span>
              <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">check</span>
            </button>
          </form>
        )}

        {/* Step 3: Set New Password Form */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                New Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#44474d]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Min 8 chars, uppercase, number"
                  className="w-full h-12 pl-10 pr-11 rounded-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] outline-none focus:bg-white focus:ring-2 focus:ring-[#006a61] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#44474d] hover:text-[#0b1c30]"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between items-center text-[11px] font-['Manrope']">
                    <span className="text-[#44474d]">Password Strength:</span>
                    <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength.score >= 1 ? strength.color : 'bg-transparent'
                      } ${strength.score === 1 ? 'w-1/3' : strength.score === 2 ? 'w-2/3' : 'w-full'}`}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-['Manrope'] text-xs font-semibold text-[#0b1c30]">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#44474d]">
                  lock_clock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Re-enter password"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#eff4ff] font-['Manrope'] text-sm text-[#0b1c30] outline-none focus:bg-white focus:ring-2 focus:ring-[#006a61] transition-all"
                />
              </div>
            </div>

            {passwordError && (
              <span className="font-['Manrope'] text-xs text-rose-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span>{passwordError}</span>
              </span>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#006a61] hover:bg-[#005049] text-white font-['Space_Grotesk'] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 mt-1 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset & Sign In</span>
                  <span className="material-symbols-outlined text-[18px] text-[#86f2e4]">check_circle</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 4: Success Confirmation */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-4 gap-3 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <p className="font-['Space_Grotesk'] text-base font-bold text-[#0b1c30]">
              All Set! Vault Unlocked
            </p>
            <p className="font-['Manrope'] text-xs text-[#44474d]">
              Your password has been changed and your credentials are encrypted locally.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
