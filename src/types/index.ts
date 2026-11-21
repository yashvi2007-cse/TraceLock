export type EventType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'FILE_ACCESS'
  | 'FILE_MOD'
  | 'FILE_CREATE'
  | 'FILE_DELETE'
  | 'PERM_CHANGE'
  | 'CONFIG_CHANGE'
  | 'ADMIN_ACTION'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SYSTEM_EVENT';

export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type IntegrityStatus = 'verified' | 'tampered' | 'unverified';

export interface SystemRecord {
  id: string; // e.g. TRC-2026-8941
  chainIndex: number;
  timestamp: string; // ISO format
  eventType: EventType;
  sourceSystem: string;
  actor: string;
  description: string;
  severity: Severity;
  metadata: Record<string, any>;
  prevHash: string; // SHA-256
  currentHash: string; // SHA-256
  integrityStatus: IntegrityStatus;
  // If tampered in demo mode, store original clean copy for comparison
  isTampered?: boolean;
  tamperedField?: string;
  originalPayloadHash?: string;
}

export type AppMode = 'demo' | 'quai_testnet';

export type StorageType = 
  | 'local_immutable'
  | 's3_object_lock'
  | 'hsm_vault'
  | 'cold_archive_worm'
  | 'quai_network';

export interface Checkpoint {
  id: string; // e.g. CHK-2026-0042
  timestamp: string;
  recordCount: number;
  coveredChainEndIndex: number;
  rootHash: string; // Tail hash of chain at this point
  storageType: StorageType;
  storageLocation: string;
  verificationStatus: 'verified' | 'diverged' | 'pending';
  signature: string;
  notes?: string;
  createdAt: string;

  // Quai Network Blockchain Anchoring Properties
  blockchainNetwork?: string;
  txHash?: string;
  blockNumber?: number;
  anchorStatus?: 'NOT_ANCHORED' | 'PENDING' | 'ANCHORED' | 'FAILED';
  onChainVerificationStatus?: 'VERIFIED' | 'MISMATCH' | 'NOT_ANCHORED' | 'VERIFICATION_FAILED';
  anchoredAt?: string;
  onChainRootHash?: string;
  submitterAddress?: string;
  explorerUrl?: string;
  merkleRoot?: string;
  previousCheckpointId?: string;
}

export type NetworkProtocol = 'TCP' | 'UDP' | 'ICMP' | 'TLS' | 'HTTP' | 'DNS' | 'SSH';

export type NetworkEventType = 
  | 'INCOMING_CONN'
  | 'OUTGOING_CONN'
  | 'PORT_SCAN'
  | 'REPEATED_ATTEMPTS'
  | 'FIREWALL_DROP'
  | 'UNUSUAL_TRAFFIC'
  | 'FAILED_HANDSHAKE';

export interface NetworkEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  port: number;
  protocol: NetworkProtocol;
  eventType: NetworkEventType;
  riskLevel: Severity;
  integrityStatus: IntegrityStatus;
  description: string;
  isSimulated: boolean;
  linkedRecordId?: string;
  currentHash: string;
  rawPayload?: Record<string, any>;
}

export type VaultStatus = 
  | 'Preserved' 
  | 'Pending' 
  | 'Failed' 
  | 'Retention Locked' 
  | 'Verification Failed' 
  | 'Unavailable';

export interface VaultObject {
  id: string; // e.g. VLT-2026-0042
  recordId: string;
  chainIndex: number;
  preservedAt: string;
  sha256Hash: string;
  storageProvider: 'local_demo_vault' | 's3_object_lock' | 'azure_immutable' | 'gcp_worm';
  status: VaultStatus;
  retentionUntil: string;
  isLocked: boolean;
  versionId: string;
  canonicalPayload: string;
}

export type AlertCategory =
  | 'TAMPERING_DETECTED'
  | 'HASH_MISMATCH'
  | 'BROKEN_CHAIN'
  | 'MISSING_RECORD'
  | 'CHECKPOINT_MISMATCH'
  | 'COLLECTOR_FAILURE'
  | 'SUSPICIOUS_ACTIVITY'
  | 'VERIFICATION_FAILURE';

export type AlertStatus = 'new' | 'investigating' | 'resolved' | 'dismissed';

export interface Alert {
  id: string;
  severity: Severity;
  timestamp: string;
  category: AlertCategory;
  title: string;
  description: string;
  relatedRecordId?: string;
  source: string;
  status: AlertStatus;
  expectedValue?: string;
  actualValue?: string;
}

export interface Investigation {
  id: string;
  caseNumber: string;
  title: string;
  leadInvestigator: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  status: 'open' | 'under_review' | 'closed' | 'archived';
  recordIds: string[];
  checkpointReference?: string;
  integrityVerdict?: 'verified' | 'compromised' | 'unverified';
}

export interface InvestigationIncident {
  id: string;
  title: string;
  detectedAt: string;
  affectedRecordId: string;
  sourceSystem: string;
  issueType: 'HASH_MISMATCH' | 'RECORD_TAMPERING' | 'CHAIN_DIVERGENCE' | 'CHECKPOINT_MISMATCH';
  severity: Severity;
  expectedHash: string;
  calculatedHash: string;
  prevHash: string;
  chainVerificationStatus: 'BROKEN_AT_BLOCK' | 'INTACT';
  checkpointComparison: 'MISMATCH_WITH_CHK_042' | 'CONFIRMED';
  vaultCopyAvailable: boolean;
  vaultCopyHash?: string;
  relatedRecordIds: string[];
  evidenceTrustStatus: 'VERIFIED' | 'WARNING' | 'COMPROMISED' | 'UNVERIFIED';
  notes: string;
  recommendedNextSteps: string[];
}

export interface CollectorSource {
  id: string;
  name: string;
  type: 'auditd' | 'syslog' | 'cloudtrail' | 'windows_event' | 'k8s_audit' | 'file_integrity';
  status: 'active' | 'paused' | 'error' | 'connected';
  lastSeen: string;
  endpoint: string;
  totalCollected: number;
  healthPercent: number;
  mode?: string;
  recordsPerMinute?: number;
  description?: string;
}

export interface VerificationFailureDetail {
  recordId: string;
  chainIndex: number;
  reason?: 'HASH_MISMATCH' | 'BROKEN_CHAIN_LINK' | 'CHECKPOINT_DIVERGENCE' | 'CANONICAL_ENCODING_ERROR';
  failureType: 'BROKEN_CHAIN_LINK' | 'HASH_MISMATCH' | 'CHECKPOINT_DIVERGENCE' | 'CANONICAL_ENCODING_ERROR';
  expectedHash: string;
  calculatedHash: string;
  expectedPrevHash?: string;
  actualPrevHash?: string;
  fieldAffected?: string;
  timestamp?: string;
  affectedBlockCount?: number;
  explanation: string;
  forensicImpact?: string;
  recommendedAction?: string;
  recommendation?: string;
}

export interface CheckpointMatch {
  checkpointId: string;
  expectedRoot: string;
  actualRoot: string;
  matched: boolean;
}

export interface VerificationReport {
  id: string;
  timestamp: string;
  recordsExamined: number;
  totalExamined: number;
  passedCount: number;
  failedCount: number;
  isChainIntact: boolean;
  tamperedRecords: VerificationFailureDetail[];
  checkpointId?: string;
  checkpointMatches: CheckpointMatch[];
  scope?: string;
  durationMs?: number;
  verifiedBy: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
}
