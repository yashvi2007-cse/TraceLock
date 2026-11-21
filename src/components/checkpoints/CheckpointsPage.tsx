import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Server,
  Cloud,
  HardDrive,
  FileCheck,
  Zap,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  Layers,
  AlertTriangle,
  FileDown
} from 'lucide-react';
import { Checkpoint, StorageType } from '../../types';
import { QUAI_CONFIG } from '../../blockchain/quaiConfig';
import { QuaiVerificationResult } from '../../blockchain/quaiService';
import { exportVerificationReportToJson } from '../../utils/export';

export const CheckpointsPage: React.FC = () => {
  const {
    checkpoints,
    records,
    createCheckpoint,
    runVerification,
    appMode,
    walletState,
    connectWallet,
    anchorCheckpointOnQuai,
    verifyCheckpointOnQuai
  } = useTraceLock();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<StorageType>('quai_network');
  const [notes, setNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResultModal, setVerificationResultModal] = useState<{
    checkpoint: Checkpoint;
    result: QuaiVerificationResult;
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const latestCheckpoint = checkpoints[0];
  const totalAnchored = checkpoints.filter(c => c.anchorStatus === 'ANCHORED').length;
  const totalPending = checkpoints.filter(c => c.anchorStatus === 'PENDING').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCheckpoint(selectedStorage, notes || 'Cryptographic integrity baseline.');
    setIsCreateModalOpen(false);
    setNotes('');
  };

  const handleAnchor = async (chkId: string) => {
    setAnchoringId(chkId);
    try {
      await anchorCheckpointOnQuai(chkId);
    } catch {
      // Notification handled in context
    } finally {
      setAnchoringId(null);
    }
  };

  const handleVerify = async (chk: Checkpoint) => {
    setVerifyingId(chk.id);
    try {
      const res = await verifyCheckpointOnQuai(chk.id);
      setVerificationResultModal({ checkpoint: chk, result: res });
    } finally {
      setVerifyingId(null);
    }
  };

  const getStorageBadge = (type: StorageType) => {
    switch (type) {
      case 'quai_network':
        return { label: 'Quai Network Testnet (Cyprus-1)', icon: Globe, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 's3_object_lock':
        return { label: 'AWS S3 Object Lock (Immutable WORM)', icon: Cloud, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'hsm_vault':
        return { label: 'Hardware Security Module (HSM)', icon: Server, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'cold_archive_worm':
        return { label: 'Cold Archive WORM Storage', icon: HardDrive, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Local Immutable Store', icon: Lock, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const filteredCheckpoints = checkpoints.filter(chk => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ANCHORED') return chk.anchorStatus === 'ANCHORED';
    if (filterStatus === 'PENDING') return chk.anchorStatus === 'PENDING';
    if (filterStatus === 'FAILED') return chk.anchorStatus === 'FAILED';
    if (filterStatus === 'VERIFIED') return chk.onChainVerificationStatus === 'VERIFIED';
    if (filterStatus === 'MISMATCH') return chk.onChainVerificationStatus === 'MISMATCH';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">
                  Blockchain Checkpoints & Quai Anchors
                </h1>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Quai Orchard Testnet
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate deterministic cryptographic commitments from system logs and anchor root hashes to Quai Network smart contract.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Checkpoint</span>
          </button>
        </div>
      </div>

      {/* Quai Network Anchoring Status Banner */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#112347] to-[#0B1528] text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-wider uppercase text-blue-300">
                Quai Network Anchor Status
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                appMode === 'quai_testnet'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                  : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
              }`}>
                {appMode === 'quai_testnet' ? 'LIVE TESTNET MODE' : 'DEMO MODE'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target Zone: <strong className="text-white">Cyprus-1 (Chain ID: 15000 / 0x3a98)</strong>
              <br />
              Contract: <span className="font-mono text-[11px] text-blue-300">{QUAI_CONFIG.contractAddress.slice(0, 16)}...</span>
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Zero sensitive audit payloads are stored on-chain. Only minimal 32-byte cryptographic root fingerprints are committed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Anchored on Quai</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{totalAnchored}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pending Anchors</span>
              <span className="text-xl font-bold font-mono text-amber-300">{totalPending}</span>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end space-y-2">
            <div className="text-xs text-slate-300">
              Wallet:{' '}
              {walletState.isConnected ? (
                <span className="font-mono text-emerald-400 font-bold">{walletState.address?.slice(0, 8)}...</span>
              ) : (
                <span className="text-slate-400">Not Connected</span>
              )}
            </div>

            {!walletState.isConnected ? (
              <button
                onClick={connectWallet}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer border border-blue-400/40 shadow-xs"
              >
                Connect Pelagus / Web3
              </button>
            ) : (
              <span className="text-[11px] text-emerald-300 flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Pelagus Ready (Cyprus-1)</span>
              </span>
            )}

            <a
              href={QUAI_CONFIG.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1"
            >
              <span>Open Quai Explorer</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

        </div>
      </div>

      {/* Latest Anchor Banner */}
      {latestCheckpoint && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Latest Checkpoint Snapshot
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold font-mono text-navy-950">{latestCheckpoint.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center space-x-1 ${
                  latestCheckpoint.onChainVerificationStatus === 'MISMATCH'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : latestCheckpoint.anchorStatus === 'ANCHORED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {latestCheckpoint.onChainVerificationStatus === 'MISMATCH' ? (
                    <>
                      <ShieldAlert className="h-3 w-3 text-rose-600" />
                      <span>Tamper Divergence Detected</span>
                    </>
                  ) : latestCheckpoint.anchorStatus === 'ANCHORED' ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Quai Testnet Anchored</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 text-amber-600" />
                      <span>Pending Blockchain Anchor</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Sealed at {new Date(latestCheckpoint.timestamp).toLocaleString()} • Covers {latestCheckpoint.recordCount} consecutive audit records
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">Root Hash Commitment</span>
              <div className="font-mono text-xs text-slate-800 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 max-w-md truncate">
                {latestCheckpoint.rootHash}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkpoints History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-navy-950">Checkpoint History & On-Chain Ledger Proofs</h2>
            <p className="text-xs text-slate-500">Historical cryptographic root hashes anchored to Quai Network & secondary WORM storage.</p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All ({checkpoints.length})</option>
              <option value="ANCHORED">Anchored on Quai</option>
              <option value="PENDING">Pending Anchor</option>
              <option value="VERIFIED">Verified Intact</option>
              <option value="MISMATCH">Tampered / Mismatch</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Checkpoint ID</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Records</th>
                <th className="py-3 px-4">Root Hash (SHA-256)</th>
                <th className="py-3 px-4">Network / Medium</th>
                <th className="py-3 px-4">Quai Anchor Status</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCheckpoints.map(chk => {
                const badge = getStorageBadge(chk.storageType);
                const isAnchored = chk.anchorStatus === 'ANCHORED';
                const isPending = chk.anchorStatus === 'PENDING';
                const isMismatch = chk.onChainVerificationStatus === 'MISMATCH';

                return (
                  <tr key={chk.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {chk.id}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(chk.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {chk.recordCount} blocks
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      <div className="flex items-center space-x-1.5">
                        <span>{chk.rootHash.slice(0, 14)}...</span>
                        <button
                          onClick={() => handleCopy(chk.rootHash, chk.id)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="Copy full hash"
                        >
                          {copiedId === chk.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        <badge.icon className="h-3 w-3" />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isAnchored ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Anchored (Block #{chk.blockNumber || 1489218})</span>
                          </span>
                          {chk.txHash && (
                            <a
                              href={chk.explorerUrl || `${QUAI_CONFIG.explorerUrl}/tx/${chk.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:underline block font-mono"
                              title={chk.txHash}
                            >
                              Tx: {chk.txHash.slice(0, 10)}... ↗
                            </a>
                          )}
                        </div>
                      ) : isPending ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Submitting to Quai...</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not Anchored</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isMismatch ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <ShieldAlert className="h-3 w-3" />
                          <span>MISMATCH (TAMPERED)</span>
                        </span>
                      ) : chk.onChainVerificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="h-3 w-3" />
                          <span>VERIFIED ON-CHAIN</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Unverified</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {!isAnchored ? (
                          <button
                            onClick={() => handleAnchor(chk.id)}
                            disabled={anchoringId === chk.id}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-2xs cursor-pointer"
                            title="Anchor cryptographic commitment onto Quai Network smart contract."
                          >
                            {anchoringId === chk.id ? 'Anchoring...' : 'Anchor on Quai'}
                          </button>
                        ) : null}

                        <button
                          onClick={() => handleVerify(chk)}
                          disabled={verifyingId === chk.id}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                        >
                          {verifyingId === chk.id ? 'Checking...' : 'Verify'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Checkpoint Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-navy-950">Seal Independent Integrity Checkpoint</h3>
            <p className="text-xs text-slate-500">
              Anchors the current chain tail digest ({records[records.length - 1]?.currentHash.slice(0, 16)}...) into an external tamper-proof reference.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storage Medium Destination
                </label>
                <select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value as StorageType)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="quai_network">Quai Network (Orchard Testnet Smart Contract Anchor)</option>
                  <option value="s3_object_lock">AWS S3 Object Lock (Compliance Mode WORM)</option>
                  <option value="hsm_vault">Hardware Security Module (HSM Cluster)</option>
                  <option value="cold_archive_worm">Air-Gapped Cold Archive Tape</option>
                  <option value="local_immutable">Local POSIX Immutable Kernel Vault</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Checkpoint Notes / Audit Rationale
                </label>
                <input
                  type="text"
                  placeholder="e.g. End-of-quarter forensic baseline anchor."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded text-[11px] text-slate-600 space-y-1">
                <div>Covered Record Count: <strong className="text-slate-800">{records.length} records</strong></div>
                <div>Root Hash: <span className="font-mono text-slate-800">{records[records.length - 1]?.currentHash.slice(0, 24)}...</span></div>
                <div>Network Target: <strong className="text-indigo-700">Quai Orchard Testnet (Zone Cyprus-1)</strong></div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs cursor-pointer"
                >
                  Seal & Anchor Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quai Verification Audit Proof Modal */}
      {verificationResultModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-navy-950 font-sans">
                  Quai Blockchain Verification Audit
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  verificationResultModal.result.status === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : verificationResultModal.result.status === 'MISMATCH'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {verificationResultModal.result.status}
                </span>
              </div>
              <button
                onClick={() => setVerificationResultModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-[10px] font-sans text-slate-400 block uppercase font-semibold">Local Recalculated Root</span>
                  <span className="text-slate-800 break-all text-[11px]">{verificationResultModal.result.localRootHash}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-[10px] font-sans text-slate-400 block uppercase font-semibold">Quai On-Chain Root</span>
                  <span className={`break-all text-[11px] font-bold ${
                    verificationResultModal.result.isMatch ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {verificationResultModal.result.onChainRootHash || 'NOT_ANCHORED'}
                  </span>
                </div>
              </div>

              {/* Step by step details */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="text-[10px] font-sans text-slate-400 uppercase font-semibold">Cryptographic Audit Sequence:</div>
                {verificationResultModal.result.details.map((detail, idx) => (
                  <div key={idx} className="text-slate-700 leading-relaxed flex items-start space-x-1.5">
                    <span className="text-blue-600 font-bold">›</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              {verificationResultModal.checkpoint.txHash && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Quai Tx: <strong className="font-mono text-slate-800">{verificationResultModal.checkpoint.txHash.slice(0, 16)}...</strong></span>
                  <a
                    href={verificationResultModal.checkpoint.explorerUrl || `${QUAI_CONFIG.explorerUrl}/tx/${verificationResultModal.checkpoint.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>View on Quai Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setVerificationResultModal(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
