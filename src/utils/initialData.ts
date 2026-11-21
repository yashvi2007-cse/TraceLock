import { SystemRecord, Checkpoint, Alert, Investigation, CollectorSource } from '../types';
import { calculateRecordHash } from './crypto';

export const INITIAL_COLLECTOR_SOURCES: CollectorSource[] = [
  {
    id: 'src-auditd-prod',
    name: 'Linux Kernel Auditd (prod-srv-01)',
    type: 'auditd',
    endpoint: 'tls://auditd.internal.net:6514',
    status: 'connected',
    mode: 'LIVE CONNECTED',
    recordsPerMinute: 42,
    totalCollected: 24890,
    lastSeen: 'Just now',
    healthPercent: 99.8,
    description: 'Kernel-level syscall tracking and pam execution logger.'
  },
  {
    id: 'src-cloudtrail-aws',
    name: 'AWS CloudTrail Security Stream',
    type: 'cloudtrail',
    endpoint: 'arn:aws:sqs:us-east-1:748920194812:tracelock-ingest',
    status: 'connected',
    mode: 'LIVE CONNECTED',
    recordsPerMinute: 118,
    totalCollected: 94102,
    lastSeen: '12s ago',
    healthPercent: 100,
    description: 'Multi-region AWS management plane and IAM audit events.'
  },
  {
    id: 'src-k8s-audit',
    name: 'Kube-Audit Controller (EKS Core)',
    type: 'k8s_audit',
    endpoint: 'https://k8s-apiserver.internal:443/audit/webhook',
    status: 'connected',
    mode: 'LIVE CONNECTED',
    recordsPerMinute: 65,
    totalCollected: 48920,
    lastSeen: '4s ago',
    healthPercent: 98.9,
    description: 'Kubernetes RBAC, service accounts, and pod exec telemetry.'
  },
  {
    id: 'src-syslog-gateway',
    name: 'Enterprise Perimeter Syslog (RFC 5424)',
    type: 'syslog',
    endpoint: 'udp://syslog-collector.internal:514',
    status: 'connected',
    mode: 'LIVE CONNECTED',
    recordsPerMinute: 210,
    totalCollected: 184520,
    lastSeen: '1s ago',
    healthPercent: 99.4,
    description: 'Fortinet Next-Gen Firewall and VPN concentrator logs.'
  },
  {
    id: 'src-fim-vault',
    name: 'FIM Host Guard (Vault Server)',
    type: 'file_integrity',
    endpoint: 'agent://vault-node-03.sec.internal',
    status: 'connected',
    mode: 'LIVE CONNECTED',
    recordsPerMinute: 8,
    totalCollected: 6410,
    lastSeen: '25s ago',
    healthPercent: 100,
    description: 'Cryptographic hash tripwires on critical Linux binary directories.'
  }
];

interface RawRecordSeed {
  eventType: SystemRecord['eventType'];
  sourceSystem: string;
  actor: string;
  description: string;
  severity: SystemRecord['severity'];
  metadata: Record<string, any>;
  relativeSecondsAgo: number;
}

