import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Database,
  Archive,
  Key,
  HardDrive,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';

export const SecureVaultPage: React.FC = () => {
  const { vaultObjects, records, checkpoints, restoreFromVault, isTampered, runVerification } = useTraceLock();

  const [selectedStorage, setSelectedStorage] = useState<'all' | 's3_object_lock' | 'local_demo_vault'>('all');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const filteredVault = vaultObjects.filter(v => {
    if (selectedStorage === 'all') return true;
    return v.storageProvider === selectedStorage;
  });

  const handleRestore = async (recordId: string) => {
    setRestoringId(recordId);
    await restoreFromVault(recordId);
    setTimeout(() => setRestoringId(null), 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Honesty & Architecture Banner (Module 05 Requirement) */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-800 space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-amber-900 block">
              Storage Architecture & Immutability Notice
            </span>
            <p>
              Local demo instances use filesystem abstraction (<strong>LOCAL DEMO VAULT — NOT IMMUTABLE</strong>). Production environments enforce write-once-read-many (WORM) retention via <strong>Amazon S3 Object Lock</strong> in Compliance Mode with dedicated IAM boundary separation.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md font-mono text-[11px] font-bold">
            SEC 17a-4 Compliant
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1528] font-sans">Protected Evidence Vault</h1>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-semibold">
              DUAL-STORAGE ISOLATION
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Independently preserved evidence copies protected against deletion, revision, or primary database compromise.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Vault Health:</span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Preservation Online (100%)</span>
          </span>
        </div>
      </div>

      {/* 3-Tier Storage Isolation Concept Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tier 1: Primary Evidence Storage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Tier 01</span>
            <Database className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-sm text-[#0B1528]">Primary Operational Store</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Fast transactional PostgreSQL database powering dashboard search, logs query, and live indexing.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600">
            <span>Records: {records.length}</span>
            <span className="text-blue-600">Read / Write</span>
          </div>
        </div>

        {/* Tier 2: Protected Evidence Vault */}
        <div className="bg-white rounded-xl border-2 border-blue-600/40 p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-xl -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-blue-700">Tier 02 (Signature)</span>
            <Lock className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-sm text-[#0B1528]">Protected Evidence Vault</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Secondary write-only WORM repository isolated by separate service role. Application cannot delete historical objects.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600">
            <span>Preserved: {vaultObjects.length} Objects</span>
            <span className="text-emerald-600 font-bold">Write-Once Read-Many</span>
          </div>
        </div>

        {/* Tier 3: Independent Checkpoint Storage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Tier 03</span>
            <Archive className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-sm text-[#0B1528]">Independent Checkpoint Anchors</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Periodic state root proofs, ECDSA digital signatures, and cold storage hashes sealed off-cluster.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600">
            <span>Checkpoints: {checkpoints.length} Sealed</span>
            <span className="text-blue-600">Independent Proof</span>
          </div>
        </div>
      </div>

      {/* Vault Objects Explorer Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#0B1528]">Preserved Vault Records</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review independent evidence backups, retention locks, and compare against primary database state.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedStorage}
              onChange={(e: any) => setSelectedStorage(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 outline-none"
            >
              <option value="all">All Storage Providers ({vaultObjects.length})</option>
              <option value="s3_object_lock">S3 Object Lock (Compliance Mode)</option>
              <option value="local_demo_vault">Local Demo Vault</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400">
                <th className="pb-3">VAULT ID</th>
                <th className="pb-3">PRIMARY RECORD</th>
                <th className="pb-3">PRESERVED TIMESTAMP</th>
                <th className="pb-3">STORAGE PROVIDER</th>
                <th className="pb-3">RETENTION UNTIL</th>
                <th className="pb-3">VAULT STATUS</th>
                <th className="pb-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVault.map((obj) => {
                const primaryRec = records.find(r => r.id === obj.recordId);
                const hasDivergence = primaryRec && (primaryRec.isTampered || primaryRec.currentHash !== obj.sha256Hash);

                return (
                  <tr key={obj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-blue-700 flex items-center space-x-1.5">
                      <LockKeyhole className="h-3.5 w-3.5 text-blue-500" />
                      <span>{obj.id}</span>
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      <span>{obj.recordId}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">Block #{obj.chainIndex}</span>
                    </td>
                    <td className="py-3 text-slate-500">{obj.preservedAt}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {obj.storageProvider === 's3_object_lock' ? 'S3 Object Lock' : 'Local Demo Vault'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>Jan 2033 (7 yrs)</span>
                      </span>
                    </td>
                    <td className="py-3">
                      {hasDivergence ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          PRIMARY COMPROMISED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {obj.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {hasDivergence ? (
                        <button
                          onClick={() => handleRestore(obj.recordId)}
                          disabled={restoringId === obj.recordId}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs cursor-pointer"
                        >
                          {restoringId === obj.recordId ? 'Restoring...' : 'Restore from Vault'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Vault Match</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
