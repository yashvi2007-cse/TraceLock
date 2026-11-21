import React, { useState, useMemo } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { exportRecordsToCsv } from '../../utils/export';
import { EventType, Severity } from '../../types';

export const ActivityLogs: React.FC = () => {
  const {
    records,
    setSelectedRecordModal,
    setIsTamperModalOpen
  } = useTraceLock();

  const [search, setSearch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedIntegrity, setSelectedIntegrity] = useState<string>('ALL');
  const [selectedActor, setSelectedActor] = useState<string>('ALL');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Extract unique actors
  const uniqueActors = useMemo(() => {
    return Array.from(new Set(records.map(r => r.actor))).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        // Search
        if (search) {
          const s = search.toLowerCase();
          const matches =
            r.id.toLowerCase().includes(s) ||
            r.actor.toLowerCase().includes(s) ||
            r.description.toLowerCase().includes(s) ||
            r.sourceSystem.toLowerCase().includes(s) ||
            r.currentHash.toLowerCase().includes(s);
          if (!matches) return false;
        }

        // Event Type
        if (selectedEventType !== 'ALL' && r.eventType !== selectedEventType) {
          return false;
        }

        // Severity
        if (selectedSeverity !== 'ALL' && r.severity !== selectedSeverity) {
          return false;
        }

        // Integrity
        if (selectedIntegrity === 'VERIFIED' && r.isTampered) return false;
        if (selectedIntegrity === 'TAMPERED' && !r.isTampered) return false;

        // Actor
        if (selectedActor !== 'ALL' && r.actor !== selectedActor) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [records, search, selectedEventType, selectedSeverity, selectedIntegrity, selectedActor, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  const handleExportFiltered = () => {
    exportRecordsToCsv(filteredRecords);
  };

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
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">Activity Records Explorer</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, and inspect cryptographically chained event records across all connected nodes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTamperModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Simulate Tamper</span>
          </button>

          <button
            onClick={handleExportFiltered}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV ({filteredRecords.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID, actor, description, source, or SHA-256 hash..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          {/* Event category filter */}
          <select
            value={selectedEventType}
            onChange={(e) => { setSelectedEventType(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="FILE_ACCESS">FILE_ACCESS</option>
            <option value="FILE_MOD">FILE_MOD</option>
            <option value="FILE_CREATE">FILE_CREATE</option>
            <option value="FILE_DELETE">FILE_DELETE</option>
            <option value="PERM_CHANGE">PERM_CHANGE</option>
            <option value="CONFIG_CHANGE">CONFIG_CHANGE</option>
            <option value="ADMIN_ACTION">ADMIN_ACTION</option>
            <option value="SUSPICIOUS_ACTIVITY">SUSPICIOUS_ACTIVITY</option>
            <option value="SYSTEM_EVENT">SYSTEM_EVENT</option>
          </select>

          {/* Severity filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => { setSelectedSeverity(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>

          {/* Integrity Status filter */}
          <select
            value={selectedIntegrity}
            onChange={(e) => { setSelectedIntegrity(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none"
          >
            <option value="ALL">All Integrity States</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="TAMPERED">Tampered Only</option>
          </select>

          {/* Actor filter */}
          <select
            value={selectedActor}
            onChange={(e) => { setSelectedActor(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none"
          >
            <option value="ALL">All Actors</option>
            {uniqueActors.map(actor => (
              <option key={actor} value={actor}>{actor}</option>
            ))}
          </select>

          {/* Sort direction toggle */}
          <button
            onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center space-x-1"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">{sortDirection === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>

        {/* Filter summaries */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing {paginatedRecords.length} of {filteredRecords.length} filtered entries ({records.length} total in chain)</span>
          {(selectedEventType !== 'ALL' || selectedSeverity !== 'ALL' || selectedIntegrity !== 'ALL' || selectedActor !== 'ALL' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedEventType('ALL');
                setSelectedSeverity('ALL');
                setSelectedIntegrity('ALL');
                setSelectedActor('ALL');
                setPage(1);
              }}
              className="text-brand-600 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Record ID / Index</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Source System</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Cryptographic Hash</th>
                <th className="py-3 px-4">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No activity logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => {
                  const isTampered = rec.isTampered;
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedRecordModal(rec)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isTampered ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        <div>{rec.id}</div>
                        <div className="text-[10px] text-slate-400 font-normal">Block #{rec.chainIndex}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div>
                          {new Date(rec.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(rec.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {rec.eventType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {rec.sourceSystem}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                        {rec.actor}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={rec.description}>
                        {rec.description}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(rec.severity)}`}>
                          {rec.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {rec.currentHash.slice(0, 12)}...
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isTampered
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isTampered ? (
                            <>
                              <XCircle className="h-3 w-3 text-rose-600" />
                              <span>TAMPERED</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>VERIFIED</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 rounded disabled:opacity-40 hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-slate-200 rounded disabled:opacity-40 hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
