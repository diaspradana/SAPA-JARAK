import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { VoiceProvider } from './context/VoiceContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import NotificationDrawer from './components/layout/NotificationDrawer';
import WhatsAppPreviewModal from './components/whatsapp/WhatsAppPreviewModal';

// Views
import HomeView from './views/public/HomeView';
import SubmissionWizardView from './views/public/SubmissionWizardView';
import TrackingDetailView from './views/public/TrackingDetailView';
import TransparencyView from './views/public/TransparencyView';
import KasunDashboardView from './views/kasun/KasunDashboardView';
import KasunSurveyView from './views/kasun/KasunSurveyView';
import DesaDashboardView from './views/desa/DesaDashboardView';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function MainRouter() {
  const { currentView, toastMessage } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'ajukan':
        return <SubmissionWizardView />;
      case 'lacak':
        return <TrackingDetailView />;
      case 'transparansi':
        return <TransparencyView />;
      case 'kasun_dashboard':
        return <KasunDashboardView />;
      case 'kasun_verifikasi':
        return <KasunSurveyView />;
      case 'desa_dashboard':
      case 'desa_validasi':
      case 'desa_pengadaan':
      case 'desa_serahterima':
      case 'desa_laporan':
        return <DesaDashboardView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {renderView()}
      </main>

      <Footer />

      {/* Slide-out simulated WhatsApp Notification Center */}
      <NotificationDrawer />

      {/* Interactive incoming WhatsApp modal */}
      <WhatsAppPreviewModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <VoiceProvider>
        <MainRouter />
      </VoiceProvider>
    </AppProvider>
  );
}
