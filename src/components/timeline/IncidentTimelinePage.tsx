import React, { useState, useMemo } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  Clock,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ChevronRight,
  ExternalLink,
  Layers,
  Calendar,
  Activity,
  User,
  Zap
} from 'lucide-react';

export const IncidentTimelinePage: React.FC = () => {
  const { records, checkpoints, setSelectedRecordModal, isTampered } = useTraceLock();

  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [highlightSuspicious, setHighlightSuspicious] = useState<boolean>(true);

  const filteredEvents = useMemo(() => {
    return records
      .filter(r => {
        if (selectedSeverity !== 'ALL' && r.severity !== selectedSeverity) return false;
        if (search) {
          const s = search.toLowerCase();
          return (
            r.id.toLowerCase().includes(s) ||
            r.actor.toLowerCase().includes(s) ||
            r.eventType.toLowerCase().includes(s) ||
            r.description.toLowerCase().includes(s)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [records, selectedSeverity, search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1528] font-sans">Incident Timeline Reconstruction</h1>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded font-mono font-semibold">
              CHRONOLOGICAL RECONSTRUCTION
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Analyze the complete chronological sequence before, during, and after an incident with checkpoint boundary markers.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-medium select-none">
            <input
              type="checkbox"
              checked={highlightSuspicious}
              onChange={(e) => setHighlightSuspicious(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Highlight Anomalies & Tampering</span>
          </label>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chronological timeline by actor, ID, description, or action..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-600"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High & Critical</option>
            <option value="medium">Medium</option>
            <option value="low">Low & Info</option>
          </select>

          <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
            Showing {filteredEvents.length} events
          </span>
        </div>
      </div>

      {/* Interactive Timeline Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="relative border-l-2 border-blue-200 ml-4 sm:ml-8 space-y-8 py-2">
          
          {filteredEvents.map((event, idx) => {
            const isCompromised = event.isTampered;
            const isSuspicious = event.severity === 'critical' || event.eventType === 'SUSPICIOUS_ACTIVITY' || isCompromised;

            // Check if this event marks a checkpoint boundary
            const checkpointMatch = checkpoints.find(c => c.coveredChainEndIndex === event.chainIndex);

            return (
              <React.Fragment key={event.id}>
                {/* Event Node on Timeline */}
                <div className="relative pl-6 sm:pl-8 group">
                  
                  {/* Timeline Node Bullet */}
                  <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 bg-white transition-all ${
                    isCompromised
                      ? 'border-rose-600 bg-rose-500 ring-4 ring-rose-100 animate-pulse'
                      : isSuspicious
                      ? 'border-amber-500 bg-amber-400 ring-4 ring-amber-100'
                      : 'border-blue-600 bg-blue-500 group-hover:ring-4 group-hover:ring-blue-100'
                  }`} />

                  {/* Event Card */}
                  <div
                    onClick={() => setSelectedRecordModal(event)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isCompromised
                        ? 'bg-rose-50/80 border-rose-300 shadow-sm'
                        : isSuspicious
                        ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                        : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-blue-700">Block #{event.chainIndex}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-xs text-slate-800 font-bold">{event.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          event.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                          event.severity === 'high' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-50 text-blue-800'
                        }`}>
                          {event.eventType}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="font-medium text-slate-900 leading-snug">{event.description}</p>
                      <div className="flex items-center space-x-2 text-slate-500 shrink-0 font-mono text-[11px]">
                        <User className="h-3 w-3 text-slate-400" />
                        <span>{event.actor}</span>
                        <span>({event.sourceSystem})</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 truncate max-w-xs sm:max-w-md">
                        SHA-256: <strong className={isCompromised ? 'text-rose-600' : 'text-blue-600'}>{event.currentHash.substring(0, 20)}...</strong>
                      </span>
                      <span className={`font-semibold ${isCompromised ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {isCompromised ? 'HASH MISMATCH (MUTATED)' : 'VERIFIED INTACT'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkpoint Boundary Marker */}
                {checkpointMatch && (
                  <div className="relative pl-6 sm:pl-8 my-4">
                    <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-mono flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-emerald-700" />
                        <span className="font-bold">SEALED CHECKPOINT: {checkpointMatch.id}</span>
                        <span className="text-emerald-700">({checkpointMatch.storageType.replace(/_/g, ' ')})</span>
                      </div>
                      <span className="text-[11px] text-emerald-700">Root: {checkpointMatch.rootHash.substring(0, 16)}...</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
