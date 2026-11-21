import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  Database,
  Lock,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { NetworkEvent, NetworkProtocol, Severity } from '../../types';

export const NetworkIntelligencePage: React.FC = () => {
  const {
    networkEvents,
    ingestNetworkEvent,
    simulateSuspiciousTraffic,
    setActivePage
  } = useTraceLock();

  const [search, setSearch] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedEventModal, setSelectedEventModal] = useState<NetworkEvent | null>(null);
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEvents = networkEvents.filter(ev => {
    if (selectedProtocol !== 'ALL' && ev.protocol !== selectedProtocol) return false;
    if (selectedRisk !== 'ALL' && ev.riskLevel !== selectedRisk) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ev.id.toLowerCase().includes(q) ||
        ev.sourceIp.toLowerCase().includes(q) ||
        ev.destinationIp.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalEvents = networkEvents.filter(e => e.riskLevel === 'critical' || e.riskLevel === 'high');
  const firewallDrops = networkEvents.filter(e => e.eventType === 'FIREWALL_DROP');
  const ingestedCount = networkEvents.filter(e => e.linkedRecordId).length;

  const handleIngest = async (eventId: string) => {
    setIngestingId(eventId);
    try {
      await ingestNetworkEvent(eventId);
    } finally {
      setIngestingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRiskBadge = (risk: Severity) => {
    switch (risk) {
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
      
      {/* Header & Transparency Notice */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">Network Intelligence & Telemetry</h1>
                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  NetFlow / RFC 5424
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor perimeter connection patterns, firewall tripwires, and ingest network security events into the immutable hash ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={simulateSuspiciousTraffic}
            className="px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Zap className="h-4 w-4 text-amber-600" />
            <span>Simulate Traffic Burst</span>
          </button>
        </div>
      </div>

      {/* Honest Scope & Methodology Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-blue-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-wider uppercase text-blue-300">
                Network Record Integrity Pipeline
              </span>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                NON-REPUDIATION
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
              Every network event captured is eligible for cryptographic anchoring:
              <strong className="text-white"> NETWORK EVENT → SHA-256 FINGERPRINT → CANONICAL CHAIN → QUAI BLOCKCHAIN ANCHOR</strong>.
              TraceLock guarantees post-incident auditability so investigators can verify whether network logs were altered.
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Notice: Sample events below reflect simulated enterprise perimeter telemetry (Syslog, NetFlow, eBPF) for evaluation purposes.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-1.5 bg-white/10 px-4 py-2.5 rounded-lg border border-white/10">
            <span className="text-[10px] text-slate-300 uppercase font-semibold">Ledger Ingested</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{ingestedCount} / {networkEvents.length}</span>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Captured</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-navy-950 font-mono mt-2">{networkEvents.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Perimeter & service mesh events</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Suspicious Patterns</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 font-mono mt-2">{criticalEvents.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Port scans, brute force, C2 telemetry</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Firewall Drops</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 font-mono mt-2">{firewallDrops.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Blocked perimeter probes</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Quai Chain Eligible</span>
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-mono mt-2">100%</p>
          <p className="text-[11px] text-slate-500 mt-1">Deterministic SHA-256 verifiable</p>
        </div>
      </div>

      {/* Network Events Explorer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-navy-950 font-sans">Network Activity Stream</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              {filteredEvents.length} events
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search IP, port, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 w-56"
              />
            </div>

            {/* Protocol Filter */}
            <select
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Protocols</option>
              <option value="TCP">TCP</option>
              <option value="TLS">TLS</option>
              <option value="SSH">SSH</option>
              <option value="HTTP">HTTP</option>
              <option value="DNS">DNS</option>
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Destination IP</th>
                <th className="py-3 px-4">Port / Proto</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Ledger Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No network events match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(ev => {
                  const isIngested = !!ev.linkedRecordId;
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-slate-900">{ev.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-800">
                        {ev.sourceIp}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-800">
                        {ev.destinationIp}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-semibold text-slate-900">:{ev.port}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-1 font-sans">
                          {ev.protocol}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {ev.eventType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRiskBadge(ev.riskLevel)}`}>
                          {ev.riskLevel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isIngested ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Chain Linked</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Pending Ingest</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedEventModal(ev)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>

                          {!isIngested ? (
                            <button
                              onClick={() => handleIngest(ev.id)}
                              disabled={ingestingId === ev.id}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                              title="Hash and link this network event into the canonical TraceLock ledger."
                            >
                              {ingestingId === ev.id ? 'Sealing...' : 'Ingest to Chain'}
                            </button>
                          ) : (
                            <button
                              onClick={() => setActivePage('integrity')}
                              className="px-2 py-1 text-[11px] text-emerald-700 hover:underline cursor-pointer"
                            >
                              View Block →
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Network Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-base text-navy-950">{selectedEventModal.id}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRiskBadge(selectedEventModal.riskLevel)}`}>
                  {selectedEventModal.riskLevel}
                </span>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {selectedEventModal.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-[10px] font-sans text-slate-400 block uppercase font-semibold">Source Endpoint</span>
                <span className="text-slate-800 font-bold">{selectedEventModal.sourceIp}:{selectedEventModal.port}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-[10px] font-sans text-slate-400 block uppercase font-semibold">Destination Endpoint</span>
                <span className="text-slate-800 font-bold">{selectedEventModal.destinationIp}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
              <span className="text-[10px] font-sans text-slate-400 block uppercase font-semibold">Cryptographic SHA-256 Digest</span>
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-800 break-all">
                <span>{selectedEventModal.currentHash}</span>
                <button
                  onClick={() => handleCopy(selectedEventModal.currentHash, selectedEventModal.id)}
                  className="ml-2 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                >
                  {copiedId === selectedEventModal.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {selectedEventModal.rawPayload && (
              <div className="bg-[#0B1528] text-slate-200 p-3 rounded-lg text-[11px] font-mono space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Raw NetFlow Payload Attributes:</div>
                <pre className="overflow-x-auto text-emerald-400">{JSON.stringify(selectedEventModal.rawPayload, null, 2)}</pre>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
              {!selectedEventModal.linkedRecordId && (
                <button
                  onClick={() => {
                    handleIngest(selectedEventModal.id);
                    setSelectedEventModal(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Ingest to TraceLock Ledger
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
