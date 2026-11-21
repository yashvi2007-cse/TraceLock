import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SystemRecord,
  Checkpoint,
  Alert,
  Investigation,
  InvestigationIncident,
  CollectorSource,
  VerificationReport,
  NotificationItem,
  StorageType,
  VaultObject,
  VaultStatus,
  AppMode,
  NetworkEvent
} from '../types';
import {
  generateInitialCanonicalChain,
  INITIAL_COLLECTOR_SOURCES
} from '../utils/initialData';
import { INITIAL_NETWORK_EVENTS } from '../utils/initialNetworkData';
import {
  calculateRecordHash,
  verifyRecordChain
} from '../utils/crypto';
import {
  connectQuaiWallet,
  anchorCheckpointToQuai,
  verifyCheckpointAgainstQuai,
  WalletState,
  AnchorTxResult,
  QuaiVerificationResult
} from '../blockchain/quaiService';
import { QUAI_CONFIG } from '../blockchain/quaiConfig';

export type NavigationPage = 
  | 'dashboard'
  | 'activity'
  | 'network'
  | 'collector'
  | 'integrity'
  | 'checkpoints'
  | 'vault'
  | 'verification'
  | 'investigations'
  | 'timeline'
  | 'evidence'
  | 'alerts'
  | 'demolab';

interface TraceLockContextType {
  records: SystemRecord[];
  checkpoints: Checkpoint[];
  alerts: Alert[];
  investigations: Investigation[];
  investigationIncidents: InvestigationIncident[];
  activeIncident: InvestigationIncident | null;
  setActiveIncident: (incident: InvestigationIncident | null) => void;
  vaultObjects: VaultObject[];
  collectorSources: CollectorSource[];
  isCollectorRunning: boolean;
  notifications: NotificationItem[];
  lastVerification: VerificationReport | null;
  isVerifying: boolean;
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  selectedRecordModal: SystemRecord | null;
  setSelectedRecordModal: (record: SystemRecord | null) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isTamperModalOpen: boolean;
  setIsTamperModalOpen: (open: boolean) => void;
  isTampered: boolean;
  demoLabStep: number;
  setDemoLabStep: (step: number) => void;

  // Quai Network & Dual Mode State
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  walletState: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  networkEvents: NetworkEvent[];
  ingestNetworkEvent: (eventId: string) => Promise<void>;
  simulateSuspiciousTraffic: () => void;
  anchorCheckpointOnQuai: (checkpointId: string) => Promise<AnchorTxResult>;
  verifyCheckpointOnQuai: (checkpointId: string) => Promise<QuaiVerificationResult>;
  
