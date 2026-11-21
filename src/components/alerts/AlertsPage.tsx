import React, { useState, useMemo } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
  Check
} from 'lucide-react';
import { Alert, AlertStatus, Severity } from '../../types';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    updateAlertStatus,
    setSelectedRecordModal,
    records,
    setActivePage
  } = useTraceLock();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (search) {
        const s = search.toLowerCase();
        const matches =
          a.id.toLowerCase().includes(s) ||
          a.title.toLowerCase().includes(s) ||
          a.description.toLowerCase().includes(s) ||
          a.source.toLowerCase().includes(s);
        if (!matches) return false;
      }

      if (selectedStatus !== 'ALL' && a.status !== selectedStatus) {
        return false;
      }

      if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) {
        return false;
      }

      return true;
    });
  }, [alerts, search, selectedStatus, selectedSeverity]);

  const activeAlert = alerts.find(a => a.id === activeAlertId) || filteredAlerts[0];
  const relatedRecord = activeAlert?.relatedRecordId
    ? records.find(r => r.id === activeAlert.relatedRecordId)
    : undefined;

  const getSeverityBadge = (sev: Severity) => {
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

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'new':
        return 'bg-rose-100 text-rose-800 font-bold';
      case 'investigating':
        return 'bg-amber-100 text-amber-800 font-medium';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 font-medium';
      case 'dismissed':
        return 'bg-slate-100 text-slate-600 font-medium';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">Alerts & Anomalies</h1>
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-mono font-semibold">
              Real-Time Tripwire
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Active integrity deviations, cryptographic hash mismatches, and broken chain alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Total Alerts: {alerts.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by title, description, or source..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="new">New</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none"
        >
          <option value="ALL">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Main Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Alert List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Triage Queue ({filteredAlerts.length})</span>
            <span className="text-[11px] text-slate-500">Live Detection Feed</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No alerts match the selected criteria.
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = alert.id === activeAlert?.id;
                return (
                  <div
                    key={alert.id}
                    onClick={() => setActiveAlertId(alert.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-50/80 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{alert.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${getStatusBadge(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center space-x-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-900 line-clamp-1">{alert.title}</h3>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{alert.description}</p>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source: {alert.source}</span>
                      <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Alert Triage & Response */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          {activeAlert ? (
            <>
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{activeAlert.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${getStatusBadge(activeAlert.status)}`}>
                      {activeAlert.status}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(activeAlert.severity)}`}>
                      {activeAlert.severity}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-navy-950 mt-1.5">{activeAlert.title}</h2>
                  <div className="text-xs text-slate-500 mt-1">
                    Detected by {activeAlert.source} at {new Date(activeAlert.timestamp).toUTCString()}
                  </div>
                </div>

                {/* Workflow Status Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeAlert.status !== 'investigating' && (
                    <button
                      onClick={() => updateAlertStatus(activeAlert.id, 'investigating')}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                    >
                      Investigate
                    </button>
                  )}
                  {activeAlert.status !== 'resolved' && (
                    <button
                      onClick={() => updateAlertStatus(activeAlert.id, 'resolved')}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {activeAlert.status !== 'dismissed' && (
                    <button
                      onClick={() => updateAlertStatus(activeAlert.id, 'dismissed')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>

              {/* Alert Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Anomaly Analysis</span>
                <p className="text-xs text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {activeAlert.description}
                </p>
              </div>

              {/* Related Record Card */}
              {relatedRecord ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Associated Cryptographic Record ({relatedRecord.id})
                  </span>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{relatedRecord.id}</span>
                        <span className="text-[10px] font-semibold bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                          {relatedRecord.eventType}
                        </span>
                        <span className="text-slate-600">Actor: {relatedRecord.actor}</span>
                      </div>
                      <button
                        onClick={() => setSelectedRecordModal(relatedRecord)}
                        className="text-brand-600 hover:underline font-semibold"
                      >
                        Inspect Proof Modal â
                      </button>
                    </div>

                    <p className="text-slate-600">{relatedRecord.description}</p>
                    <div className="font-mono text-[10px] text-slate-500">
                      Fingerprint: {relatedRecord.currentHash}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded">
                  No single isolated record attached; anomaly reflects multi-node or ingress pipeline state.
                </div>
              )}

              {/* Recommended Response Action */}
              <div className="p-4 bg-brand-50/50 rounded-lg border border-brand-100 text-xs text-brand-900 space-y-1">
                <span className="font-bold block">Incident Response Recommendation:</span>
                <p className="leading-relaxed text-brand-800">
                  Execute independent checkpoint verification in the Verification Center. If this alert reflects deliberate tampering, review user credentials on the origin host and preserve the offline WORM archive for forensics.
                </p>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Select an alert from the triage queue to review anomaly specifics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
