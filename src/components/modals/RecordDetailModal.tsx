import React, { useState, useEffect } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Hash,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { calculateRecordHash, canonicalizeJson } from '../../utils/crypto';

export const RecordDetailModal: React.FC = () => {
  const {
    selectedRecordModal,
    setSelectedRecordModal,
    tamperRecord,
    setActivePage,
    createInvestigation
  } = useTraceLock();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [liveComputedHash, setLiveComputedHash] = useState<string>('');
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    async function recompute() {
      if (selectedRecordModal) {
        setIsComputing(true);
        const hash = await calculateRecordHash(selectedRecordModal);
        setLiveComputedHash(hash);
        setIsComputing(false);
      }
    }
    recompute();
  }, [selectedRecordModal]);

  if (!selectedRecordModal) return null;

  const record = selectedRecordModal;
  const isHashMatching = liveComputedHash === record.currentHash;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddToNewInvestigation = () => {
    createInvestigation({
      caseNumber: `CASE-${record.id}`,
      title: `Forensic Review: ${record.description.slice(0, 40)}...`,
      leadInvestigator: 'Helena Vance (CISO)',
      description: `Targeted investigation opened from record ${record.id} (${record.eventType}) observed on ${record.sourceSystem}.`,
      status: 'open',
      recordIds: [record.id]
    });
    setSelectedRecordModal(null);
    setActivePage('evidence');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-navy-900 text-white flex items-center justify-center">
              <Layers className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-slate-900">{record.id}</span>
                <span className="text-xs text-slate-600 font-medium">Chain Index #{record.chainIndex}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(record.severity)}`}>
                  {record.severity}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Sealed at {new Date(record.timestamp).toUTCString()}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedRecordModal(null)}
            className="p-1.5 text-slate-600 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Integrity Banner */}
          <div className={`p-4 rounded-lg border flex items-start space-x-3 ${
            isHashMatching
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}>
            {isHashMatching ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-semibold text-sm">
                {isHashMatching ? 'Cryptographic Verification Passed' : 'Cryptographic Integrity Compromised'}
              </div>
              <p className="mt-1 leading-relaxed">
                {isHashMatching
                  ? 'Canonical record attributes deterministically reproduce the stored SHA-256 block hash. Payload has not experienced tampering.'
                  : `Hash mismatch detected! The stored hash does not equal the hash calculated from the current record payload. Tampered field: '${record.tamperedField || 'unknown'}'.`}
              </p>
            </div>
          </div>

          {/* Primary Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Event Category</span>
              <p className="text-xs font-semibold text-slate-900 mt-1">{record.eventType}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Source System</span>
              <p className="text-xs font-semibold text-slate-900 mt-1">{record.sourceSystem}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Actor / User</span>
              <p className="text-xs font-semibold text-slate-900 mt-1">{record.actor}</p>
            </div>
          </div>

          {/* Action Description */}
          <div>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Activity Description</span>
            <div className="mt-1 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed font-sans">
              {record.description}
            </div>
          </div>

          {/* Cryptographic Chain Analysis */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <span>Cryptographic Proof & SHA-256 Hashes</span>
            </span>

            {/* Previous Hash Link */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">Previous Hash Pointer (Parent Block)</span>
                <button
                  onClick={() => handleCopy(record.prevHash, 'prev')}
                  className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800"
                >
                  {copiedField === 'prev' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedField === 'prev' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-700 break-all bg-white p-2 rounded border border-slate-200">
                {record.prevHash}
              </div>
            </div>

            {/* Stored Current Hash */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">Stored Hash Fingerprint</span>
                <button
                  onClick={() => handleCopy(record.currentHash, 'curr')}
                  className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800"
                >
                  {copiedField === 'curr' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedField === 'curr' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-700 break-all bg-white p-2 rounded border border-slate-200">
                {record.currentHash}
              </div>
            </div>

            {/* Live Recalculated Hash */}
            <div className={`p-3 rounded-lg border ${
              isHashMatching ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Live Recalculated Hash (Canonical Payload)</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isHashMatching ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isHashMatching ? 'Match Confirmed' : 'DIVERGENCE DETECTED'}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-800 break-all bg-white p-2 rounded border border-slate-200">
                {isComputing ? 'Calculating SHA-256...' : liveComputedHash}
              </div>
            </div>
          </div>

          {/* Canonical Payload JSON */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Canonical Metadata Payload</span>
              <button
                onClick={() => handleCopy(canonicalizeJson(record.metadata), 'meta')}
                className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800"
              >
                {copiedField === 'meta' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedField === 'meta' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto max-h-40">
              {JSON.stringify(record.metadata, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            NIST FIPS 180-4 deterministic hash chain representation.
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddToNewInvestigation}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors shadow-2xs"
            >
              Add to Evidence Investigation
            </button>
            <button
              onClick={() => setSelectedRecordModal(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-md transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
