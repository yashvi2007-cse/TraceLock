import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Hash,
  Layers,
  ArrowRight,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  XCircle,
  FileCode,
  KeyRound,
  FileCheck2,
  Cpu
} from 'lucide-react';
import { calculateRecordHash, canonicalizeJson } from '../../utils/crypto';

export const IntegrityEngine: React.FC = () => {
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

  const [inspectIndex, setInspectIndex] = useState<number>(0);
  const activeRecord = records[inspectIndex] || records[0];

  const isIntact = lastVerification ? lastVerification.isChainIntact : !isTampered;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">Cryptographic Integrity Engine</h1>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
              SHA-256 FIPS 180-4
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Deterministic append-only hash chains providing mathematical proof of non-repudiation.
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

          <button
            onClick={() => runVerification('all')}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg flex items-center space-x-2 transition-all shadow-xs"
          >
            <Play className={`h-3.5 w-3.5 text-brand-400 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Math...' : 'Verify Chain Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Engine Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Hash Algorithm</span>
          <p className="text-xl font-bold text-navy-950 font-mono mt-1">SHA-256</p>
          <p className="text-xs text-slate-500 mt-1">256-bit collision-resistant digest</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Current Chain Length</span>
          <p className="text-xl font-bold text-navy-950 font-mono mt-1">{records.length} Blocks</p>
          <p className="text-xs text-slate-500 mt-1">Sequential block parent pointers</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Records Verified</span>
          <p className="text-xl font-bold text-emerald-600 font-mono mt-1">
            {lastVerification ? lastVerification.passedCount : records.length} / {records.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Passed cryptographic audit</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Chain Health</span>
          <p className={`text-xl font-bold font-mono mt-1 ${isIntact ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isIntact ? '100% INTACT' : 'COMPROMISED'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isIntact ? 'Zero hash collisions or breaks' : `${lastVerification?.failedCount || 1} block(s) diverged`}
          </p>
        </div>
      </div>

      {/* Cryptographic Architecture Concept Explanation */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-bold text-navy-950">How TraceLock Protects Evidence Against Manipulation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <span className="h-5 w-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">1</span>
              <span>Canonical Normalization</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Every system event payload is serialized using RFC 8785 JSON Canonicalization. Key orders, whitespaces, and numeric encodings are made deterministic.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <span className="h-5 w-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">2</span>
              <span>Parent Hash Binding</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Block <em>N</em> hashes its canonical attributes combined with the SHA-256 fingerprint of Block <em>N-1</em>. Modifying any past record breaks all future blocks.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <span className="h-5 w-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">3</span>
              <span>WORM Checkpointing</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Periodically, the chain's tail root hash is sealed to immutable write-once storage (S3 Object Lock / HSM), making retroactive history rewrite impossible.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Hash-Chain Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-navy-950">Interactive Ledger Chain Inspector</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any block along the cryptographic sequence to analyze its mathematical inputs and hash formula.
          </p>
        </div>

        {/* Node selector bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {records.map((r, i) => {
            const isSelected = i === inspectIndex;
            const isCompromised = r.isTampered;
            return (
              <button
                key={r.id}
                onClick={() => setInspectIndex(i)}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                    : isCompromised
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                #{r.chainIndex} ({r.id.split('-').pop()})
              </button>
            );
          })}
        </div>

        {/* Selected Block Breakdown */}
        {activeRecord && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Left: Mathematical inputs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Block #{activeRecord.chainIndex} Input Parameters
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  activeRecord.isTampered ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {activeRecord.isTampered ? 'DIVERGED' : 'SEALED & VALID'}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">1. Previous Block Hash Pointer</span>
                  <span className="text-slate-800 break-all">{activeRecord.prevHash}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">2. Timestamp (ISO-8601 UTC)</span>
                  <span className="text-slate-800">{activeRecord.timestamp}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">3. Actor / Origin Identity</span>
                  <span className="text-slate-800">{activeRecord.actor} ({activeRecord.sourceSystem})</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">4. Canonical Metadata Hash Payload</span>
                  <pre className="text-[10px] text-slate-700 overflow-x-auto max-h-24 mt-1">
                    {canonicalizeJson(activeRecord.metadata)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right: Cryptographic Digest & Mathematical Result */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Cryptographic Output & Digest
              </span>

              <div className="p-4 bg-navy-950 text-slate-200 rounded-xl space-y-4 font-mono text-xs shadow-inner">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-sans">SHA-256 Hashing Formula:</span>
                  <div className="text-brand-400 mt-1 font-semibold text-[11px]">
                    SHA256( Index || PrevHash || Timestamp || Actor || Metadata )
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-slate-400 text-[10px] uppercase block font-sans">Resulting Block Fingerprint:</span>
                  <div className="text-emerald-400 text-xs font-bold break-all mt-1 bg-navy-900 p-2.5 rounded border border-navy-800">
                    {activeRecord.currentHash}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] font-sans flex items-center justify-between">
                  <span className="text-slate-400">Deterministic verification status:</span>
                  <span className={activeRecord.isTampered ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {activeRecord.isTampered ? 'FAILED (TAMPERED)' : 'VERIFIED MATCH'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setSelectedRecordModal(activeRecord)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center"
                >
                  Inspect Full Record Details
                </button>
                <button
                  onClick={() => setIsTamperModalOpen(true)}
                  className="py-2 px-3 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center space-x-1"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Tamper Test</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