const RAW_SEEDS: RawRecordSeed[] = [
  {
    eventType: 'SYSTEM_EVENT',
    sourceSystem: 'auditd.internal.net',
    actor: 'systemd[1]',
    description: 'TraceLock cryptographic verification daemon initialized at boot sequence.',
    severity: 'info',
    metadata: { pid: 1, kernel: '6.5.0-35-generic', boot_id: 'd89f71c4-b771-48cb' },
    relativeSecondsAgo: 7200
  },
  {
    eventType: 'LOGIN',
    sourceSystem: 'srv-core-auth-01',
    actor: 'secadmin_karen',
    description: 'Privileged console authentication via FIDO2 WebAuthn token.',
    severity: 'info',
    metadata: { ip: '10.240.12.5', authMethod: 'FIDO2-Ed25519', userAgent: 'Mozilla/5.0 (TraceLock Admin)' },
    relativeSecondsAgo: 6840
  },
  {
    eventType: 'CONFIG_CHANGE',
    sourceSystem: 'srv-core-auth-01',
    actor: 'secadmin_karen',
    description: 'Updated SSH daemon configuration: disabled root password authentication.',
    severity: 'low',
    metadata: { configFile: '/etc/ssh/sshd_config', paramChanged: 'PermitRootLogin', oldValue: 'yes', newValue: 'prohibit-password' },
    relativeSecondsAgo: 6300
  },
  {
    eventType: 'FILE_ACCESS',
    sourceSystem: 'db-vault-main',
    actor: 'svc-backup-daemon',
    description: 'Scheduled read operation on encrypted database differential snapshot.',
    severity: 'info',
    metadata: { path: '/var/backups/postgres/diff_20261120.snap', sizeBytes: 849201940, bytesRead: 849201940 },
    relativeSecondsAgo: 5900
  },
  {
    eventType: 'PERM_CHANGE',
    sourceSystem: 'prod-k8s-cluster-east',
    actor: 'deploy_bot_github',
    description: 'Assigned ClusterRoleBinding: view-only permissions to auditor serviceaccount.',
    severity: 'low',
    metadata: { namespace: 'production', role: 'ClusterRole/read-only-auditor', targetSubject: 'ServiceAccount/sec-audit' },
    relativeSecondsAgo: 5400
  },
  {
    eventType: 'FILE_MOD',
    sourceSystem: 'db-vault-main',
    actor: 'dba_marcus',
    description: 'Rotated transparent data encryption key (TDE master key ID #8841).',
    severity: 'medium',
    metadata: { keyAlgorithm: 'AES-256-GCM', keyFingerprint: 'c8f491b8a32940e7', rotationReason: '90-day compliance cycle' },
    relativeSecondsAgo: 4800
  },
  {
    eventType: 'SUSPICIOUS_ACTIVITY',
    sourceSystem: 'perimeter-vpn-gw',
    actor: 'unknown_194.26.29.11',
    description: 'Repeated failed authentication attempts against administrative gateway (Brute force alert).',
    severity: 'high',
    metadata: { sourceIp: '194.26.29.11', geoCountry: 'NL', failedCount: 14, targetedAccount: 'admin' },
    relativeSecondsAgo: 4200
  },
  {
    eventType: 'ADMIN_ACTION',
    sourceSystem: 'perimeter-vpn-gw',
    actor: 'secops_auto_quarantine',
    description: 'Automated IP drop rule triggered: 194.26.29.11 added to perimeter blackhole list.',
    severity: 'medium',
    metadata: { firewallRuleId: 'FW-BLOCK-AUTO-941', durationSeconds: 86400, triggerAlert: 'BRUTE_FORCE_THRESH' },
    relativeSecondsAgo: 4150
  },
  {
    eventType: 'FILE_CREATE',
    sourceSystem: 'srv-core-auth-01',
    actor: 'secadmin_karen',
    description: 'Generated digital evidence manifest export for monthly SOC2 compliance audit.',
    severity: 'low',
    metadata: { filePath: '/var/reports/evidence_manifest_202611.pdf', sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08' },
    relativeSecondsAgo: 3200
  },
  {
    eventType: 'FILE_DELETE',
    sourceSystem: 'srv-core-auth-01',
    actor: 'sysadmin_lucas',
    description: 'Purged rotated temporary session tokens older than 30 days.',
    severity: 'info',
    metadata: { purgedRecordsCount: 4291, directory: '/tmp/session_cache/' },
    relativeSecondsAgo: 2400
  },
  {
    eventType: 'SUSPICIOUS_ACTIVITY',
    sourceSystem: 'prod-k8s-cluster-east',
    actor: 'unknown_service_token',
    description: 'Unauthorized attempt to mount host root filesystem into container pod namespace.',
    severity: 'critical',
    metadata: { podName: 'debug-tooling-x89', requestedVolume: '/host/root', admitted: false, policyBlocked: 'PSP-Strict-Isolation' },
    relativeSecondsAgo: 1600
  },
  {
    eventType: 'ADMIN_ACTION',
    sourceSystem: 'prod-k8s-cluster-east',
    actor: 'ciso_helena',
    description: 'Initiated container namespace quarantine and revoked compromised service account token.',
    severity: 'high',
    metadata: { revokedTokenId: 'tok-k8s-sec-940', isolatedNode: 'ip-10-0-4-192.ec2.internal' },
    relativeSecondsAgo: 1100
  },
  {
    eventType: 'LOGIN',
    sourceSystem: 'srv-core-auth-01',
    actor: 'ciso_helena',
    description: 'Emergency incident response team login from privileged bastion host.',
    severity: 'medium',
    metadata: { bastionIp: '10.240.0.4', sessionContext: 'INCIDENT_RESPONSE_SEV1', mfaValidated: true },
    relativeSecondsAgo: 700
  },
  {
    eventType: 'SYSTEM_EVENT',
    sourceSystem: 'db-vault-main',
    actor: 'tracelock_checkpoint_agent',
    description: 'Autonomous cryptographic checkpoint sealed and broadcast to immutable WORM store.',
    severity: 'info',
    metadata: { checkpointId: 'CHK-2026-0042', recordsSealed: 14, storageTarget: 's3-object-lock-compliant' },
    relativeSecondsAgo: 300
  }
];

export async function generateInitialCanonicalChain(): Promise<{
  records: SystemRecord[];
  checkpoints: Checkpoint[];
  alerts: Alert[];
  investigations: Investigation[];
}> {
  const records: SystemRecord[] = [];
  const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
  const now = Date.now();

  let prevHash = GENESIS_PREV_HASH;

  for (let i = 0; i < RAW_SEEDS.length; i++) {
    const seed = RAW_SEEDS[i];
    const recordTimestamp = new Date(now - seed.relativeSecondsAgo * 1000).toISOString();
    const id = `TRC-2026-${(1001 + i).toString()}`;
    const chainIndex = i + 1;

    const unhashedRecord = {
      chainIndex,
      prevHash,
      timestamp: recordTimestamp,
      eventType: seed.eventType,
      sourceSystem: seed.sourceSystem,
      actor: seed.actor,
      description: seed.description,
      severity: seed.severity,
      metadata: seed.metadata
    };

    const currentHash = await calculateRecordHash(unhashedRecord);

    const record: SystemRecord = {
      ...unhashedRecord,
      id,
      currentHash,
      integrityStatus: 'verified',
      isTampered: false
    };

    records.push(record);
    prevHash = currentHash;
  }

  // Checkpoints
  const checkpoints: Checkpoint[] = [
    {
      id: 'CHK-2026-0041',
      timestamp: new Date(now - 7000 * 1000).toISOString(),
      recordCount: 2,
      coveredChainEndIndex: 2,
      rootHash: records[1]?.currentHash || '7a8f90...',
      storageType: 's3_object_lock',
      storageLocation: 'us-east-1::s3-tracelock-worm-vault/chk-0041.json',
      verificationStatus: 'verified',
      signature: 'ECDSA-SHA256:3045022100a9b8c7d6e5f4...89b7a6c5d4',
      notes: 'Initial boot and authentication checkpoint sealed to AWS Immutable Object Lock.',
      createdAt: new Date(now - 6800 * 1000).toISOString()
    },
    {
      id: 'CHK-2026-0042',
      timestamp: new Date(now - 1200 * 1000).toISOString(),
      recordCount: records.length,
      coveredChainEndIndex: records.length,
      rootHash: records[records.length - 1]?.currentHash || 'c3b2a1...',
      storageType: 'quai_network',
      storageLocation: 'quai://orchard-cyprus1.contract/0x71b268B1a1c93a08c02F9335fFDC81D5E7989396',
      verificationStatus: 'verified',
      signature: 'ECDSA-SHA256:3046022100f2e1d0c9b8a7...1122334455',
      notes: 'Anchored to Quai Network Orchard Testnet smart contract on Cyprus-1 zone.',
      createdAt: new Date(now - 1180 * 1000).toISOString(),
      blockchainNetwork: 'Quai Orchard Testnet (Cyprus-1)',
      txHash: '0x3a89f410c920e8b174092bca1092837465abcde0192837465abcde0192837465',
      blockNumber: 1489218,
      anchorStatus: 'ANCHORED',
      onChainVerificationStatus: 'VERIFIED',
      anchoredAt: new Date(now - 1170 * 1000).toISOString(),
      onChainRootHash: records[records.length - 1]?.currentHash,
      submitterAddress: '0x002c9182aF9194b8eD058B6D19C80E53B0291944',
      explorerUrl: 'https://orchard.quaiscan.io/tx/0x3a89f410c920e8b174092bca1092837465abcde0192837465abcde0192837465'
    }
  ];

  // Alerts
  const alerts: Alert[] = [
    {
      id: 'ALT-2026-104',
      severity: 'critical',
      timestamp: records[10]?.timestamp || new Date(now - 1600 * 1000).toISOString(),
      category: 'SUSPICIOUS_ACTIVITY',
      title: 'Privilege Escalation: Container Root Mount Attempt',
      description: 'Host filesystem mount blocked by security admission controller for pod debug-tooling-x89.',
      relatedRecordId: records[10]?.id,
      source: 'prod-k8s-cluster-east',
      status: 'investigating'
    },
    {
      id: 'ALT-2026-103',
      severity: 'high',
      timestamp: records[6]?.timestamp || new Date(now - 4200 * 1000).toISOString(),
      category: 'SUSPICIOUS_ACTIVITY',
      title: 'Authentication Brute Force Detected',
      description: '14 consecutive failed VPN logins within 60s from 194.26.29.11.',
      relatedRecordId: records[6]?.id,
      source: 'perimeter-vpn-gw',
      status: 'resolved'
    }
  ];

  // Investigations
  const investigations: Investigation[] = [
    {
      id: 'INV-2026-09',
      caseNumber: 'SEC-CASE-2026-K8S-01',
      title: 'Unauthorized Container Root Escalation in Production EKS',
      leadInvestigator: 'Helena Vance (Chief Information Security Officer)',
      createdAt: new Date(now - 1500 * 1000).toISOString(),
      updatedAt: new Date(now - 200 * 1000).toISOString(),
      description: 'Forensic analysis of suspicious container creation attempting to mount host node storage directly. Evidence chain locked for post-mortem.',
      status: 'open',
      recordIds: [records[10]?.id || 'TRC-2026-1011', records[11]?.id || 'TRC-2026-1012', records[12]?.id || 'TRC-2026-1013'],
      checkpointReference: 'CHK-2026-0042',
      integrityVerdict: 'verified'
    },
    {
      id: 'INV-2026-08',
      caseNumber: 'SEC-CASE-2026-VPN-BRUTE',
      title: 'External Perimeter Brute Force & Automatic Blackhole Rule',
      leadInvestigator: 'Marcus Chen (Principal Threat Analyst)',
      createdAt: new Date(now - 4000 * 1000).toISOString(),
      updatedAt: new Date(now - 3500 * 1000).toISOString(),
      description: 'Review of ingress VPN brute force attacks originating from Dutch hosting ASNs and verification of automated defensive block action.',
      status: 'closed',
      recordIds: [records[6]?.id || 'TRC-2026-1007', records[7]?.id || 'TRC-2026-1008'],
      checkpointReference: 'CHK-2026-0041',
      integrityVerdict: 'verified'
    }
  ];

  return { records, checkpoints, alerts, investigations };
}
