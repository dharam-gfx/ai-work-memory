import React, { useState } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
// @ts-ignore — CSS side-effect import handled by Vite
import 'react-phone-number-input/style.css';
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  CheckCircle,
  Database,
  LogOut,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessfulLogin }) => {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGit,
    signInWithMagicLink,
    signInWithPhoneOtp,
    signOut,
    activeSessions,
    isSupabaseActive
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'magic'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastError, setToastError] = useState('');

  const showErrorToast = (msg: unknown) => {
    // Always coerce to a readable string
    const text =
      typeof msg === 'string' && msg.trim() && msg !== '{}' && msg !== 'undefined'
        ? msg
        : 'Something went wrong. Please use Google or GitHub sign-in.';
    setToastError(text);
    setTimeout(() => setToastError(''), 6000);
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await signInWithMagicLink(magicEmail);
    if (!res.success) {
      showErrorToast(res.error || 'Failed to send magic link.');
    } else {
      setMagicSent(true);
    }
    setIsSubmitting(false);
  };

  // Password strength
  const getPasswordStrength = (p: string): 'weak' | 'good' | 'excellent' | null => {
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'good';
    return 'excellent';
  };
  const passwordStrength = mode === 'signup' ? getPasswordStrength(password) : null;
  const strengthConfig = {
    weak:      { label: 'Weak',      color: 'bg-red-500',    text: 'text-red-400',    width: 'w-1/3' },
    good:      { label: 'Good',      color: 'bg-amber-400',  text: 'text-amber-400',  width: 'w-2/3' },
    excellent: { label: 'Excellent', color: 'bg-emerald-500',text: 'text-emerald-400',width: 'w-full' },
  };

  if (!isOpen) return null;

  // Extracted to avoid nested ternaries (SonarQube S3358)
  const getUserInitial = (): string => {
    if (!user) return 'G';
    return user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase();
  };
  const userInitial = getUserInitial();

  const getModalTitle = (): string => {
    if (user) return 'Account & Devices';
    return mode === 'signin' ? 'Sign In to Your Vault' : 'Create Knowledge Vault';
  };
  const modalTitle = getModalTitle();

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      showErrorToast(res.error || 'Gmail / Google sign-in failed.');
      setIsSubmitting(false);
    } else {
      // OAuth redirects the browser — just show a redirecting state.
      // onSuccessfulLogin is NOT called here; Supabase redirect handles navigation.
      setSuccessMsg('Redirecting to Google...');
      // isSubmitting stays true (spinner) until the browser navigates away
    }
  };

  const handleGitLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    const res = await signInWithGit();
    if (!res.success) {
      showErrorToast(res.error || 'GitHub sign-in failed.');
      setIsSubmitting(false);
    } else {
      // OAuth redirects the browser — just show a redirecting state.
      setSuccessMsg('Redirecting to GitHub...');
      // isSubmitting stays true (spinner) until the browser navigates away
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!requiresOtp) {
      const res = await signInWithPhoneOtp(phoneNumber, fullName, '', false);
      if (!res.success) {
        showErrorToast(res.error || 'Failed to send OTP verification code.');
      } else {
        setRequiresOtp(true);
        setSuccessMsg(`OTP verification code sent to ${phoneNumber}. (Hint: enter any 4-6 digits like 1234)`);
      }
    } else {
      const res = await signInWithPhoneOtp(phoneNumber, fullName, otpCode, true);
      if (!res.success) {
        showErrorToast(res.error || 'Invalid OTP code.');
      } else {
        setSuccessMsg('Phone authentication successful!');
        setTimeout(() => {
          onClose();
          if (onSuccessfulLogin) onSuccessfulLogin();
        }, 800);
      }
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (mode === 'signin') {
      const res = await signIn(email, password);
      if (!res.success) {
        showErrorToast(res.error || 'Failed to sign in. Please check your credentials.');
      } else {
        setSuccessMsg('Successfully authenticated! Multi-device session active.');
        setTimeout(() => {
          onClose();
          if (onSuccessfulLogin) onSuccessfulLogin();
        }, 800);
      }
    } else {
      const res = await signUp(email, password, fullName);
      if (!res.success) {
        showErrorToast(res.error || 'Failed to create account.');
      } else if (res.requiresEmailVerification) {
        // Supabase requires email confirmation — show verification screen
        setVerificationEmail(email);
        setEmailVerificationSent(true);
      } else {
        setSuccessMsg('Account created successfully! Your personal knowledge graph is isolated.');
        setTimeout(() => {
          onClose();
          if (onSuccessfulLogin) onSuccessfulLogin();
        }, 800);
      }
    }
    setIsSubmitting(false);
  };

  const getModalSubtitle = (): string =>
    user ? `Logged in as ${user.email}` : 'Strict end-to-end user data isolation & multi-device sync';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800/90 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in duration-200">

        {/* Floating error toast inside modal */}
        {toastError && (
          <div className="absolute top-3 left-3 right-3 z-50 flex items-start gap-2.5 p-3 rounded-xl bg-red-950 border border-red-500/40 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-snug flex-1">{toastError}</p>
            <button onClick={() => setToastError('')} className="text-red-500 hover:text-red-300 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 flex-wrap truncate">
                <span className="truncate">{modalTitle}</span>
                {isSupabaseActive && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[10px] font-semibold border border-emerald-500/20 shrink-0">
                    Supabase Active
                  </span>
                )}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {getModalSubtitle()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
          {user && (
            <div className="space-y-5 sm:space-y-6">
              {/* User Identity Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0 overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName || user.email} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : userInitial}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{user.fullName || 'User'}</h4>
                      <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">{user.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 w-fit shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Isolated Vault</span>
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400">
                  <span className="truncate">User ID: <span className="font-mono text-slate-300">{user.id.substring(0, 16)}...</span></span>
                  <span>Provider: <strong className="text-slate-200 capitalize">{user.provider}</strong></span>
                </div>
              </div>

              {/* Active Devices / Multi-Device Login Sessions */}
              <div className="space-y-3">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex flex-wrap items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
                    <span>Current Session</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">
                    This device only
                  </span>
                </h4>

                <div className="space-y-2">
                  {activeSessions.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-3">No active session info available.</p>
                  ) : activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {session.deviceName.toLowerCase().includes('mobile') || session.deviceName.toLowerCase().includes('ios') ? (
                          <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
                        ) : (
                          <Laptop className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white flex items-center gap-1.5 flex-wrap text-xs">
                            <span className="truncate">{session.deviceName}</span>
                            {session.isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] shrink-0">
                                This Device
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {session.lastActive}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={async () => {
                    await signOut();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>

            </div>
          )}
          {!user && emailVerificationSent && (
            <div className="flex flex-col items-center text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">Verify your email address</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  We sent a confirmation link to <span className="text-white font-semibold">{verificationEmail}</span>.
                  Click the link in the email to activate your account.
                </p>
              </div>
              <div className="w-full p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 text-left space-y-1">
                <p className="font-semibold">Didn't receive it?</p>
                <p className="text-amber-400/80">Check your spam folder, or close this and try signing up again.</p>
              </div>
              <button
                onClick={() => { setEmailVerificationSent(false); setMode('signin'); }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                Back to Sign In
              </button>
            </div>
          )}
          {!user && !emailVerificationSent && (
            <div className="space-y-5">
              
              {/* Header Badge */}
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-white">Sign In to Your Vault</h4>
                <p className="text-xs text-slate-400">Choose your secure authentication method below</p>
              </div>

              {/* Social Login Buttons (Google & Git/GitHub) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.6C3.5 19.4 7.4 22 12 22z"
                    />
                  </svg>
                  <span className="truncate">Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGitLogin}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span className="truncate">GitHub / Git</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-800"></div>
                <span className="shrink mx-3 text-[10px] uppercase tracking-wider text-slate-500 font-medium">Or continue with</span>
                <div className="grow border-t border-slate-800"></div>
              </div>

              {/* Auth Method Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setRequiresOtp(false); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${authMethod === 'email' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('magic'); setErrorMsg(''); setMagicSent(false); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${authMethod === 'magic' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setErrorMsg(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${authMethod === 'phone' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Phone OTP
                </button>
              </div>

              {/* Success message */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {authMethod === 'email' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Mode switcher for email */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>{mode === 'signin' ? 'Signing into existing vault' : 'Registering new vault'}</span>
                    <button
                      type="button"
                      onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                      className="text-blue-400 hover:underline font-semibold"
                    >
                      {mode === 'signin' ? 'Create new account?' : 'Already have account? Sign in'}
                    </button>
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label htmlFor="auth-fullname" className="text-xs font-semibold text-slate-300 mb-1.5 block">Full Name</label>
                      <input
                        id="auth-fullname"
                        type="text"
                        placeholder="e.g. Alex Rivera"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="auth-email" className="text-xs font-semibold text-slate-300 mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-email"
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auth-password" className="text-xs font-semibold text-slate-300 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength bar — shown only on signup */}
                    {passwordStrength && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${strengthConfig[passwordStrength].color} ${strengthConfig[passwordStrength].width}`} />
                        </div>
                        <p className={`text-[10px] font-semibold ${strengthConfig[passwordStrength].text}`}>
                          {strengthConfig[passwordStrength].label} password
                          {passwordStrength === 'weak' && ' — add uppercase, numbers or symbols'}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || (mode === 'signup' && passwordStrength === 'weak')}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{mode === 'signin' ? 'Sign In & Access Memory' : 'Create Isolated Account'}</span>
                  </button>
                </form>
              ) : authMethod === 'magic' ? (
                /* Magic Link Form */
                magicSent ? (
                  <div className="flex flex-col items-center text-center space-y-4 py-2">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Mail className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-white">Check your inbox</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        We sent a sign-in link to <span className="text-white font-semibold">{magicEmail}</span>. Click it to access your vault — no password needed.
                      </p>
                    </div>
                    <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 text-left">
                      Link expires in 10 minutes and can only be used once.
                    </div>
                    <button
                      type="button"
                      onClick={() => { setMagicSent(false); setMagicEmail(''); }}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMagicLink} className="space-y-4">
                    <p className="text-xs text-slate-400">Enter your email and we'll send you a one-click sign-in link. No password required.</p>
                    <div>
                      <label htmlFor="magic-email" className="text-xs font-semibold text-slate-300 mb-1.5 block">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="magic-email"
                          type="email"
                          required
                          placeholder="you@company.com"
                          value={magicEmail}
                          onChange={(e) => setMagicEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{isSubmitting ? 'Sending...' : 'Send Magic Link'}</span>
                    </button>
                  </form>
                )
              ) : (
                /* Phone Number OTP Form */
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="text-xs text-slate-400">
                    {!requiresOtp ? 'Enter your mobile number and name to receive an instant SMS verification code.' : 'Enter the verification code sent to your mobile phone.'}
                  </div>

                  <div>
                    <label htmlFor="phone-fullname" className="text-xs font-semibold text-slate-300 mb-1.5 block">Full Name</label>
                    <input
                      id="phone-fullname"
                      type="text"
                      required
                      placeholder="e.g. Jordan Lee"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone-number" className="text-xs font-semibold text-slate-300 mb-1.5 block">Phone Number</label>
                    <PhoneInput
                      id="phone-number"
                      international
                      defaultCountry="IN"
                      value={phoneNumber}
                      onChange={(val) => setPhoneNumber(val || '')}
                      disabled={requiresOtp}
                      placeholder="Enter phone number"
                      className="phone-input-dark"
                    />
                    {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
                      <p className="text-[10px] text-red-400 mt-1">Please enter a valid phone number.</p>
                    )}
                  </div>

                  {requiresOtp && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="otp-code" className="text-xs font-semibold text-slate-300">Verification Code (OTP)</label>
                        <button
                          type="button"
                          onClick={() => setRequiresOtp(false)}
                          className="text-[11px] text-blue-400 hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="1234 (Simulated Code)"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-center tracking-widest font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        id="otp-code"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{!requiresOtp ? 'Send Verification Code (OTP)' : 'Verify & Sign In'}</span>
                  </button>
                </form>
              )}

              {/* Data Isolation Guarantee */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Database className="w-3.5 h-3.5" />
                  <span>Knowledge Vault Isolation Guaranteed</span>
                </div>
                <p className="leading-relaxed">
                  Every user's uploaded PDFs, JSON data files, notes, emails, and vector chunks are scoped strictly to their authenticated account. No cross-user leakage.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