  // Actions
  runVerification: (scope?: 'all' | 'checkpoint', checkpointId?: string) => Promise<VerificationReport>;
  tamperRecord: (recordId: string, field: string, newValue: string) => Promise<void>;
  resetDemoChain: () => Promise<void>;
  restoreFromVault: (recordId: string) => Promise<void>;
  createRecord: (data: Omit<SystemRecord, 'id' | 'chainIndex' | 'prevHash' | 'currentHash' | 'integrityStatus'>) => Promise<void>;
  createCheckpoint: (storageType: StorageType, notes: string) => Promise<Checkpoint>;
  createInvestigation: (data: Omit<Investigation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAlertStatus: (alertId: string, status: Alert['status']) => void;
  toggleCollector: () => void;
  addCollectorSource: (source: Omit<CollectorSource, 'id' | 'totalCollected' | 'lastSeen' | 'healthPercent'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (title: string, message: string, type: NotificationItem['type']) => void;
}

const TraceLockContext = createContext<TraceLockContextType | undefined>(undefined);

export const TraceLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<SystemRecord[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [investigationIncidents, setInvestigationIncidents] = useState<InvestigationIncident[]>([]);
  const [activeIncident, setActiveIncident] = useState<InvestigationIncident | null>(null);
  const [vaultObjects, setVaultObjects] = useState<VaultObject[]>([]);
  const [collectorSources, setCollectorSources] = useState<CollectorSource[]>(INITIAL_COLLECTOR_SOURCES);
  const [isCollectorRunning, setIsCollectorRunning] = useState<boolean>(true);
  const [lastVerification, setLastVerification] = useState<VerificationReport | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [selectedRecordModal, setSelectedRecordModal] = useState<SystemRecord | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState<boolean>(false);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [demoLabStep, setDemoLabStep] = useState<number>(1);

  // Quai Network & Dual Mode State
  const [appMode, setAppMode] = useState<AppMode>('demo');
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: 'Not Connected',
    isCorrectNetwork: false,
    walletType: 'none',
    error: null
  });
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>(INITIAL_NETWORK_EVENTS);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Protected Vault Sync Active',
      message: 'Automatic dual-storage preservation active. Secondary copies sealed.',
      timestamp: '5m ago',
      type: 'info',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Independent Checkpoint Sealed',
      message: 'Checkpoint CHK-2026-0042 verified and stored to cold archive.',
      timestamp: '15m ago',
      type: 'success',
      read: false
    }
  ]);

  // Load initial clean chain
  useEffect(() => {
    async function init() {
      const initial = await generateInitialCanonicalChain();
      setRecords(initial.records);
      setCheckpoints(initial.checkpoints);
      setAlerts(initial.alerts);
      setInvestigations(initial.investigations);

      // Generate Vault Objects for initial records
      const initialVault: VaultObject[] = initial.records.map((rec, idx) => ({
        id: `VLT-2026-${(idx + 1).toString().padStart(4, '0')}`,
        recordId: rec.id,
        chainIndex: rec.chainIndex,
        preservedAt: rec.timestamp,
        sha256Hash: rec.currentHash,
        storageProvider: idx % 2 === 0 ? 's3_object_lock' : 'local_demo_vault',
        status: 'Preserved' as VaultStatus,
        retentionUntil: '2033-01-01T00:00:00Z',
        isLocked: true,
        versionId: `v1.0.${idx + 1}`,
        canonicalPayload: JSON.stringify(rec.metadata)
      }));
      setVaultObjects(initialVault);

      // Initialize an Investigation Incident
      const initialIncident: InvestigationIncident = {
        id: 'INC-2026-9041',
        title: 'Unauthorized Financial Record Revision (Northstar Financial)',
        detectedAt: '2026-03-29T14:24:12Z',
        affectedRecordId: 'TRC-2026-8943',
        sourceSystem: 'core-banking-db-01',
        issueType: 'RECORD_TAMPERING',
        severity: 'critical',
        expectedHash: '3a8901fc87d3a2b0e91f045c71d2b864a5c9314e08f6b21907e53a99e4f5091b',
        calculatedHash: 'e9b20d33f7c19a82001bbcf439d562bb750731a29f80206121481a6015b71940',
        prevHash: initial.records[1]?.currentHash || '7f83b1657ff1fc53b92dc18148a1d65d',
        chainVerificationStatus: 'INTACT',
        checkpointComparison: 'CONFIRMED',
        vaultCopyAvailable: true,
        vaultCopyHash: '3a8901fc87d3a2b0e91f045c71d2b864a5c9314e08f6b21907e53a99e4f5091b',
        relatedRecordIds: ['TRC-2026-8941', 'TRC-2026-8942', 'TRC-2026-8944'],
        evidenceTrustStatus: 'VERIFIED',
        notes: 'Monitored account balance transferred with privileged service token. Checkpoint verified against WORM archive.',
        recommendedNextSteps: [
          'Verify cryptographic hash against secondary cold vault copy VLT-2026-0003.',
          'Isolate affected DB node core-banking-db-01 credentials.',
          'Generate forensic audit evidence report for regulatory examiners.'
        ]
      };
      setInvestigationIncidents([initialIncident]);
      setActiveIncident(initialIncident);

      // Perform initial baseline verification
      const baselineReport = await verifyRecordChain(initial.records, initial.checkpoints);
      setLastVerification(baselineReport);
    }
    init();
  }, []);

  const addNotification = (title: string, message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Run real verification
  const runVerification = async (scope: 'all' | 'checkpoint' = 'all', checkpointId?: string): Promise<VerificationReport> => {
    setIsVerifying(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const report = await verifyRecordChain(records, checkpoints, scope, checkpointId);
      setLastVerification(report);

      if (!report.isChainIntact) {
        setIsTampered(true);
        addNotification(
          'Integrity Verification Alert',
          `Detected ${report.failedCount} hash chain invariant failure(s)! Broken chain identified.`,
          'error'
        );

        // Update active incident
        if (report.tamperedRecords.length > 0) {
          const fail = report.tamperedRecords[0];
          const rec = records.find(r => r.id === fail.recordId);
          setActiveIncident({
            id: `INC-2026-${Date.now().toString().slice(-4)}`,
            title: `Integrity Failure Detected: ${fail.recordId}`,
            detectedAt: new Date().toISOString(),
            affectedRecordId: fail.recordId,
            sourceSystem: rec?.sourceSystem || 'cluster-prod-01',
            issueType: 'HASH_MISMATCH',
            severity: 'critical',
            expectedHash: fail.expectedHash,
            calculatedHash: fail.calculatedHash,
            prevHash: rec?.prevHash || '',
            chainVerificationStatus: 'BROKEN_AT_BLOCK',
            checkpointComparison: 'MISMATCH_WITH_CHK_042',
            vaultCopyAvailable: true,
            vaultCopyHash: fail.expectedHash,
            relatedRecordIds: records.slice(Math.max(0, fail.chainIndex - 2), fail.chainIndex + 2).map(r => r.id),
            evidenceTrustStatus: 'COMPROMISED',
            notes: fail.explanation,
            recommendedNextSteps: [
              'Review independent Protected Evidence Vault copy.',
              'Retrieve uncompromised canonical payload from immutable storage.',
              'Issue tamper incident report to Chief Information Security Officer.'
            ]
          });
        }
      } else {
        setIsTampered(false);
        addNotification(
          'Verification Succeeded',
          `All ${report.recordsExamined} records and checkpoint proofs mathematically verified intact.`,
          'success'
        );
      }
      return report;
    } finally {
      setIsVerifying(false);
    }
  };

  // Injected Tampering function for Demo / Testing
  const tamperRecord = async (recordId: string, field: string, newValue: string) => {
    const updated = records.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          [field]: newValue,
          isTampered: true,
          tamperedField: field
        };
      }
      return r;
    });

    setRecords(updated);
    setIsTampered(true);

    // Update checkpoints covered by this record to reflect on-chain divergence
    const targetRec = records.find(r => r.id === recordId);
    if (targetRec) {
      setCheckpoints(prev => prev.map(c => {
        if (targetRec.chainIndex <= c.coveredChainEndIndex) {
          return {
            ...c,
            verificationStatus: 'diverged',
            onChainVerificationStatus: 'MISMATCH'
          };
        }
        return c;
      }));
    }

    // Create a real alert
    const newAlert: Alert = {
      id: `ALT-2026-${(alerts.length + 50).toString()}`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      category: 'TAMPERING_DETECTED',
      title: `Unauthorized Payload Mutation in ${recordId}`,
      description: `Field '${field}' was modified to '${newValue}'. Stored hash pointer diverges from canonical state and Quai on-chain checkpoint.`,
      relatedRecordId: recordId,
      source: 'TraceLock Tamper Sensor',
      status: 'new'
    };

    setAlerts(prev => [newAlert, ...prev]);

    // Recalculate verification to immediately illustrate divergence
    const report = await verifyRecordChain(updated, checkpoints);
    setLastVerification(report);

    addNotification(
      'Integrity Breach Injected',
      `Record ${recordId} was altered. Run verification or view incident impact to inspect evidence divergence.`,
      'warning'
    );
  };

  // Restore record from Protected Evidence Vault
  const restoreFromVault = async (recordId: string) => {
    const vaultCopy = vaultObjects.find(v => v.recordId === recordId);
    if (!vaultCopy) return;

    const initial = await generateInitialCanonicalChain();
    const cleanRec = initial.records.find(r => r.id === recordId);
    if (!cleanRec) return;

    setRecords(prev => prev.map(r => r.id === recordId ? cleanRec : r));
    
    // Check if any other tampered records remain
    const remainingTampered = records.filter(r => r.id !== recordId && r.isTampered).length;
    if (remainingTampered === 0) {
      setIsTampered(false);
    }

    addNotification(
      'Evidence Restored from Vault',
      `Record ${recordId} successfully restored from immutable vault object ${vaultCopy.id}.`,
      'success'
    );

    // Re-verify
    const updatedRecords = records.map(r => r.id === recordId ? cleanRec : r);
    const report = await verifyRecordChain(updatedRecords, checkpoints);
    setLastVerification(report);
  };

  // Reset demo to canonical pristine state
  const resetDemoChain = async () => {
    const initial = await generateInitialCanonicalChain();
    setRecords(initial.records);
    setCheckpoints(initial.checkpoints);
    setAlerts(initial.alerts);
    setInvestigations(initial.investigations);
    setIsTampered(false);
    setDemoLabStep(1);

    const report = await verifyRecordChain(initial.records, initial.checkpoints);
    setLastVerification(report);

    addNotification(
      'Chain Restored',
      'The cryptographic hash chain has been reset to its pristine canonical state.',
      'success'
    );
  };

  // Append new record
  const createRecord = async (data: Omit<SystemRecord, 'id' | 'chainIndex' | 'prevHash' | 'currentHash' | 'integrityStatus'>) => {
    const lastRec = records[records.length - 1];
    const chainIndex = records.length + 1;
    const prevHash = lastRec ? lastRec.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const id = `TRC-2026-${(1000 + chainIndex).toString()}`;

    const unhashed = {
      chainIndex,
      prevHash,
      timestamp: data.timestamp,
      eventType: data.eventType,
      sourceSystem: data.sourceSystem,
      actor: data.actor,
      description: data.description,
      severity: data.severity,
      metadata: data.metadata || {}
    };

    const currentHash = await calculateRecordHash(unhashed);

    const newRecord: SystemRecord = {
      ...unhashed,
      id,
      currentHash,
      integrityStatus: 'verified',
      isTampered: false
    };

    setRecords(prev => [...prev, newRecord]);

    // Automatically preserve copy in Vault (Module 05 automatic evidence preservation)
    const newVaultObj: VaultObject = {
      id: `VLT-2026-${(vaultObjects.length + 1).toString().padStart(4, '0')}`,
      recordId: id,
      chainIndex,
      preservedAt: data.timestamp,
      sha256Hash: currentHash,
      storageProvider: 's3_object_lock',
      status: 'Preserved',
      retentionUntil: '2033-01-01T00:00:00Z',
      isLocked: true,
      versionId: `v1.0.${vaultObjects.length + 1}`,
      canonicalPayload: JSON.stringify(data.metadata || {})
    };
    setVaultObjects(prev => [...prev, newVaultObj]);

    addNotification(
      'New Record Sealed & Preserved in Vault',
      `Record ${id} hashed into block #${chainIndex} and dual-stored in Protected Vault.`,
      'info'
    );
  };

  // Create an independent checkpoint
  const createCheckpoint = async (storageType: StorageType, notes: string): Promise<Checkpoint> => {
    const lastRec = records[records.length - 1];
    const id = `CHK-2026-${(checkpoints.length + 43).toString().padStart(4, '0')}`;
    const timestamp = new Date().toISOString();

    const locMap: Record<StorageType, string> = {
      local_immutable: 'local://var/log/tracelock/anchors/chk-latest.sig',
      s3_object_lock: 'us-east-1::s3-tracelock-worm-vault/chk-snap.json',
      hsm_vault: 'hsm-cluster-alpha::slot-4/tracelock-root-key',
      cold_archive_worm: 'datacenter-dr::lto-tape-partition-08',
      quai_network: 'quai://orchard-cyprus1.contract/0x71b268B1a1c93a08c02F9335fFDC81D5E7989396'
    };

    const newChk: Checkpoint = {
      id,
      timestamp,
      recordCount: records.length,
      coveredChainEndIndex: records.length,
      rootHash: lastRec ? lastRec.currentHash : 'GENESIS',
      storageType,
      storageLocation: locMap[storageType],
      verificationStatus: 'verified',
      signature: `ECDSA-SHA256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      notes,
      createdAt: timestamp,
      blockchainNetwork: storageType === 'quai_network' ? 'Quai Orchard Testnet (Cyprus-1)' : undefined,
      anchorStatus: storageType === 'quai_network' ? 'NOT_ANCHORED' : undefined,
      onChainVerificationStatus: storageType === 'quai_network' ? 'NOT_ANCHORED' : undefined
    };

    setCheckpoints(prev => [newChk, ...prev]);

    addNotification(
      'Independent Checkpoint Created',
      `Checkpoint ${id} anchored root hash to ${storageType.replace(/_/g, ' ')}.`,
      'success'
    );

    return newChk;
  };

  // Connect to Quai wallet (Pelagus / Web3)
  const connectWallet = async () => {
    const res = await connectQuaiWallet();
    setWalletState(res);
    if (res.isConnected) {
      addNotification(
        'Quai Wallet Connected',
        `Connected to ${res.address?.slice(0, 8)}... on ${res.networkName}.`,
        'success'
      );
    } else if (res.error) {
      addNotification('Wallet Connection', res.error, 'warning');
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      networkName: 'Not Connected',
      isCorrectNetwork: false,
      walletType: 'none',
      error: null
    });
    addNotification('Wallet Disconnected', 'Disconnected from Quai Network wallet.', 'info');
  };

  // Ingest a network event into TraceLock's cryptographic hash chain
  const ingestNetworkEvent = async (eventId: string) => {
    const ev = networkEvents.find(e => e.id === eventId);
    if (!ev) return;

    await createRecord({
      timestamp: new Date().toISOString(),
      eventType: ev.riskLevel === 'critical' || ev.riskLevel === 'high' ? 'SUSPICIOUS_ACTIVITY' : 'SYSTEM_EVENT',
      sourceSystem: `net-gateway-${ev.protocol.toLowerCase()}`,
      actor: `netflow_ingest_daemon`,
      description: `[Network Ingest] ${ev.description} (Src: ${ev.sourceIp}:${ev.port} -> Dst: ${ev.destinationIp})`,
      severity: ev.riskLevel,
      metadata: {
        networkEventId: ev.id,
        sourceIp: ev.sourceIp,
        destinationIp: ev.destinationIp,
        port: ev.port,
        protocol: ev.protocol,
        eventType: ev.eventType,
        isSimulated: ev.isSimulated
      }
    });

    setNetworkEvents(prev => prev.map(e => e.id === eventId ? { ...e, linkedRecordId: `TRC-2026-${records.length + 1}` } : e));
    addNotification('Network Event Ingested', `Ingested ${ev.id} into active SHA-256 hash chain as Block #${records.length + 1}.`, 'success');
  };

  // Simulate a live suspicious traffic burst
  const simulateSuspiciousTraffic = () => {
    const randomPorts = [22, 443, 3389, 8080, 53, 9001];
    const targetPort = randomPorts[Math.floor(Math.random() * randomPorts.length)];
    const newEv: NetworkEvent = {
      id: `NET-2026-${(networkEvents.length + 401).toString()}`,
      timestamp: new Date().toISOString(),
      sourceIp: `194.26.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 254 + 1)}`,
      destinationIp: '10.0.1.5',
      port: targetPort,
      protocol: targetPort === 53 ? 'DNS' : targetPort === 443 ? 'TLS' : 'TCP',
      eventType: targetPort === 22 ? 'REPEATED_ATTEMPTS' : targetPort === 53 ? 'UNUSUAL_TRAFFIC' : 'FIREWALL_DROP',
      riskLevel: targetPort === 53 ? 'critical' : 'high',
      integrityStatus: 'verified',
      description: `Simulated anomaly burst targeting perimeter port ${targetPort} with abnormal handshake cadence.`,
      isSimulated: true,
      currentHash: Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
    };

    setNetworkEvents(prev => [newEv, ...prev]);
    addNotification('Suspicious Traffic Alert', `Anomaly sensor captured ${newEv.id} on port ${targetPort}.`, 'warning');
  };

  // Anchor Checkpoint on Quai Network
  const anchorCheckpointOnQuai = async (checkpointId: string): Promise<AnchorTxResult> => {
    const chk = checkpoints.find(c => c.id === checkpointId);
    if (!chk) {
      throw new Error(`Checkpoint ${checkpointId} not found.`);
    }

    setCheckpoints(prev => prev.map(c => c.id === checkpointId ? { ...c, anchorStatus: 'PENDING' } : c));

    try {
      const res = await anchorCheckpointToQuai(
        chk.id,
        chk.rootHash,
        chk.recordCount,
        chk.previousCheckpointId || '0x0000000000000000000000000000000000000000000000000000000000000000',
        appMode === 'demo',
        walletState.address
      );

      if (res.success) {
        setCheckpoints(prev => prev.map(c => c.id === checkpointId ? {
          ...c,
          blockchainNetwork: res.network,
          txHash: res.txHash,
          blockNumber: res.blockNumber,
          anchorStatus: 'ANCHORED',
          onChainVerificationStatus: 'VERIFIED',
          anchoredAt: res.timestamp,
          onChainRootHash: chk.rootHash,
          submitterAddress: res.submitter,
          explorerUrl: res.explorerUrl
        } : c));

        addNotification(
          'Quai Testnet Anchor Confirmed',
          `Checkpoint ${chk.id} anchored to Quai Cyprus-1 (Tx: ${res.txHash.slice(0, 10)}..., Block #${res.blockNumber}).`,
          'success'
        );
      } else {
        setCheckpoints(prev => prev.map(c => c.id === checkpointId ? { ...c, anchorStatus: 'FAILED' } : c));
        addNotification('Quai Anchoring Failed', res.error || 'Transaction could not be confirmed on Quai Network.', 'error');
      }

      return res;
    } catch (err: any) {
      setCheckpoints(prev => prev.map(c => c.id === checkpointId ? { ...c, anchorStatus: 'FAILED' } : c));
      addNotification('Quai Anchoring Error', err?.message || 'Failed to submit anchor transaction.', 'error');
      throw err;
    }
  };

  // Verify Checkpoint against Quai Network
  const verifyCheckpointOnQuai = async (checkpointId: string): Promise<QuaiVerificationResult> => {
    const chk = checkpoints.find(c => c.id === checkpointId);
    if (!chk) {
      throw new Error(`Checkpoint ${checkpointId} not found.`);
    }

    // Recalculate local root hash from the records covered by this checkpoint
    const coveredRecords = records.filter(r => r.chainIndex <= chk.coveredChainEndIndex);
    const lastCoveredRecord = coveredRecords[coveredRecords.length - 1];
    const currentLocalRoot = lastCoveredRecord ? lastCoveredRecord.currentHash : 'GENESIS';

    const res = await verifyCheckpointAgainstQuai(
      chk.id,
      currentLocalRoot,
      chk.onChainRootHash || (chk.anchorStatus === 'ANCHORED' ? chk.rootHash : null),
      chk.txHash,
      chk.blockNumber,
      appMode === 'demo'
    );

    setCheckpoints(prev => prev.map(c => c.id === checkpointId ? {
      ...c,
      onChainVerificationStatus: res.status
    } : c));

    if (res.status === 'VERIFIED') {
      addNotification(
        'Quai Blockchain Verification: PASSED',
        `Checkpoint ${chk.id} matches immutable Quai Network root hash. Zero evidence modification.`,
        'success'
      );
    } else if (res.status === 'MISMATCH') {
      addNotification(
        'Quai Blockchain Divergence: TAMPERING DETECTED',
        `Current local ledger records diverge from immutable Quai Block #${chk.blockNumber || '1489218'}!`,
        'error'
      );
    }

    return res;
  };

  // Create investigation case
  const createInvestigation = (data: Omit<Investigation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = `INV-2026-${(investigations.length + 10).toString().padStart(2, '0')}`;
    const newInv: Investigation = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      integrityVerdict: 'verified'
    };

    setInvestigations(prev => [newInv, ...prev]);
    addNotification('Investigation Created', `Case ${data.caseNumber} opened with ${data.recordIds.length} linked records.`, 'info');
  };

  // Update alert status
  const updateAlertStatus = (alertId: string, status: Alert['status']) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status } : a));
    addNotification('Alert Updated', `Alert ${alertId} status changed to ${status}.`, 'info');
  };

  // Toggle collector pipeline
  const toggleCollector = () => {
    setIsCollectorRunning(prev => {
      const next = !prev;
      addNotification(
        next ? 'Collector Resumed' : 'Collector Paused',
        next ? 'Ingestion pipeline streaming events.' : 'Ingestion pipeline halted.',
        next ? 'info' : 'warning'
      );
      return next;
    });
  };

  // Add source connector
  const addCollectorSource = (source: Omit<CollectorSource, 'id' | 'totalCollected' | 'lastSeen' | 'healthPercent'>) => {
    const id = `src-${Date.now().toString().slice(-4)}`;
    const newSource: CollectorSource = {
      ...source,
      id,
      totalCollected: 0,
      lastSeen: 'Just now',
      healthPercent: 100
    };
    setCollectorSources(prev => [...prev, newSource]);
    addNotification('Source Connected', `Added ${source.name} (${source.type}) to active collector pool.`, 'success');
  };

  return (
    <TraceLockContext.Provider
      value={{
        records,
        checkpoints,
        alerts,
        investigations,
        investigationIncidents,
        activeIncident,
        setActiveIncident,
        vaultObjects,
        collectorSources,
        isCollectorRunning,
        notifications,
        lastVerification,
        isVerifying,
        activePage,
        setActivePage,
        selectedRecordModal,
        setSelectedRecordModal,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isTamperModalOpen,
        setIsTamperModalOpen,
        isTampered,
        demoLabStep,
        setDemoLabStep,
        runVerification,
        tamperRecord,
        resetDemoChain,
        restoreFromVault,
        createRecord,
        createCheckpoint,
        createInvestigation,
        updateAlertStatus,
        toggleCollector,
        addCollectorSource,
        markNotificationRead,
        clearNotifications,
        addNotification,
        appMode,
        setAppMode,
        walletState,
        connectWallet,
        disconnectWallet,
        networkEvents,
        ingestNetworkEvent,
        simulateSuspiciousTraffic,
        anchorCheckpointOnQuai,
        verifyCheckpointOnQuai
      }}
    >
      {children}
    </TraceLockContext.Provider>
  );
};

export const useTraceLock = () => {
  const context = useContext(TraceLockContext);
  if (!context) {
    throw new Error('useTraceLock must be used within a TraceLockProvider');
  }
  return context;
};
