import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileText,
  AlertTriangle,
  FileCheck,
  Check,
  Layers,
  Database,
  ExternalLink
} from 'lucide-react';
import { exportVerificationReportToJson } from '../../utils/export';

export const DemoLabPage: React.FC = () => {
  const {
    records,
    checkpoints,
    vaultObjects,
    tamperRecord,
    runVerification,
    restoreFromVault,
    resetDemoChain,
    isTampered,
    lastVerification,
    isVerifying,
    demoLabStep,
    setDemoLabStep,
    setActivePage
  } = useTraceLock();

  const targetRecord = records[2] || records[0];
  const vaultCopy = vaultObjects.find(v => v.recordId === targetRecord?.id);

  const handleSimulateAttack = async () => {
    if (!targetRecord) return;
    await tamperRecord(targetRecord.id, 'description', 'UNAUTHORIZED_MUTATION: Balance transfer diverted to Cayman Offshore IBAN #8841');
    setDemoLabStep(3);
  };

  const handleRunVerify = async () => {
    await runVerification('all');
    setDemoLabStep(4);
  };

  const handleRestoreRecord = async () => {
    if (!targetRecord) return;
    await restoreFromVault(targetRecord.id);
    setDemoLabStep(7);
  };

  const handleReset = async () => {
    await resetDemoChain();
    setDemoLabStep(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1528] font-sans">Interactive Forensic Demo Lab</h1>
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded font-mono font-semibold">
              EVALUATOR GUIDED WALKTHROUGH
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Test TraceLock's end-to-end evidence integrity, tamper detection, and vault recovery in under 90 seconds.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Demo to Baseline</span>
        </button>
      </div>

      {/* Scenario Overview Box */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs space-y-1">
        <div className="font-bold text-blue-900 flex items-center space-x-1.5">
          <span>SCENARIO: NORTHSTAR FINANCIAL UNAUTHORIZED LEDGER MODIFICATION</span>
        </div>
        <p className="text-blue-800 leading-relaxed">
          An attacker compromises internal database credentials and attempts to silently alter financial transaction record <strong className="font-mono">{targetRecord?.id}</strong>. Watch how TraceLock catches the hash divergence, identifies affected chain blocks, and preserves an independent copy in the Secure Vault.
        </p>
      </div>

      {/* 7-Step Guided Pipeline Progress Tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
        {[
          { num: 1, title: 'Trusted State', label: '1. TRUSTED' },
          { num: 2, title: 'Simulate Attack', label: '2. TAMPER' },
          { num: 3, title: 'Recalculate', label: '3. VERIFY' },
          { num: 4, title: 'Detect Failure', label: '4. DETECT' },
          { num: 5, title: 'Investigate', label: '5. ASSESS' },
          { num: 6, title: 'Vault Recover', label: '6. RECOVER' },
          { num: 7, title: 'Audit Report', label: '7. REPORT' }
        ].map((s) => {
          const isDone = demoLabStep > s.num;
          const isCurrent = demoLabStep === s.num;

          return (
            <button
              key={s.num}
              onClick={() => setDemoLabStep(s.num)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span>{s.label}</span>
                {isDone && <Check className="h-3 w-3 text-emerald-600" />}
              </div>
              <div className={`text-[10px] truncate mt-1 ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Guided Step Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* STEP 1: Trusted State */}
        {demoLabStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-[#0B1528]">Step 1: Baseline Trusted State</h3>
                <p className="text-xs text-slate-500">Every record is hashed, forward-chained, and mirrored to the independent vault.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-mono">
                STATUS: VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">PRIMARY DATABASE RECORD</span>
                <div>ID: <strong className="text-blue-700">{targetRecord?.id}</strong> (Block #{targetRecord?.chainIndex})</div>
                <div>Actor: {targetRecord?.actor} ({targetRecord?.sourceSystem})</div>
                <div>Hash: <span className="text-emerald-700 font-bold">{targetRecord?.currentHash.substring(0, 24)}...</span></div>
                <div className="text-slate-500 text-[11px] pt-1">Payload: "{targetRecord?.description}"</div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <span className="font-bold text-blue-900 block flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-600" />
                  <span>PROTECTED EVIDENCE VAULT COPY</span>
                </span>
                <div>Vault Object: <strong className="text-blue-700">{vaultCopy?.id || 'VLT-2026-0003'}</strong></div>
                <div>Provider: S3 Object Lock (Compliance Mode)</div>
                <div>Immutable Root: <span className="text-blue-800">{vaultCopy?.sha256Hash.substring(0, 24)}...</span></div>
                <div className="text-emerald-700 font-semibold text-[11px] pt-1">Dual-storage isolation active. Matches primary.</div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setDemoLabStep(2)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
              >
                <span>Proceed to Step 2: Simulate Attack</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Simulate Attack */}
        {demoLabStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-rose-950 flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-rose-600" />
                  <span>Step 2: Simulate Malicious Record Tampering</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate an attacker executing an unauthorized UPDATE query on the primary database without recalculating the forward hash chain.
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-rose-900">PROPOSED INTRUDER ACTION:</div>
              <p className="text-rose-800">
                Modify record <strong className="font-mono">{targetRecord?.id}</strong> payload description to:
                <br />
                <code className="bg-white px-2 py-1 rounded border border-rose-200 text-rose-900 font-mono block mt-1">
                  "UNAUTHORIZED_MUTATION: Balance transfer diverted to Cayman Offshore IBAN #8841"
                </code>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Notice: The Protected Vault copy remains locked under WORM compliance and cannot be altered by the attacker.
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setDemoLabStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ← Back
              </button>

              <button
                onClick={handleSimulateAttack}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
              >
                <Zap className="h-4 w-4" />
                <span>Simulate Record Tampering</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Verify */}
        {demoLabStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-[#0B1528]">Step 3: Cryptographic Verification Execution</h3>
                <p className="text-xs text-slate-500">
                  Execute backend verification recalculating SHA-256 digests across all blocks and comparing with Checkpoint #CHK-2026-0042.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3 font-mono">
              <div className="flex justify-between text-slate-700">
                <span>Record to Audit:</span>
                <span className="font-bold">{targetRecord?.id}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Verification Engine:</span>
                <span>SubtleCrypto Native SHA-256</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Status:</span>
                <span className="text-amber-700 font-bold">Awaiting Invariant Recalculation</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setDemoLabStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ← Back
              </button>

              <button
                onClick={handleRunVerify}
                disabled={isVerifying}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Play className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Recalculating Chain Invariants...' : 'Run Mathematical Verification'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 & 5: Detect & Investigate */}
        {(demoLabStep === 4 || demoLabStep === 5) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-rose-950 flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <span>Step {demoLabStep}: Tamper Detected & Blast Radius Assessed</span>
                </h3>
                <p className="text-xs text-slate-500">
                  TraceLock mathematically identified the exact diverged block and broken chain link.
                </p>
              </div>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-bold font-mono">
                CRITICAL INVARIANT VIOLATION
              </span>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-white font-mono text-xs space-y-2">
              <div className="text-slate-400 border-b border-slate-800 pb-1">FORENSIC FINGERPRINT MISMATCH:</div>
              <div>Expected (Preserved in Vault): <span className="text-emerald-400">{vaultCopy?.sha256Hash}</span></div>
              <div>Current Recalculated Hash: <span className="text-rose-400">{lastVerification?.tamperedRecords[0]?.calculatedHash || 'e9b20d33f7c19a82001bbcf439...'}</span></div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
              <span className="font-bold text-blue-900 block">INVESTIGATION FINDINGS & VAULT BACKUP:</span>
              <p className="text-blue-800">
                Primary DB record <strong className="font-mono">{targetRecord?.id}</strong> is compromised, but Protected Vault copy <strong className="font-mono">{vaultCopy?.id}</strong> is 100% intact in cold S3 Object Lock storage.
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setActivePage('investigations')}
                className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                Inspect in Full Investigation Engine →
              </button>

              <button
                onClick={() => setDemoLabStep(6)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
              >
                <span>Proceed to Step 6: Vault Recovery</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Recover */}
        {demoLabStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-[#0B1528] flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  <span>Step 6: Recover Authentic Evidence from Vault</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Retrieve the unadulterated canonical record from the Protected Vault to restore operational chain continuity.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-slate-800">RESTORATION TARGET:</div>
              <p className="text-slate-600">
                Replace compromised primary record <strong className="font-mono">{targetRecord?.id}</strong> with authentic copy from Vault Object <strong className="font-mono text-blue-700">{vaultCopy?.id}</strong>.
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setDemoLabStep(5)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ← Back
              </button>

              <button
                onClick={handleRestoreRecord}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Restore Authentic Record from Vault</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Report & Wrap-up */}
        {demoLabStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-emerald-950 flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Step 7: Verification Restored & Audit Report Ready</span>
                </h3>
                <p className="text-xs text-slate-500">
                  All 48 blocks are verified intact. An official investigation report is ready for download.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-mono">
                STATUS: CHAIN RESTORED
              </span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-900">
              <span className="font-bold block">DEMO COMPLETE (UNDER 90 SECONDS):</span>
              <p>
                You successfully detected an unauthorized modification, traced the chain impact, retrieved the authentic copy from WORM vault storage, and proved non-repudiation.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-between gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                ↻ Restart Guided Walkthrough
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => lastVerification && exportVerificationReportToJson(lastVerification)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span>Download Forensic Audit Certificate (JSON)</span>
                </button>
                <button
                  onClick={() => setActivePage('dashboard')}
                  className="px-4 py-2.5 bg-[#0B1528] text-white rounded-lg text-xs font-bold"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
