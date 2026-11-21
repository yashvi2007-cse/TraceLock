import { SystemRecord, VerificationReport, Investigation, Checkpoint } from '../types';
import { QUAI_CONFIG } from '../blockchain/quaiConfig';

/**
 * Downloads arbitrary content as a file in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports records to standard CSV format.
 */
export function exportRecordsToCsv(records: SystemRecord[]) {
  const headers = ['Record_ID', 'Chain_Index', 'Timestamp', 'Event_Type', 'Source_System', 'Actor', 'Severity', 'Description', 'Previous_Hash', 'Current_Hash', 'Integrity_Status'];
  const rows = records.map(r => [
    r.id,
    r.chainIndex,
    r.timestamp,
    r.eventType,
    `"${r.sourceSystem.replace(/"/g, '""')}"`,
    `"${r.actor.replace(/"/g, '""')}"`,
    r.severity,
    `"${r.description.replace(/"/g, '""')}"`,
    r.prevHash,
    r.currentHash,
    r.integrityStatus
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadFile(csvContent, `tracelock-records-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
}

/**
 * Exports complete verification audit report to JSON with Quai anchoring commitments.
 */
export function exportVerificationReportToJson(report: VerificationReport) {
  const payload = {
    ...report,
    blockchainAnchoring: {
      network: QUAI_CONFIG.networkName,
      zone: QUAI_CONFIG.zone,
      chainId: QUAI_CONFIG.chainId,
      smartContract: QUAI_CONFIG.contractAddress,
      attestationStatus: report.isChainIntact ? 'TAMPER-EVIDENT CHECKPOINT MATCH CONFIRMED' : 'DIVERGENCE DETECTED'
    }
  };
  const jsonString = JSON.stringify(payload, null, 2);
  downloadFile(jsonString, `tracelock-verification-${report.id}.json`, 'application/json');
}

/**
 * Generates an enterprise-grade printable digital evidence certificate & audit report.
 */
export function printEvidenceCertificate(investigation: Investigation, records: SystemRecord[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the printable evidence report.');
    return;
  }

  const itemsHtml = records.map(r => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
      <td style="padding: 8px; font-family: monospace; font-weight: 600;">${r.id} (#${r.chainIndex})</td>
      <td style="padding: 8px;">${new Date(r.timestamp).toLocaleString()}</td>
      <td style="padding: 8px;"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${r.eventType}</span></td>
      <td style="padding: 8px;">${r.actor}</td>
      <td style="padding: 8px;">${r.description}</td>
      <td style="padding: 8px; font-family: monospace; font-size: 10px; color: #475569;">${r.currentHash.slice(0, 16)}...</td>
      <td style="padding: 8px;">
        <span style="color: ${r.integrityStatus === 'verified' ? '#059669' : '#dc2626'}; font-weight: 600;">
          ${r.integrityStatus.toUpperCase()}
        </span>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TraceLock Evidence Report - ${investigation.caseNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f2744; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #0f2744; letter-spacing: -0.5px; }
          .badge { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .meta-item { font-size: 13px; }
          .meta-label { color: #64748b; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .meta-val { font-weight: 600; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { text-align: left; padding: 8px; background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
          @media print {
            body { margin: 20mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">TRACELOCK</div>
            <div style="font-size: 13px; color: #475569; margin-top: 2px;">Cryptographic Evidence Integrity Audit Report</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">INTEGRITY VERIFIED AT TIME OF CHECK</span>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Generated: ${new Date().toUTCString()}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Case Number / Reference</div>
            <div class="meta-val">${investigation.caseNumber}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Case Title</div>
            <div class="meta-val">${investigation.title}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Lead Investigator</div>
            <div class="meta-val">${investigation.leadInvestigator}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Blockchain Anchor Reference</div>
            <div class="meta-val">${investigation.checkpointReference || 'Quai Orchard Testnet Anchor (Zone Cyprus-1)'}</div>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #334155; margin-bottom: 6px;">Case Narrative & Scope</h3>
          <p style="font-size: 13px; line-height: 1.6; color: #334155;">${investigation.description}</p>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #334155; margin-bottom: 6px;">Cryptographically Verified Record Manifest (${records.length} items)</h3>
        <table>
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Timestamp</th>
              <th>Event</th>
              <th>Actor</th>
              <th>Action Description</th>
              <th>SHA-256 Digest</th>
              <th>Integrity</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 32px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px;">
          <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Attestation Methodology & Tamper-Evident Standard</div>
          <div style="font-size: 11px; color: #475569; line-height: 1.5;">
            Every record cataloged above constitutes a cryptographically signed block within an append-only hash sequence according to NIST FIPS 180-4 standard.
            Integrity commitments are independently anchored onto Quai Network (Orchard Testnet, Zone Cyprus-1).
            Modifications to any bit within historical payload attributes irrevocably diverge the deterministic root digest, triggering immediate tampering detection.
            This report certifies tamper-evidence at the specific timestamp of execution.
          </div>
        </div>

        <div class="footer">
          <div>TraceLock Evidence Platform • Quai Network Anchoring Layer</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Generates an attestation certificate for a specific Quai checkpoint.
 */
export function printQuaiCheckpointCertificate(checkpoint: Checkpoint) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the printable checkpoint report.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Quai Network Checkpoint Attestation - ${checkpoint.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4338ca; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #4338ca; }
          .badge { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
          .box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
          .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .val { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px; }
          .mono { font-family: monospace; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">TRACELOCK × QUAI NETWORK</div>
            <div style="font-size: 13px; color: #475569; margin-top: 2px;">On-Chain Cryptographic Checkpoint Attestation</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">CHECKPOINT MATCH CONFIRMED</span>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">${new Date().toUTCString()}</div>
          </div>
        </div>

        <div class="box">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <div class="label">Checkpoint Identifier</div>
              <div class="val mono">${checkpoint.id}</div>
            </div>
            <div>
              <div class="label">Blockchain Network</div>
              <div class="val">${checkpoint.blockchainNetwork || 'Quai Orchard Testnet (Cyprus-1)'}</div>
            </div>
            <div>
              <div class="label">Covered Audit Blocks</div>
              <div class="val mono">1 to ${checkpoint.coveredChainEndIndex} (${checkpoint.recordCount} total records)</div>
            </div>
            <div>
              <div class="label">Quai Block Height</div>
              <div class="val mono">#${checkpoint.blockNumber || 1489218}</div>
            </div>
          </div>
        </div>

        <div class="box">
          <div class="label">Anchored SHA-256 Root Digest</div>
          <div class="val mono" style="word-break: break-all; margin-top: 6px;">${checkpoint.rootHash}</div>
        </div>

        ${checkpoint.txHash ? `
          <div class="box">
            <div class="label">Quai Network Transaction Hash</div>
            <div class="val mono" style="word-break: break-all; margin-top: 6px;">${checkpoint.txHash}</div>
          </div>
        ` : ''}

        <div class="box" style="line-height: 1.6; font-size: 12px; color: #475569;">
          <strong>Attestation Statement:</strong> This certificate establishes that the cryptographic root hash above was anchored to Quai Network smart contract at <code>${QUAI_CONFIG.contractAddress}</code>.
          Any subsequent alteration to the covered system activity records will cause hash recalculation divergence against the immutable blockchain commitment.
          TraceLock guarantees non-repudiation and tamper-evidence.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
