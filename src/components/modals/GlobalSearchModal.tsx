import React, { useState, useMemo } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  Search,
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  FolderLock,
  ArrowRight
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    records,
    alerts,
    investigations,
    checkpoints,
    setSelectedRecordModal,
    setActivePage
  } = useTraceLock();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'records' | 'alerts' | 'cases' | 'checkpoints'>('all');

  const filtered = useMemo(() => {
    if (!query.trim()) return { records: [], alerts: [], investigations: [], checkpoints: [] };
    const q = query.toLowerCase();

    return {
      records: records.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.actor.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.eventType.toLowerCase().includes(q) ||
        r.sourceSystem.toLowerCase().includes(q)
      ),
      alerts: alerts.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
      ),
      investigations: investigations.filter(i =>
        i.caseNumber.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.leadInvestigator.toLowerCase().includes(q)
      ),
      checkpoints: checkpoints.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.storageLocation.toLowerCase().includes(q) ||
        c.rootHash.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      )
    };
  }, [query, records, alerts, investigations, checkpoints]);

  if (!isGlobalSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="relative bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records, users, SHA-256 hashes, cases, checkpoints..."
            className="w-full text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent font-sans"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
            ESC
          </kbd>
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="ml-2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center space-x-2 px-4 py-2 border-b border-slate-100 bg-slate-50/70 text-xs">
          {(['all', 'records', 'alerts', 'cases', 'checkpoints'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Results Container */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {!query.trim() ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Type to search across cryptographic records, integrity alerts, and forensic case files.
            </div>
          ) : (
            <>
              {/* Records */}
              {(activeTab === 'all' || activeTab === 'records') && filtered.records.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRecordModal(r);
                    setIsGlobalSearchOpen(false);
                  }}
                  className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-xs">
                      <FileText className="h-4 w-4 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-slate-900">{r.id}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">{r.eventType}</span>
                        <span className="text-[11px] text-slate-500 font-mono">by {r.actor}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{r.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}

              {/* Alerts */}
              {(activeTab === 'all' || activeTab === 'alerts') && filtered.alerts.map(a => (
                <div
                  key={a.id}
                  onClick={() => {
                    setActivePage('alerts');
                    setIsGlobalSearchOpen(false);
                  }}
                  className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-slate-900">{a.id}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold uppercase">{a.severity}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{a.title}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}

              {/* Cases */}
              {(activeTab === 'all' || activeTab === 'cases') && filtered.investigations.map(i => (
                <div
                  key={i.id}
                  onClick={() => {
                    setActivePage('evidence');
                    setIsGlobalSearchOpen(false);
                  }}
                  className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded bg-brand-50 text-brand-600 flex items-center justify-center">
                      <FolderLock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-slate-900">{i.caseNumber}</span>
                        <span className="text-xs text-slate-700 font-medium">{i.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">Lead: {i.leadInvestigator}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}

              {/* Empty state */}
              {filtered.records.length === 0 &&
               filtered.alerts.length === 0 &&
               filtered.investigations.length === 0 &&
               filtered.checkpoints.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No matching items found for "{query}".
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search TraceLock Cryptographic Index</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
