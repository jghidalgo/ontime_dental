'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Check if user is authenticated
    const token = window.localStorage.getItem('ontime.authToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // You could decode the JWT token here to get user info
    // For now, we'll just show a generic welcome
    setUserName('User');
  }, [router]);

  const handleLogout = () => {
    window.localStorage.removeItem('ontime.authToken');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">OnTime Dental</h1>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Welcome to your Dashboard! 👋
          </h2>
          <p className="text-lg text-slate-300">
            You have successfully logged in to OnTime Dental.
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">Appointments</h3>
              <p className="text-slate-400">Manage patient appointments</p>
            </div>
            
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">Patients</h3>
              <p className="text-slate-400">View patient records</p>
            </div>
            
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">Settings</h3>
              <p className="text-slate-400">Configure your account</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
