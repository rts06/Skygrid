import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, LogIn, User, FileCode2 } from 'lucide-react';
import { login, ApiError } from '../services/api';
import type { UserProfile } from '../types/flight';
import { AirlineLogo } from './AirlineLogo';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenDeliverables: () => void;
}

export function LoginPage({ onLoginSuccess, onOpenDeliverables }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [imageFailed, setImageFailed] = useState(false);

  const validate = (): boolean => {
    const nextErrors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      nextErrors.username = 'Username is required.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 4) {
      nextErrors.password = 'Password must be at least 4 characters.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await login(username.trim(), password);
      onLoginSuccess(response.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to reach authentication service.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setFieldErrors({});
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950">
      {/* Atmospheric Aviation Backdrop */}
      {!imageFailed && (
        <img
          src="/src/assets/images/login_aviation_backdrop_1795761952023.jpg"
          alt="Commercial aircraft parked at an airport terminal gate at twilight"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/75 to-sky-950/80"
        aria-hidden="true"
      />

      {/* Top minimal wordmark */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-3 text-white">
          <AirlineLogo className="w-9 h-9" />
          <span className="font-display text-lg font-semibold tracking-tight whitespace-nowrap">
            SkyGrid Airways
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenDeliverables}
          className="inline-flex items-center gap-2 text-xs font-medium text-sky-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400 rounded px-2 py-1"
        >
          <FileCode2 className="w-4 h-4" />
          <span>Architecture & Source Deliverables</span>
        </button>
      </header>

      {/* Center Glassmorphism Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <section
          aria-labelledby="login-heading"
          className="glass-login-card w-full max-w-md rounded-2xl p-7 sm:p-9 text-white"
        >
          <div className="mb-7">
            <p className="text-xs font-medium text-sky-300 tracking-wide mb-1.5">
              Flight Operations
            </p>
            <h1
              id="login-heading"
              className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-white"
            >
              Sign in to Availability Portal
            </h1>
            <p className="mt-1.5 text-sm text-slate-300">
              Authenticate with your operations credentials to view live seat availability.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      setFieldErrors((prev) => ({ ...prev, username: undefined }));
                    }
                  }}
                  placeholder="Enter username"
                  aria-invalid={Boolean(fieldErrors.username)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-slate-950/55 border border-white/15 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25 transition-colors"
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-1.5 text-xs text-rose-300" role="alert">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Enter password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  className="w-full h-11 pl-10 pr-11 rounded-lg bg-slate-950/55 border border-white/15 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-white rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-rose-300" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg bg-rose-500/20 border border-rose-400/35 px-3.5 py-2.5 text-xs text-rose-100"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              <LogIn className="w-4 h-4" />
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Subtle quick-fill credentials for evaluation */}
          <div className="mt-6 pt-5 border-t border-white/12">
            <p className="text-xs text-slate-300 mb-2">Demo Operations Accounts</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('dispatcher', 'SkyOps2026!')}
                className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs text-sky-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                dispatcher (Arjun Mehta)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('ops.manager', 'Flight2026!')}
                className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs text-sky-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                ops.manager (Priya Nair)
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-400">
        SkyGrid Airways · JWT-Secured Flight Availability Portal
      </footer>
    </div>
  );
}
