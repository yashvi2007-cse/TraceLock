import React, { useState, useEffect } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  AlertTriangle,
  Lock,
  ArrowRight,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  Clock,
  Plus,
  Copy,
  Check,
  Cpu,
  Sliders,
  Terminal,
  Sparkles,
  Globe,
  Radio
} from 'lucide-react';
import { exportVerificationReportToJson, exportRecordsToCsv } from '../../utils/export';
import { computeSha256 } from '../../utils/crypto';
import { EventType, Severity } from '../../types';
import { QUAI_CONFIG } from '../../blockchain/quaiConfig';

export const Dashboard: React.FC = () => {
  const {
    records,
    checkpoints,
    alerts,
    lastVerification,
    runVerification,
    isVerifying,
    setActivePage,
    setSelectedRecordModal,
    setIsTamperModalOpen,
    isTampered,
    resetDemoChain,
    createRecord,
    networkEvents,
    appMode,
    anchorCheckpointOnQuai,
    walletState,
    connectWallet
  } = useTraceLock();

  const [chainSliceStart, setChainSliceStart] = useState<number>(0);
  const [activeWidgetTab, setActiveWidgetTab] = useState<'overview' | 'dispatcher' | 'scratchpad'>('overview');

  // Workable Live Event Dispatcher state
  const [actorInput, setActorInput] = useState<string>('ciso_vance');
  const [eventTypeInput, setEventTypeInput] = useState<EventType>('ADMIN_ACTION');
  const [severityInput, setSeverityInput] = useState<Severity>('medium');
  const [descInput, setDescInput] = useState<string>('Rotated root encryption key across cluster nodes');
  const [sourceSystemInput, setSourceSystemInput] = useState<string>('auth-gateway-01');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Workable Live SHA-256 Scratchpad state
  const [scratchInput, setScratchInput] = useState<string>('{"event":"AUTHORITY_GRANTED","agent":"credit-v4","limit":250000}');
  const [scratchHash, setScratchHash] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Compute live scratchpad hash dynamically on keystroke
  useEffect(() => {
    let isMounted = true;
    computeSha256(scratchInput).then((hash) => {
      if (isMounted) setScratchHash(hash);
    });
    return () => {
      isMounted = false;
    };
  }, [scratchInput]);

  const isIntact = lastVerification ? lastVerification.isChainIntact : !isTampered;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const latestCheckpoint = checkpoints[checkpoints.length - 1];

  const handleExportStatusReport = () => {
    if (lastVerification) {
      exportVerificationReportToJson(lastVerification);
    } else {
      exportRecordsToCsv(records);
    }
  };

  const handleDispatchEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput.trim()) return;
    setIsDispatching(true);

    try {
      await createRecord({
        timestamp: new Date().toISOString(),
        eventType: eventTypeInput,
        sourceSystem: sourceSystemInput,
        actor: actorInput,
        description: descInput,
        severity: severityInput,
        metadata: {
          ipAddress: '10.0.4.19',
          sessionProtocol: 'TLS 1.3 FIPS',
          environment: 'production'
        }
      });
      setDispatchSuccess(`Block #${records.length + 1} sealed and appended to ledger!`);
      setTimeout(() => setDispatchSuccess(null), 3500);
      setDescInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(scratchHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const visibleNodes = records.slice(chainSliceStart, chainSliceStart + 6);
  const totalAnchoredQuai = checkpoints.filter(c => c.anchorStatus === 'ANCHORED').length;
  const pendingAnchors = checkpoints.filter(c => c.anchorStatus === 'PENDING').length;
  const failedAnchors = checkpoints.filter(c => c.anchorStatus === 'FAILED').length;
  const quaiIntegrityStatus = isTampered ? 'Divergence Alert' : totalAnchoredQuai > 0 ? 'Verified Intact' : 'Pending Anchors';
  const lastAnchoredCheckpoint = checkpoints.find(c => c.anchorStatus === 'ANCHORED') || latestCheckpoint;
  const suspiciousNetCount = networkEvents.filter(e => e.riskLevel === 'critical' || e.riskLevel === 'high').length;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header with Moveable/Interactive View Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1528] font-sans">Integrity Command Center</h1>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded font-mono font-semibold">
              SHA-256 ACTIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Monitor system activity, seal real-time records, and verify the cryptographic integrity of digital evidence.
          </p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Current: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </span>
            <span>•</span>
            <span>Ledger: <strong className="text-slate-700">{records.length} blocks</strong></span>
            <span>•</span>
            <span>Last Audit: <strong className="text-slate-700">{lastVerification ? new Date(lastVerification.timestamp).toLocaleTimeString() : 'Verified'}</strong></span>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isTampered && (
            <button
              onClick={resetDemoChain}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Tamper State</span>
            </button>
          )}

          <button
            onClick={() => setIsTamperModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Simulate Tamper</span>
          </button>

          <button
            onClick={handleExportStatusReport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => runVerification('all')}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
          >
            <Play className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Hashes...' : 'Run Verification'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Workable Tab Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveWidgetTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
            activeWidgetTab === 'overview'
              ? 'bg-[#0B1528] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveWidgetTab('dispatcher')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
            activeWidgetTab === 'dispatcher'
              ? 'bg-[#0B1528] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Plus className="h-3.5 w-3.5 text-blue-400" />
          <span>Live Event Ingress Dispatcher</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">Workable</span>
        </button>

        <button
          onClick={() => setActiveWidgetTab('scratchpad')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
            activeWidgetTab === 'scratchpad'
              ? 'bg-[#0B1528] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cpu className="h-3.5 w-3.5 text-blue-400" />
          <span>Live SHA-256 Hash Scratchpad</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">Real-time</span>
        </button>
      </div>

      {/* 3. WORKABLE FEATURE: Live Ingress Event Dispatcher (Appends to real ledger!) */}
      {activeWidgetTab === 'dispatcher' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0B1528] flex items-center space-x-2">
                <span>Dispatch Live Activity Record & Seal to Ledger</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                  Live Execution
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate an authorized system event. Watch it calculate deterministic RFC 8785 canonical bytes, compute SHA-256, and bind to Block #{records.length}.
              </p>
            </div>
            {dispatchSuccess && (
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 animate-bounce">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{dispatchSuccess}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleDispatchEvent} className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Actor / Identity</label>
              <input
                type="text"
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
                placeholder="e.g. ciso_vance"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
              <select
                value={eventTypeInput}
                onChange={(e: any) => setEventTypeInput(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="ADMIN_ACTION">ADMIN_ACTION</option>
                <option value="CONFIG_CHANGE">CONFIG_CHANGE</option>
                <option value="PERMISSION_ESCALATION">PERMISSION_ESCALATION</option>
                <option value="FILE_ACCESS">FILE_ACCESS</option>
                <option value="FILE_MOD">FILE_MOD</option>
                <option value="LOGIN">LOGIN</option>
                <option value="SUSPICIOUS_ACTIVITY">SUSPICIOUS_ACTIVITY</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source System</label>
              <input
                type="text"
                value={sourceSystemInput}
                onChange={(e) => setSourceSystemInput(e.target.value)}
                placeholder="e.g. auth-gateway-01"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
              <select
                value={severityInput}
                onChange={(e: any) => setSeverityInput(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="info">Info</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payload / Description</label>
              <input
                type="text"
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder="Enter description of activity to be cryptographically sealed..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isDispatching}
                className="w-full py-2 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>{isDispatching ? 'Sealing Block...' : 'Seal & Append Block'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. WORKABLE FEATURE: Live SHA-256 Hash Scratchpad & Avalanche Tester */}
      {activeWidgetTab === 'scratchpad' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0B1528] flex items-center space-x-2">
                <span>Interactive SHA-256 Real-time Hash Scratchpad</span>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">
                  SubtleCrypto Native
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Type any text or modify a single character. See how the cryptographic avalanche effect alters the 256-bit hexadecimal digest instantly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Input String or JSON Payload</label>
              <textarea
                value={scratchInput}
                onChange={(e) => setScratchInput(e.target.value)}
                rows={4}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-blue-600"
                placeholder="Type anything to test instant SHA-256 calculation..."
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Length: {scratchInput.length} characters</span>
                <button
                  type="button"
                  onClick={() => setScratchInput('{"event":"AUTHORITY_GRANTED","agent":"credit-v4","limit":250000}')}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Load Sample Payload
                </button>
              </div>
            </div>

            <div className="space-y-2 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Calculated SHA-256 Digest (Hexadecimal)</label>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-blue-400 font-mono text-xs break-all shadow-inner">
                  {scratchHash || 'Computing...'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-mono">Digest size: 32 bytes (256 bits)</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUAI NETWORK STATUS CARD (Prompt Section 11) */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#102347] to-[#0B1528] rounded-2xl border border-slate-800 p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white font-sans">QUAI NETWORK</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                appMode === 'quai_testnet'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-blue-950/80 text-blue-300 border-blue-500/30'
              }`}>
                {appMode === 'quai_testnet' ? 'QUAI ORCHARD TESTNET' : 'DEMO MODE (QUAI SIMULATOR)'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Network</span>
                <span className="font-semibold text-slate-100">{QUAI_CONFIG.networkName} (Cyprus-1)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Anchored Checkpoints</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{totalAnchoredQuai} / {checkpoints.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Last Anchor</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {lastAnchoredCheckpoint?.anchoredAt
                    ? new Date(lastAnchoredCheckpoint.anchoredAt).toLocaleTimeString()
                    : '15m ago'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Blockchain Integrity</span>
                <span className={`font-semibold inline-flex items-center space-x-1 ${
                  isTampered ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${isTampered ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                  <span>{quaiIntegrityStatus}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActivePage('checkpoints')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/40 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Checkpoint Anchors ({checkpoints.length})</span>
            </button>

            <button
              onClick={() => setActivePage('network')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Radio className="h-3.5 w-3.5 text-blue-400" />
              <span>Network Intel ({networkEvents.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. 4 STATUS OVERVIEW CARDS (Classic Clean White on Slate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Integrity Status */}
        <div
          onClick={() => setActivePage('verification')}
          className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Integrity Status</span>
            <div className={`p-2 rounded-lg ${isIntact ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isIntact ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-xl font-bold tracking-tight ${isIntact ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isIntact ? 'Verified Intact' : 'Compromised'}
            </span>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isIntact
                ? 'All SHA-256 block hashes and sequential chain pointers pass FIPS validation.'
                : `${lastVerification?.failedCount || 1} record(s) fail deterministic hash comparison.`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600 group-hover:text-blue-700">
            <span>View Verification Center</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Records Collected */}
        <div
          onClick={() => setActivePage('activity')}
          className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Records Collected</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight text-[#0B1528] font-mono">
                {records.length}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +100% sealed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active ledger chain height: {records.length} blocks. Zero silent drops.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600 group-hover:text-blue-700">
            <span>Explore Activity Logs</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Tampering Alerts */}
        <div
          onClick={() => setActivePage('alerts')}
          className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tampering Alerts</span>
            <div className={`p-2 rounded-lg ${criticalAlerts > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold tracking-tight font-mono ${criticalAlerts > 0 ? 'text-rose-700' : 'text-[#0B1528]'}`}>
                {criticalAlerts}
              </span>
              <span className="text-xs text-slate-400">
                critical / {alerts.length} total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {criticalAlerts > 0 ? 'Active anomaly tripwire triggered.' : 'No active intrusion or modification alerts.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600 group-hover:text-blue-700">
            <span>Manage Alerts</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Secure Checkpoints */}
        <div
          onClick={() => setActivePage('checkpoints')}
          className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Secure Checkpoints</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight text-[#0B1528] font-mono">
                {checkpoints.length}
              </span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                WORM Anchored
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Latest: {latestCheckpoint ? latestCheckpoint.id : 'None'} • S3 Object Lock
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600 group-hover:text-blue-700">
            <span>Inspect Checkpoint Store</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 6. MOVEABLE & INTERACTIVE CRYPTOGRAPHIC HASH CHAIN VISUALIZATION */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#0B1528]">Cryptographic Hash Chain</h2>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-medium">
                SHA-256 Block Links
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Each block seals canonical payload attributes with the preceding block's digest: Hᵢ = SHA-256(Rᵢ || Hᵢ₋₁).
            </p>
          </div>

          {/* Moveable Chain Slider Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChainSliceStart(0)}
              disabled={chainSliceStart === 0}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              Genesis
            </button>
            <button
              onClick={() => setChainSliceStart(Math.max(0, chainSliceStart - 2))}
              disabled={chainSliceStart === 0}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              ← Shift
            </button>
            <span className="text-xs text-blue-700 font-mono font-semibold">
              Blocks {chainSliceStart + 1} - {Math.min(records.length, chainSliceStart + 6)} of {records.length}
            </span>
            <button
              onClick={() => setChainSliceStart(Math.min(records.length - 6, chainSliceStart + 2))}
              disabled={chainSliceStart + 6 >= records.length}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              Shift →
            </button>
            <button
              onClick={() => setChainSliceStart(Math.max(0, records.length - 6))}
              disabled={chainSliceStart + 6 >= records.length}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              Head
            </button>
          </div>
        </div>

        {/* Chain Flow Visualization */}
        <div className="pt-3 pb-2 overflow-x-auto">
          <div className="flex items-center space-x-3 min-w-max">
            {visibleNodes.map((rec, idx) => {
              const isCompromised = rec.isTampered || (lastVerification && lastVerification.tamperedRecords.some(t => t.recordId === rec.id));
              return (
                <React.Fragment key={rec.id}>
                  {/* Block Card */}
                  <div
                    onClick={() => setSelectedRecordModal(rec)}
                    className={`w-48 p-3 rounded-xl border transition-all cursor-pointer ${
                      isCompromised
                        ? 'bg-rose-50 border-rose-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900">{rec.id}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isCompromised
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        #{rec.chainIndex}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-700 line-clamp-1 font-medium">
                      {rec.eventType}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {rec.actor}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 font-mono text-[9px] text-blue-600 truncate">
                      SHA: {rec.currentHash.slice(0, 14)}...
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className={isCompromised ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-medium'}>
                        {isCompromised ? 'HASH MISMATCH' : 'Intact'}
                      </span>
                      <span className="text-slate-400 text-[9px]">
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Chain Link Arrow */}
                  {idx < visibleNodes.length - 1 && (
                    <div className="flex items-center">
                      <div className={`h-0.5 w-6 ${
                        isCompromised || visibleNodes[idx + 1]?.isTampered
                          ? 'bg-rose-400'
                          : 'bg-blue-500'
                      }`} />
                      <ArrowRight className={`h-3.5 w-3.5 -ml-1 ${
                        isCompromised || visibleNodes[idx + 1]?.isTampered ? 'text-rose-500' : 'text-blue-500'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Caption */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Cryptographically Sealed</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-slate-600">Tampered / Diverged</span>
            </span>
          </div>
          <button
            onClick={() => setActivePage('integrity')}
            className="text-blue-600 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Open Integrity Engine</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 7. HEALTH INVARIANTS & RECENT SECURITY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Integrity Invariant Compliance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B1528]">Verification Invariants & Health Trend</h3>
              <p className="text-xs text-slate-500">Real-time ledger consistency checks across all ingress pipelines.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
              Past 24 Hours
            </span>
          </div>

          {/* Clean Metric Bars */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Cryptographic Invariant Compliance</span>
                <span className={`font-mono font-bold ${isIntact ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isIntact ? '100.0% Passed' : '85.7% (Anomalies Active)'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isIntact ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-[85.7%]'}`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Immutable Checkpoint Synchronization</span>
                <span className="font-mono font-bold text-blue-600">100.0% Synchronized</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-full transition-all duration-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Audit Collector Throughput (443 events/min)</span>
                <span className="font-mono font-bold text-slate-800">Healthy Buffer</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 w-[94%] transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Triage Panel */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-[#0B1528]">Security Triage</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active integrity tripwires and anomaly alerts needing attention.
            </p>

            <div className="mt-4 space-y-2.5">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setActivePage('alerts')}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      alert.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                  </div>
                  <p className="font-medium text-slate-800 mt-1 line-clamp-1">{alert.title}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActivePage('alerts')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Open Alerts Queue</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 8. RECENT ACTIVITY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-bold text-[#0B1528]">Recent System Activity</h2>
          </div>
          <button
            onClick={() => setActivePage('activity')}
            className="text-xs font-mono text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Records ({records.length})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {records.slice(-5).reverse().map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedRecordModal(rec)}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getSeverityBadge(rec.severity)}`}>
                  {rec.severity.toUpperCase()}
                </span>
                <div>
                  <span className="text-xs font-semibold text-slate-800">{rec.eventType}</span>
                  <span className="text-xs text-slate-400 mx-1.5">•</span>
                  <span className="text-xs text-slate-600">{rec.description}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 shrink-0">
                <span className="text-slate-600">{rec.actor}</span>
                <span>•</span>
                <span>{rec.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
