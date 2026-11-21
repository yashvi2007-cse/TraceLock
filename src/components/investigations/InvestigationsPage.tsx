import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  FileText,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Download,
  Lock,
  RotateCcw,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  FileCheck2,
  Share2,
  Eye,
  GitBranch
} from 'lucide-react';

export const InvestigationsPage: React.FC = () => {
  const {
    activeIncident,
    records,
    vaultObjects,
    restoreFromVault,
    setActivePage,
    setSelectedRecordModal
  } = useTraceLock();

  const [activeWorkflowStage, setActiveWorkflowStage] = useState<'detect' | 'explain' | 'trace' | 'assess' | 'preserve' | 'report'>('explain');

  const incident = activeIncident;
  const affectedRecord = records.find(r => r.id === incident?.affectedRecordId);
  const vaultCopy = vaultObjects.find(v => v.recordId === incident?.affectedRecordId);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1528] font-sans">Evidence Investigation Engine</h1>
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded font-mono font-semibold">
              CASE: {incident?.id || 'INC-2026-9041'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Reconstruct security incidents, analyze affected evidence blast radius, and retrieve independently preserved vault proofs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActivePage('demolab')}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Open Demo Lab Scenario</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 6-Stage Investigation Workflow Bar: DETECT → EXPLAIN → TRACE → ASSESS → PRESERVE → REPORT */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs grid grid-cols-2 sm:grid-cols-6 gap-1 text-center font-mono text-xs">
        {[
          { id: 'detect', label: '1. DETECT', desc: 'Identify Invariant Failure' },
          { id: 'explain', label: '2. EXPLAIN', desc: 'Plain Language Root Cause' },
          { id: 'trace', label: '3. TRACE', desc: 'Chain Dependencies' },
          { id: 'assess', label: '4. ASSESS', desc: 'Trust Status & Blast Radius' },
          { id: 'preserve', label: '5. PRESERVE', desc: 'Verify Vault Copy' },
          { id: 'report', label: '6. REPORT', desc: 'Forensic Audit Package' }
        ].map((stage) => {
          const isActive = activeWorkflowStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveWorkflowStage(stage.id as any)}
              className={`p-2.5 rounded-lg transition-all cursor-pointer text-left sm:text-center ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-[11px]">{stage.label}</div>
              <div className={`text-[10px] hidden sm:block ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                {stage.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Investigation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Cols: Investigation Workflow Body */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Incident Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-md bg-rose-50 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[#0B1528]">{incident?.title}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Detected: {incident?.detectedAt} • Source: {incident?.sourceSystem}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                {incident?.evidenceTrustStatus || 'COMPROMISED'}
              </span>
            </div>

            {/* Explainable Integrity Analysis (Section 7 Requirement) */}
            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                Explainable Integrity Analysis (No Black Box)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-800 block">1. WHAT CHANGED?</span>
                  <p className="text-slate-600 leading-relaxed">
                    Stored payload content in record <strong className="text-[#0B1528] font-mono">{incident?.affectedRecordId}</strong> and calculated SHA-256 fingerprint do not match. Stored value was manipulated without recalculating canonical hash.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-800 block">2. WHY DID VERIFICATION FAIL?</span>
                  <p className="text-slate-600 leading-relaxed">
                    The current record bytes no longer match the previously preserved integrity proof sealed in Checkpoint #CHK-2026-0042.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-800 block">3. WHAT IS AFFECTED?</span>
                  <p className="text-slate-600 leading-relaxed">
                    Primary DB record {incident?.affectedRecordId} is compromised. All subsequent blocks in this segment require chain link pointer re-verification.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-800 block">4. IS A PROTECTED COPY AVAILABLE?</span>
                  <p className="text-slate-600 leading-relaxed">
                    <strong>YES:</strong> Independent WORM vault copy <strong className="font-mono text-blue-700">{vaultCopy?.id || 'VLT-2026-0003'}</strong> is sealed under 7-year immutable retention. Original authentic payload can be retrieved safely.
                  </p>
                </div>
              </div>

              {/* Cryptographic Comparison Details */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-white font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                  <span>CRYPTOGRAPHIC COMPARISON TRACE</span>
                  <span className="text-blue-400">ALGORITHM: NIST FIPS 180-4 SHA-256</span>
                </div>
                <div>
                  <span className="text-slate-500 block">EXPECTED TRUSTED FINGERPRINT (PRESERVED):</span>
                  <span className="text-emerald-400 break-all select-all">{incident?.expectedHash}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CURRENT CALCULATED FINGERPRINT (MUTATED):</span>
                  <span className="text-rose-400 break-all select-all">{incident?.calculatedHash}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Impact Mapping (Section 5 Requirement) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-base text-[#0B1528]">Incident Impact Mapping & Blast Radius</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Non-Linear Relationship Graph</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              TraceLock evaluates chain dependency links. Connected records are categorized by mathematical status rather than indiscriminately flagging every node.
            </p>

            {/* Impact Diagram Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block mb-1">PRECEDING BLOCKS</span>
                <div className="font-bold text-emerald-950">Block #0001 - #0002</div>
                <div className="text-[11px] text-emerald-700 mt-1">Status: VERIFIED INTACT</div>
              </div>

              <div className="p-3 bg-rose-50 rounded-lg border-2 border-rose-400 shadow-xs">
                <span className="text-[10px] text-rose-800 font-bold block mb-1">MUTATION TARGET</span>
                <div className="font-bold text-rose-950">{incident?.affectedRecordId}</div>
                <div className="text-[11px] text-rose-700 mt-1">Status: DIRECTLY COMPROMISED</div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-300">
                <span className="text-[10px] text-amber-800 font-bold block mb-1">DOWNSTREAM LINK</span>
                <div className="font-bold text-amber-950">Block #0004</div>
                <div className="text-[11px] text-amber-800 mt-1">Status: REQUIRES REVIEW</div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-[10px] text-blue-800 font-bold block mb-1">VAULT BACKUP</span>
                <div className="font-bold text-blue-950">{vaultCopy?.id || 'VLT-2026-0003'}</div>
                <div className="text-[11px] text-blue-700 mt-1">Status: WORM SEALED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Recommended Actions & Evidence Recovery */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recovery from Vault Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-[#0B1528] flex items-center space-x-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>Independent Evidence Recovery</span>
            </h4>

            <p className="text-xs text-slate-500 leading-relaxed">
              Retrieve the unadulterated canonical copy from the Protected Evidence Vault to restore operational chain continuity.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Vault Copy:</span>
                <span className="font-mono font-bold text-blue-700">{vaultCopy?.id || 'VLT-2026-0003'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Immutability:</span>
                <span className="font-mono text-emerald-700 font-semibold">S3 Object Lock</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stored Digest:</span>
                <span className="font-mono text-slate-700 truncate max-w-[120px]">{incident?.expectedHash}</span>
              </div>
            </div>

            <button
              onClick={() => incident?.affectedRecordId && restoreFromVault(incident.affectedRecordId)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore Authentic Record</span>
            </button>
          </div>

          {/* Recommended Next Steps (Section 7 Requirement) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-[#0B1528]">Investigator Action Plan</h4>
            <div className="space-y-2 text-xs">
              {incident?.recommendedNextSteps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2 p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="h-4 w-4 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 leading-snug">{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActivePage('evidence')}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Generate Forensic Incident Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
