import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  Radio,
  Plus,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Server,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { CollectorSource } from '../../types';

export const CollectorPage: React.FC = () => {
  const {
    collectorSources,
    isCollectorRunning,
    toggleCollector,
    addCollectorSource
  } = useTraceLock();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean } | null>(null);

  // New source form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CollectorSource['type']>('syslog');
  const [newEndpoint, setNewEndpoint] = useState('');
  const [newMode, setNewMode] = useState<CollectorSource['mode']>('LIVE CONNECTED');
  const [newDesc, setNewDesc] = useState('');

  const totalThroughput = collectorSources.reduce((acc, s) => acc + (isCollectorRunning ? (s.recordsPerMinute || 0) : 0), 0);
  const totalCollectedAll = collectorSources.reduce((acc, s) => acc + s.totalCollected, 0);

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      setTestResult({ id, success: true });
      setTimeout(() => setTestResult(null), 3000);
    }, 800);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEndpoint) return;

    addCollectorSource({
      name: newName,
      type: newType,
      endpoint: newEndpoint,
      status: 'connected',
      mode: newMode,
      recordsPerMinute: Math.floor(Math.random() * 50) + 10,
      description: newDesc || 'Automated activity ingest forwarder.'
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewEndpoint('');
    setNewDesc('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">TraceLock Collector Ingest</h1>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold flex items-center space-x-1 ${
              isCollectorRunning ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Radio className={`h-3 w-3 ${isCollectorRunning ? 'animate-pulse' : ''}`} />
              <span>{isCollectorRunning ? 'Ingest Pipeline ACTIVE' : 'Ingest PAUSED'}</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-source ingest pipelines feeding cryptographically signed blocks to the ledger.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleCollector}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs ${
              isCollectorRunning
                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isCollectorRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isCollectorRunning ? 'Pause All Collection' : 'Resume Collection'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Connect Ingest Source</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Sources</span>
          <p className="text-xl font-bold text-navy-950 font-mono mt-1">{collectorSources.length} Pipelines</p>
          <p className="text-xs text-slate-500 mt-1">Auditd, Syslog, K8s, CloudTrail</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Ingest Rate</span>
          <p className="text-xl font-bold text-brand-600 font-mono mt-1">{totalThroughput} events / min</p>
          <p className="text-xs text-slate-500 mt-1">Continuous buffer streaming</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Historical Volume</span>
          <p className="text-xl font-bold text-navy-950 font-mono mt-1">{totalCollectedAll.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total events ingested & hashed</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Buffer Loss / Drops</span>
          <p className="text-xl font-bold text-emerald-600 font-mono mt-1">0 Drops</p>
          <p className="text-xs text-slate-500 mt-1">Non-repudiation backpressure OK</p>
        </div>
      </div>

      {/* Connected Sources List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-950">Connected Ingest Sources</h2>
            <p className="text-xs text-slate-500">Live system agents and network syslog endpoints.</p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
              Mode: LIVE CONNECTED & DEMO FEEDS
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {collectorSources.map((source) => (
            <div key={source.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-navy-950">{source.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    source.mode === 'LIVE CONNECTED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {source.mode}
                  </span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                    {source.type}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{source.description}</p>
                <div className="text-[11px] font-mono text-slate-400">
                  Endpoint: {source.endpoint}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800">{source.recordsPerMinute} / min</div>
                  <div className="text-[11px] text-slate-400">{source.totalCollected.toLocaleString()} total</div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-emerald-600">{source.healthPercent}% Health</div>
                  <div className="text-[11px] text-slate-400">Seen: {source.lastSeen}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestConnection(source.id)}
                    disabled={testingId === source.id}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
                  >
                    {testingId === source.id ? 'Pinging TLS...' : 'Test Connection'}
                  </button>

                  {testResult && testResult.id === source.id && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ping 12ms OK</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Stream Log Console */}
      <div className="bg-navy-950 rounded-xl p-6 text-slate-300 font-mono text-xs shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-brand-400" />
            <span className="font-semibold text-slate-200">TraceLock Ingest Daemon Event Stream</span>
          </div>
          <span className="text-[11px] text-slate-500">Listening on port 6514 TLS & UNIX socket</span>
        </div>

        <div className="space-y-1.5 text-[11px] max-h-48 overflow-y-auto">
          <div className="text-slate-400">[2026-11-20T12:28:10Z] <span className="text-emerald-400">INFO</span> [syslog-forwarder] Ingress TLS handshake completed from ip-10-240-12-5.internal</div>
          <div className="text-slate-400">[2026-11-20T12:28:14Z] <span className="text-brand-400">SEAL</span> [ledger-engine] Canonical RFC 8785 payload computed for block #14</div>
          <div className="text-slate-400">[2026-11-20T12:28:22Z] <span className="text-emerald-400">INFO</span> [k8s-webhook] Pod creation telemetry verified with cluster certificate</div>
          <div className="text-slate-400">[2026-11-20T12:28:35Z] <span className="text-slate-500">HEARTBEAT</span> [auditd-agent] Buffer health 100%, latency 4.1ms</div>
          <div className="text-slate-400">[2026-11-20T12:28:50Z] <span className="text-emerald-400">INFO</span> [checkpoint-scheduler] WORM synchronization timer armed for next boundary</div>
        </div>
      </div>

      {/* Add Source Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-navy-950">Add Ingest Collector Source</h3>
            <p className="text-xs text-slate-500">
              Configure a system audit stream, syslog endpoint, or cloud management plane collector.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Identifier Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Azure Activity Log Forwarder"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source Architecture
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none"
                  >
                    <option value="syslog">Syslog (RFC 5424)</option>
                    <option value="auditd">Linux Kernel Auditd</option>
                    <option value="cloudtrail">AWS CloudTrail</option>
                    <option value="windows_event">Windows Event Log</option>
                    <option value="k8s_audit">Kubernetes API Audit</option>
                    <option value="file_integrity">FIM Tripwire Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Environment Mode
                  </label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none"
                  >
                    <option value="LIVE CONNECTED">LIVE CONNECTED</option>
                    <option value="DEMO DATA">DEMO DATA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endpoint URL or Socket Address
                </label>
                <input
                  type="text"
                  required
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  placeholder="tls://logs.corp.internal:6514"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ingest pipeline purpose and scope..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-md shadow-xs"
                >
                  Add Collector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
