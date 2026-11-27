import { LogOut, User } from 'lucide-react';
import type { UserProfile } from '../types/flight';
import { AirlineLogo } from './AirlineLogo';

interface DashboardHeaderProps {
  user: UserProfile;
  onLogout: () => void;
  loggingOut: boolean;
}

export function DashboardHeader({ user, onLogout, loggingOut }: DashboardHeaderProps) {
  return (
    <header className="airline-gradient-header text-white border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <AirlineLogo className="w-8 h-8" />
          <span className="font-display text-lg font-semibold tracking-tight whitespace-nowrap shrink-0">
            SkyGrid Airways
          </span>
        </div>

        {/* Zone 2: Minimal navigation context */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sky-100">
          <span className="text-white border-b-2 border-sky-400 py-1 whitespace-nowrap shrink-0">
            Available Flights
          </span>
        </nav>

        {/* Zone 3: Logged-in user + Logout action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-sm text-sky-100 whitespace-nowrap">
            <User className="w-4 h-4 text-sky-300 shrink-0" aria-hidden="true" />
            <span className="font-medium text-white truncate max-w-[140px] sm:max-w-none">
              {user.fullName || user.username}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white/12 hover:bg-white/20 disabled:opacity-60 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-300"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? 'Signing out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
