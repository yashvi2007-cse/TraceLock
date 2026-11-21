import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  X,
  Zap,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileEdit,
  ShieldAlert
} from 'lucide-react';

export const TamperModal: React.FC = () => {
  const {
    isTamperModalOpen,
    setIsTamperModalOpen,
    records,
    checkpoints,
    tamperRecord,
    resetDemoChain,
    isTampered,
    setActivePage,
    runVerification
  } = useTraceLock();

  const [selectedRecordId, setSelectedRecordId] = useState<string>(records[2]?.id || '');
  const [fieldToTamper, setFieldToTamper] = useState<string>('actor');
  const [tamperedValue, setTamperedValue] = useState<string>('malicious_insider_root');
  const [hasApplied, setHasApplied] = useState(false);

  if (!isTamperModalOpen) return null;

  const currentRecord = records.find(r => r.id === selectedRecordId) || records[0];
  const coveringCheckpoint = checkpoints.find(c => currentRecord && currentRecord.chainIndex <= c.coveredChainEndIndex);
  const isCoveredByQuai = coveringCheckpoint?.anchorStatus === 'ANCHORED';

  const handleApplyTamper = async () => {
    if (!selectedRecordId) return;
    await tamperRecord(selectedRecordId, fieldToTamper, tamperedValue);
    setHasApplied(true);
  };

  const handleRunVerifyNow = async () => {
    setIsTamperModalOpen(false);
    setActivePage('verification');
    await runVerification('all');
  };

  const handleReset = async () => {
    await resetDemoChain();
    setHasApplied(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Zap className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tamper Simulation Lab</h3>
              <p className="text-[11px] text-slate-600">Demonstrate cryptographic chain failure & anomaly detection</p>
            </div>
          </div>
          <button
            onClick={() => setIsTamperModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            In standard databases, an attacker or compromised administrator can alter audit records without detection.
            TraceLock bonds every event into an immutable SHA-256 hash chain and anchors root commitments to Quai Network.
            Modifying any bit creates a mathematical divergence that breaks downstream links and invalidates the on-chain anchor.
          </p>

          {/* Form */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Record to Tamper With
              </label>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
              >
                {records.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} (#{r.chainIndex}) - {r.eventType} by {r.actor}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Field
                </label>
                <select
                  value={fieldToTamper}
                  onChange={(e) => setFieldToTamper(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 outline-none"
                >
                  <option value="actor">Actor / Username</option>
                  <option value="description">Activity Description</option>
                  <option value="severity">Severity Level</option>
                  <option value="sourceSystem">Source System</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Original Value
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentRecord ? String((currentRecord as any)[fieldToTamper] || '') : ''}
                  className="w-full text-xs bg-slate-200/70 border border-slate-300 rounded-md px-3 py-2 text-slate-600 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tampered (Unauthorized) Value
              </label>
              <input
                type="text"
                value={tamperedValue}
                onChange={(e) => setTamperedValue(e.target.value)}
                placeholder="Enter altered payload string..."
                className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Outcome notice if tampered */}
          {isTampered && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs flex items-start space-x-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-rose-900 space-y-1">
                <span className="font-semibold block">Chain State: Modified / Diverged</span>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Record {selectedRecordId} has been manipulated. The stored SHA-256 no longer reflects the payload attributes.
                </p>
                {isCoveredByQuai && (
                  <p className="text-[11px] text-rose-900 font-semibold bg-rose-100/90 p-2 rounded border border-rose-300">
                    ⚠️ This record has changed since the original checkpoint ({coveringCheckpoint?.id}) was anchored on Quai Network. The on-chain immutable root hash will permanently expose this alteration.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {isTampered ? (
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore Pristine Chain</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">Live deterministic SHA-256 recalculation</span>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={handleApplyTamper}
              className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              Apply Tampering
            </button>

            {isTampered && (
              <button
                onClick={handleRunVerifyNow}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors shadow-xs cursor-pointer"
              >
                Inspect in Verification Center →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
