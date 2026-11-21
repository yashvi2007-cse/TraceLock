import React from 'react';
import { useTraceLock } from './context/TraceLockContext';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ActivityLogs } from './components/activity/ActivityLogs';
import { NetworkIntelligencePage } from './components/network/NetworkIntelligencePage';
import { IntegrityEngine } from './components/integrity/IntegrityEngine';
import { CheckpointsPage } from './components/checkpoints/CheckpointsPage';
import { SecureVaultPage } from './components/vault/SecureVaultPage';
import { VerificationCenter } from './components/verification/VerificationCenter';
import { InvestigationsPage } from './components/investigations/InvestigationsPage';
import { IncidentTimelinePage } from './components/timeline/IncidentTimelinePage';
import { EvidenceCenter } from './components/evidence/EvidenceCenter';
import { CollectorPage } from './components/collector/CollectorPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { DemoLabPage } from './components/demolab/DemoLabPage';
import { RecordDetailModal } from './components/modals/RecordDetailModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { TamperModal } from './components/modals/TamperModal';
import { ShieldCheck } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activePage } = useTraceLock();

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'activity':
        return <ActivityLogs />;
      case 'network':
        return <NetworkIntelligencePage />;
      case 'integrity':
        return <IntegrityEngine />;
      case 'checkpoints':
        return <CheckpointsPage />;
      case 'vault':
        return <SecureVaultPage />;
      case 'verification':
        return <VerificationCenter />;
      case 'investigations':
        return <InvestigationsPage />;
      case 'timeline':
        return <IncidentTimelinePage />;
      case 'evidence':
        return <EvidenceCenter />;
      case 'collector':
        return <CollectorPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'demolab':
        return <DemoLabPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Primary Top Navbar (Strictly NO Left Sidebar) */}
      <Navbar />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActivePage()}
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <span className="font-semibold text-slate-800">TRACELOCK Platform</span>
            <span>•</span>
            <span>Evidence Integrity & Non-Repudiation Architecture</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-slate-400">
            <span>SHA-256 FIPS 180-4 Compliant</span>
            <span>RFC 8785 Canonical JSON</span>
            <span>WORM Object Lock Supported</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <RecordDetailModal />
      <GlobalSearchModal />
      <TamperModal />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
