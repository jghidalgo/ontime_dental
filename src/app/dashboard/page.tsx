'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import { getUserSession } from '@/lib/permissions';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import LabTechDashboard from '@/components/dashboards/LabTechDashboard';
import DoctorDashboard from '@/components/dashboards/DoctorDashboard';
import ReceptionistDashboard from '@/components/dashboards/ReceptionistDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const { t } = useTranslations();

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    // Get user session and set role
    const userSession = getUserSession();
    if (userSession) {
      setUserName(userSession.name);
      setUserRole(userSession.role);
    } else {
      setUserName('Dr. Carter');
    }
  }, [router]);

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!userRole) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
            <p className="text-slate-400">{t('Loading dashboard...')}</p>
          </div>
        </div>
      );
    }

    switch (userRole) {
      case 'lab_tech':
        return <LabTechDashboard />;
      case 'dentist':
        return <DoctorDashboard />;
      case 'hygienist':
      case 'assistant':
        return <DoctorDashboard />; // Hygienists and assistants use doctor dashboard
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'admin':
      case 'manager':
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative w-full">
        <div className="border-b border-slate-800 bg-slate-900/60">
          <PageHeader
            category={t('Dashboard')}
            title={'Welcome back'}
            // subtitle={t('Dashboard summary')}
            showEntitySelector={true}
            selectedEntityId={selectedEntityId}
            onEntityChange={setSelectedEntityId}
          />

          <TopNavigation />
        </div>

        <main className="mx-auto max-w-7xl px-6 py-10">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}
