import { useCallback, useState } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { DeliverablesModal } from './components/DeliverablesModal';
import { FlightAvailabilityTable } from './components/FlightAvailabilityTable';
import { LoginPage } from './components/LoginPage';
import { logout, setAuthToken } from './services/api';
import type { UserProfile } from './types/flight';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deliverablesOpen, setDeliverablesOpen] = useState(false);

  const handleLoginSuccess = useCallback((authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await logout();
    setUser(null);
    setLoggingOut(false);
  }, []);

  const handleUnauthorized = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <>
      {!user ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onOpenDeliverables={() => setDeliverablesOpen(true)}
        />
      ) : (
        <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
          <DashboardHeader
            user={user}
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />

          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
            <FlightAvailabilityTable onUnauthorized={handleUnauthorized} />
          </main>

          <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>SkyGrid Airways · Flight Availability Portal</span>
              <button
                type="button"
                onClick={() => setDeliverablesOpen(true)}
                className="text-sky-700 hover:text-sky-900 font-medium underline underline-offset-4 cursor-pointer"
              >
                Architecture & Source Deliverables (Angular + Spring Boot)
              </button>
            </div>
          </footer>
        </div>
      )}

      <DeliverablesModal
        isOpen={deliverablesOpen}
        onClose={() => setDeliverablesOpen(false)}
      />
    </>
  );
}
