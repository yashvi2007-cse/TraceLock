import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight,
  ChevronRight,
  Clock,
  Layers,
  FileCheck,
  Check
} from 'lucide-react';
import { exportVerificationReportToJson } from '../../utils/export';
import { VerificationReport } from '../../types';

export const VerificationCenter: React.FC = () => {
  const {
    records,
    checkpoints,
    lastVerification,
    runVerification,
    isVerifying,
    setSelectedRecordModal,
    setIsTamperModalOpen,
    isTampered,
    resetDemoChain
  } = useTraceLock();

  const [verifyScope, setVerifyScope] = useState<'all' | 'checkpoint' | 'recent'>('all');
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string>(checkpoints[checkpoints.length - 1]?.id || '');
  const [activeStep, setActiveStep] = useState<number>(4); // Default to viewing results
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const report = lastVerification;

  const handleStartVerification = async () => {
    setActiveStep(3); // Progress
    await runVerification(verifyScope === 'checkpoint' ? 'checkpoint' : 'all', selectedCheckpointId);
    setActiveStep(4); // Results
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">Verification Center</h1>
            <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded font-mono font-semibold">
              Deterministic Audit
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Conduct mathematical verification across all sequential hash chains and independent checkpoints.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isTampered && (
            <button
              onClick={resetDemoChain}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore Chain</span>
            </button>
          )}

          <button
            onClick={() => setIsTamperModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Simulate Tamper</span>
          </button>

          {report && (
            <button
              onClick={() => exportVerificationReportToJson(report)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export Audit JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Guided 4-Step Verification Workflow */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        
        {/* Step Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-slate-100 pb-4 text-xs font-semibold">
          <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
            activeStep >= 1 ? 'bg-brand-50/70 border-brand-200 text-brand-800' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="h-5 w-5 rounded-full bg-white text-brand-700 flex items-center justify-center text-[10px] shadow-2xs">1</span>
            <span>Select Scope</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
            activeStep >= 2 ? 'bg-brand-50/70 border-brand-200 text-brand-800' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="h-5 w-5 rounded-full bg-white text-brand-700 flex items-center justify-center text-[10px] shadow-2xs">2</span>
            <span>Parameters</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
            isVerifying ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse' : activeStep >= 3 ? 'bg-brand-50/70 border-brand-200 text-brand-800' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="h-5 w-5 rounded-full bg-white text-brand-700 flex items-center justify-center text-[10px] shadow-2xs">3</span>
            <span>Cryptographic Run</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
            activeStep >= 4 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <span className="h-5 w-5 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[10px] shadow-2xs">4</span>
            <span>Audit Findings</span>
          </div>
        </div>

        {/* Step Controls Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Target Scope
            </label>
            <select
              value={verifyScope}
              onChange={(e) => setVerifyScope(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">Entire Ledger Chain ({records.length} Blocks)</option>
              <option value="checkpoint">Against WORM Checkpoint Root</option>
              <option value="recent">Past 10 Activity Blocks</option>
            </select>
          </div>

          {verifyScope === 'checkpoint' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Checkpoint Root to Compare
              </label>
              <select
                value={selectedCheckpointId}
                onChange={(e) => setSelectedCheckpointId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              >
                {checkpoints.map(chk => (
                  <option key={chk.id} value={chk.id}>
                    {chk.id} ({chk.storageType})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={handleStartVerification}
              disabled={isVerifying}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-50 rounded-md flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <Play className={`h-3.5 w-3.5 text-brand-400 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Recalculating SHA-256...' : 'Execute Deep Verification'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Results Panel */}
      {report && (
        <div className="space-y-6">
          
          {/* Main Verdict Card */}
          <div className={`rounded-xl border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            report.isChainIntact
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-rose-50/70 border-rose-200'
          }`}>
            <div className="flex items-start space-x-3.5">
              <div className={`p-2.5 rounded-xl ${
                report.isChainIntact ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {report.isChainIntact ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className={`text-lg font-bold ${report.isChainIntact ? 'text-emerald-950' : 'text-rose-950'}`}>
                    {report.isChainIntact ? 'Integrity Audit Passed: Chain Fully Verified' : 'Integrity Anomaly Detected: Chain Compromised'}
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    report.isChainIntact ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                  }`}>
                    {report.isChainIntact ? 'NON-REPUDIABLE' : 'TAMPERED'}
                  </span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${report.isChainIntact ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {report.isChainIntact
                    ? `All ${report.totalExamined} records matched their deterministic SHA-256 digests and sequential parent pointers. Zero broken links.`
                    : `${report.failedCount} record(s) failed hash recalculation. Downstream blocks cannot authenticate history.`}
                </p>
                <div className="text-[11px] text-slate-500 mt-2">
                  Verified in {report.durationMs}ms via {report.verifiedBy} â¢ Report ID: {report.id}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => exportVerificationReportToJson(report)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs"
              >
                Download Attestation JSON
              </button>
            </div>
          </div>

          {/* Results Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Records Examined</span>
              <p className="text-xl font-bold text-navy-950 font-mono mt-1">{report.totalExamined}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Passed Verification</span>
              <p className="text-xl font-bold text-emerald-600 font-mono mt-1">{report.passedCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Failed / Diverged</span>
              <p className={`text-xl font-bold font-mono mt-1 ${report.failedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {report.failedCount}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">WORM Checkpoints Checked</span>
              <p className="text-xl font-bold text-brand-600 font-mono mt-1">
                {report.checkpointMatches.length} / {checkpoints.length}
              </p>
            </div>
          </div>

          {/* Explainable Failure Drilldown (if any failures) */}
          {report.tamperedRecords.length > 0 && (
            <div className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden space-y-4 p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Explainable Anomaly Breakdown & Root Cause</h3>
              </div>
              <p className="text-xs text-slate-600">
                Detailed cryptographic differential showing why the integrity check failed and forensic ramifications.
              </p>

              <div className="space-y-4 pt-2">
                {report.tamperedRecords.map((fail, i) => (
                  <div key={i} className="p-4 rounded-lg bg-rose-50/50 border border-rose-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{fail.recordId}</span>
                        <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                          {fail.failureType}
                        </span>
                        <span className="text-slate-500 font-mono">Position #{fail.chainIndex}</span>
                      </div>
                      <button
                        onClick={() => setSelectedRecordModal(records.find(r => r.id === fail.recordId) || null)}
                        className="text-brand-600 hover:underline font-semibold"
                      >
                        Inspect Block â
                      </button>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      <strong>Failure Explanation:</strong> {fail.explanation}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                      <div className="p-2.5 bg-white rounded border border-rose-200">
                        <span className="text-slate-500 block text-[10px] font-sans uppercase font-semibold">Expected Stored Hash</span>
                        <span className="text-slate-800 break-all">{fail.expectedHash}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded border border-rose-200">
                        <span className="text-slate-500 block text-[10px] font-sans uppercase font-semibold">Calculated Payload Hash</span>
                        <span className="text-rose-700 font-bold break-all">{fail.calculatedHash}</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                      <div className="font-semibold text-slate-900 text-[11px]">Forensic & Legal Significance:</div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{fail.forensicImpact}</p>
                      <div className="font-semibold text-slate-900 text-[11px] pt-1">Recommended Response Action:</div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{fail.recommendedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkpoint Cross-Verification Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-navy-950">Independent Checkpoint Cross-Verification</h3>
              <p className="text-xs text-slate-500">Comparing active chain state with immutable snapshots in cold storage.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Checkpoint Reference</th>
                    <th className="py-3 px-4">Preserved External Root</th>
                    <th className="py-3 px-4">Current Chain Root</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.checkpointMatches.map(chk => (
                    <tr key={chk.checkpointId} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">{chk.checkpointId}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{chk.expectedRoot.slice(0, 16)}...</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{chk.actualRoot.slice(0, 16)}...</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          chk.matched ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {chk.matched ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>{chk.matched ? 'Synchronized' : 'DIVERGED'}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
