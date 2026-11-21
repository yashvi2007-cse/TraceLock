# TRACELOCK — Digital Evidence Integrity & Tamper-Evident System Activity Platform

> *"Collect the truth. Protect its integrity. Verify the evidence."*

TraceLock is an enterprise-grade cybersecurity web application designed to collect system activity, protect audit logs from silent manipulation, preserve independent integrity checkpoints, and allow investigators to verify whether digital evidence remains trustworthy.

---

## Key Capabilities

1. **Deterministic Cryptographic Ledger (SHA-256 FIPS 180-4)**
   - System activity records are normalized using RFC 8785 JSON Canonicalization.
   - Records are bonded via sequential parent-hash pointers:  
     $$\text{Hash}_n = \text{SHA256}(\text{Index}_n \parallel \text{Hash}_{n-1} \parallel \text{Timestamp}_n \parallel \text{Actor}_n \parallel \text{Payload}_n)$$
   - Modifying any single byte in historical records mathematically breaks all downstream verification pointers.

2. **Strict Top Navigation (No Left Sidebar)**
   - Clean, modern enterprise UI inspired by healthcare and high-reliability security SaaS platforms.
   - Soft cool-slate palette, deep navy blue primary, subtle emerald green for verified states, amber for warnings, and red for critical anomalies.

3. **Core Modules**
   - **Command Center Dashboard**: Real-time status cards, interactive hash chain flow visualizer, health metrics, and recent activity table.
   - **Activity Records Explorer**: Search, filter by category/severity/integrity/user, sort, paginate, and inspect full cryptographic metadata.
   - **TraceLock Ingest Collector**: Manages multi-source feeds (auditd, syslog, cloudtrail, k8s audit), distinguishes LIVE from DEMO data, with pause/resume controls and live stream logging.
   - **Cryptographic Integrity Engine**: Interactive chain inspector displaying raw canonical payloads, previous block hashes, and calculated digests.
   - **Independent Checkpoints**: Anchors chain tail roots to external write-once-read-many (WORM) storage (AWS S3 Object Lock, HSM Vault, Cold Tape Archive).
   - **Verification Center**: Guided 4-step audit workflow with explainable divergence root causes, forensic impact analysis, and remediation advice.
   - **Evidence Center**: Case management for investigations, linking records, chain of custody tracking, and generating printable court-admissible forensic certificates.
   - **Alerts & Anomalies**: Real-time tripwire triage queue with workflow states (*New*, *Investigating*, *Resolved*, *Dismissed*).
   - **Tamper Simulation Lab**: Interactive demo tool enabling intentional modification of records to demonstrate instant detection of broken hash chains.

---

## Quickstart

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+

### Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

Open `http://localhost:5173/` in your browser.
