import { SystemRecord, VerificationFailureDetail, VerificationReport, Checkpoint } from '../types';

/**
 * Deterministic JSON stringifier to ensure consistent key ordering across payloads.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeJson).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${canonicalizeJson(obj[k])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Computes standard SHA-256 hash using the Web Cryptography API (SubtleCrypto).
 */
export async function computeSha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates the canonical hashing payload for a system record.
 */
export function createRecordPayload(record: {
  chainIndex: number;
  prevHash: string;
  timestamp: string;
  eventType: string;
  sourceSystem: string;
  actor: string;
  description: string;
  severity: string;
  metadata: Record<string, any>;
}): string {
  return [
    record.chainIndex,
    record.prevHash,
    record.timestamp,
    record.eventType,
    record.sourceSystem,
    record.actor,
    record.description,
    record.severity,
    canonicalizeJson(record.metadata)
  ].join('|#|');
}

/**
 * Computes the cryptographic hash for a single record.
 */
export async function calculateRecordHash(record: {
  chainIndex: number;
  prevHash: string;
  timestamp: string;
  eventType: string;
  sourceSystem: string;
  actor: string;
  description: string;
  severity: string;
  metadata: Record<string, any>;
}): Promise<string> {
  const payload = createRecordPayload(record);
  return await computeSha256(payload);
}

/**
 * Verifies a sequence of records against cryptographic hash chain integrity rules.
 */
export async function verifyRecordChain(
  records: SystemRecord[],
  checkpoints: Checkpoint[] = [],
  scope: 'all' | 'checkpoint' = 'all',
  checkpointId?: string
): Promise<VerificationReport> {
  const startTime = performance.now();
  const failures: VerificationFailureDetail[] = [];
  let passedCount = 0;
  const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < records.length; i++) {
    const current = records[i];
    const expectedPrev = i === 0 ? GENESIS_PREV_HASH : records[i - 1].currentHash;

    // 1. Verify previous hash pointer integrity
    if (current.prevHash !== expectedPrev) {
      failures.push({
        recordId: current.id,
        chainIndex: current.chainIndex,
        failureType: 'BROKEN_CHAIN_LINK',
        reason: 'BROKEN_CHAIN_LINK',
        expectedHash: current.currentHash,
        calculatedHash: current.currentHash,
        expectedPrevHash: expectedPrev,
        actualPrevHash: current.prevHash,
        explanation: `Chain link pointer mismatch at position ${current.chainIndex}. The record references previous hash '${current.prevHash.slice(0, 12)}...', but preceding record has '${expectedPrev.slice(0, 12)}...'.`,
        forensicImpact: 'Indicates historical record deletion, insertion, or reordering within the cryptographic sequence.',
        recommendedAction: 'Isolate affected audit segment, cross-check against offline WORM checkpoints, and initiate incident response.',
        recommendation: 'Isolate affected audit segment, cross-check against offline WORM checkpoints, and initiate incident response.'
      });
      continue;
    }

    // 2. Recalculate record payload SHA-256
    const calculatedHash = await calculateRecordHash(current);
    if (calculatedHash !== current.currentHash) {
      failures.push({
        recordId: current.id,
        chainIndex: current.chainIndex,
        failureType: 'HASH_MISMATCH',
        reason: 'HASH_MISMATCH',
        fieldAffected: current.tamperedField || 'payload_attribute',
        expectedHash: current.currentHash,
        calculatedHash: calculatedHash,
        explanation: `Cryptographic fingerprint divergence detected. Stored hash is '${current.currentHash.slice(0, 12)}...', but payload recalculation yielded '${calculatedHash.slice(0, 12)}...'.`,
        forensicImpact: 'Evidence tampering detected. Record attributes (actor, timestamp, or event data) have been silently modified after ledger sealing.',
        recommendedAction: 'Flag evidence as compromised, preserve memory state, and alert compliance officer.',
        recommendation: 'Flag evidence as compromised, preserve memory state, and alert compliance officer.'
      });
      continue;
    }

    passedCount++;
  }

  // 3. Verify against preserved checkpoints
  const checkpointMatches = checkpoints.map(chk => {
    const targetRecord = records.find(r => r.chainIndex === chk.coveredChainEndIndex);
    const actualRoot = targetRecord ? targetRecord.currentHash : 'NOT_FOUND';
    const matched = actualRoot === chk.rootHash;
    return {
      checkpointId: chk.id,
      expectedRoot: chk.rootHash,
      actualRoot: actualRoot,
      matched: matched
    };
  });

  const durationMs = Math.round(performance.now() - startTime);

  return {
    id: `VR-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    scope: scope,
    checkpointId: checkpointId,
    totalExamined: records.length,
    recordsExamined: records.length,
    passedCount: passedCount,
    failedCount: failures.length,
    isChainIntact: failures.length === 0,
    tamperedRecords: failures,
    checkpointMatches: checkpointMatches,
    durationMs: durationMs,
    verifiedBy: 'TraceLock Engine v2.4 (SHA-256 FIPS-180-4)'
  };
}
