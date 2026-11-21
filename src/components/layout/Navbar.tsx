import React, { useState, useRef, useEffect } from 'react';
import { useTraceLock, NavigationPage } from '../../context/TraceLockContext';
import {
  ShieldCheck,
  Search,
  Bell,
  CheckCircle2,
  Menu,
  X,
  FileCheck,
  RotateCcw,
  Zap,
  Play,
  Lock,
  ChevronDown,
  Layers,
  Radio,
  FileText,
  Clock,
  ShieldAlert,
  Globe,
  Archive,
  GitBranch,
  Calendar
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    lastVerification,
    alerts,
    notifications,
    markNotificationRead,
    clearNotifications,
    setIsGlobalSearchOpen,
    setIsTamperModalOpen,
    isTampered,
    resetDemoChain
  } = useTraceLock();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unresolvedAlerts = alerts.filter(a => a.status === 'new' || a.status === 'investigating').length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen]);

  // Framed Primary Navigation Tabs (6 core tabs + More dropdown)
  const primaryNavItems: { id: NavigationPage; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'activity', label: 'Activity' },
    { id: 'network', label: 'Network' },
    { id: 'checkpoints', label: 'Checkpoints' },
    { id: 'integrity', label: 'Integrity' },
    { id: 'verification', label: 'Verification' },
  ];

  // Secondary Modules in Framed Dropdown
  const moreNavItems: { id: NavigationPage; label: string; desc: string; icon: any; badge?: number }[] = [
    { id: 'vault', label: 'Protected Vault', desc: 'WORM immutable dual-storage', icon: Archive },
    { id: 'investigations', label: 'Investigations', desc: '6-stage forensic analysis', icon: ShieldAlert },
    { id: 'timeline', label: 'Incident Timeline', desc: 'Chronological replay & blast radius', icon: Calendar },
    { id: 'evidence', label: 'Evidence Center', desc: 'Printable forensic certificates', icon: FileCheck },
    { id: 'collector', label: 'Collector Sources', desc: 'Syslog, Auditd, K8s, CloudTrail', icon: Radio },
    { id: 'alerts', label: 'Alerts Management', desc: 'Integrity & threat event triage', icon: Bell, badge: unresolvedAlerts > 0 ? unresolvedAlerts : undefined },
  ];

  // Mobile drawer links
  const allMobileNavItems: { id: NavigationPage; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'activity', label: 'Activity Logs' },
    { id: 'network', label: 'Network Intelligence & Telemetry' },
    { id: 'checkpoints', label: 'Blockchain Checkpoints (Quai)' },
    { id: 'integrity', label: 'Integrity Engine' },
    { id: 'vault', label: 'Protected Evidence Vault' },
    { id: 'verification', label: 'Verification Center' },
    { id: 'investigations', label: 'Investigations' },
    { id: 'timeline', label: 'Incident Timeline' },
    { id: 'evidence', label: 'Evidence Center' },
    { id: 'collector', label: 'Collector Sources' },
    { id: 'alerts', label: 'Alerts Management', badge: unresolvedAlerts > 0 ? unresolvedAlerts : undefined },
    { id: 'demolab', label: '⚡ Demo Lab Walkthrough' },
  ];

  const isIntact = lastVerification ? lastVerification.isChainIntact : !isTampered;
  const isMoreActive = moreNavItems.some(item => item.id === activePage);

  return (
    <header className="sticky top-0 z-50 bg-[#0B1528] text-white border-b border-slate-800 shadow-md select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 whitespace-nowrap gap-2">
          
          {/* LEFT: Framed Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer group shrink-0" onClick={() => setActivePage('dashboard')}>
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">TRACELOCK</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-900/80 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/40">
                  QUAI ANCHORED
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium -mt-0.5 tracking-tight hidden sm:block">
                Digital Evidence Integrity Platform
              </span>
            </div>
          </div>

          {/* CENTER: Framed Primary Navigation Tabs (Strictly Single Row) */}
          <nav className="hidden lg:flex items-center space-x-1 shrink-0">
            {primaryNavItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center space-x-1 cursor-pointer shrink-0 ${
                    isActive
                      ? 'text-white bg-blue-600/30 border border-blue-500/40 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60A5FA]" />
                  )}
                </button>
              );
            })}

            {/* Framed "More Modules" Dropdown */}
            <div className="relative shrink-0" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`relative px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center space-x-1 cursor-pointer ${
                  isMoreActive
                    ? 'text-white bg-blue-600/30 border border-blue-500/40 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>More</span>
                {unresolvedAlerts > 0 && (
                  <span className="ml-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-rose-500 text-white rounded-full">
                    {unresolvedAlerts}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                {isMoreActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60A5FA]" />
                )}
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0F1E36] text-slate-100 rounded-xl shadow-2xl border border-slate-700/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-700/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Extended Modules
                  </div>
                  {moreNavItems.map(item => {
                    const Icon = item.icon;
                    const isSelected = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActivePage(item.id);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-start space-x-2.5 cursor-pointer hover:bg-blue-900/40 transition-colors ${
                          isSelected ? 'bg-blue-600/25 text-white border-l-2 border-blue-400' : 'text-slate-300'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold flex items-center justify-between">
                            <span>{item.label}</span>
                            {item.badge !== undefined && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-500 text-white rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* RIGHT: Framed Action Controls & Indicators */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Framed Demo Lab Button */}
            <button
              onClick={() => setActivePage('demolab')}
              className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-xs shrink-0 ${
                activePage === 'demolab'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/20 ring-1 ring-blue-400'
                  : 'bg-indigo-950/60 text-indigo-200 border-indigo-500/40 hover:bg-indigo-900/80 hover:text-white'
              }`}
              title="Launch the 7-Step Interactive Verification & Recovery Walkthrough"
            >
              <Play className="h-3 w-3 fill-indigo-300 text-indigo-300" />
              <span>Demo Lab</span>
            </button>

            {/* Framed Tamper / Reset Demo Pill */}
            <div className="flex items-center shrink-0">
              {isTampered ? (
                <button
                  onClick={resetDemoChain}
                  className="flex items-center space-x-1 text-rose-200 hover:text-white bg-rose-950/80 hover:bg-rose-900 px-2 py-1 rounded-lg border border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  title="Chain is modified. Click to restore canonical cryptographic integrity."
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restore</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsTamperModalOpen(true)}
                  className="flex items-center space-x-1 text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900/80 px-2 py-1 rounded-lg border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  title="Inject simulated modification to test tampering detection."
                >
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span className="hidden md:inline">Tamper</span>
                </button>
              )}
            </div>

            {/* Quick Search Button */}
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Global Search (⌘K)"
            >
              <Search className="h-4 w-4 text-blue-400" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative shrink-0" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer shrink-0"
                title="System Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-[#0B1528]" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      {unreadNotifs > 0 && (
                        <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-full border border-blue-200">
                          {unreadNotifs} new
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No notifications to display.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative shrink-0" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs border border-blue-400 shadow-sm hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
              >
                HV
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">Helena Vance</p>
                    <p className="text-[11px] text-slate-500">Chief Information Security Officer</p>
                    <div className="mt-1.5 flex items-center space-x-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>FIDO2 Security Key Enforced</span>
                    </div>
                  </div>
                  <div className="py-1 text-xs text-slate-700">
                    <button
                      onClick={() => { setActivePage('verification'); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <FileCheck className="h-4 w-4 text-slate-500" />
                      <span>Run Full Verification</span>
                    </button>
                    <button
                      onClick={() => { setActivePage('checkpoints'); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <Globe className="h-4 w-4 text-indigo-600" />
                      <span>Quai Checkpoint Anchors</span>
                    </button>
                    <button
                      onClick={() => { setActivePage('demolab'); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <Play className="h-4 w-4 text-blue-600" />
                      <span>Launch Demo Lab</span>
                    </button>
                  </div>
                  <div className="border-t border-slate-100 pt-1 text-[11px] text-slate-400 px-4 py-1.5">
                    Quai Orchard • Cyprus-1 • FIPS 180-4
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0B1528] px-4 pt-2 pb-4 space-y-1 max-h-[80vh] overflow-y-auto">
          {allMobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between cursor-pointer ${
                activePage === item.id
                  ? 'bg-blue-600/30 text-white font-semibold border border-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 mt-2 flex space-x-2">
            <button
              onClick={() => {
                setIsTamperModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-1.5 px-3 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium rounded-lg text-center cursor-pointer"
            >
              Test Tamper
            </button>
            {isTampered && (
              <button
                onClick={() => {
                  resetDemoChain();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 px-3 bg-rose-900/60 text-rose-200 hover:bg-rose-800 text-xs font-medium rounded-lg text-center cursor-pointer"
              >
                Reset Chain
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
