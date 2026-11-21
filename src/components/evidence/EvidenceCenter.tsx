import React, { useState } from 'react';
import { useTraceLock } from '../../context/TraceLockContext';
import {
  FolderLock,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Download,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  FileText,
  Lock,
  CheckCircle2,
  X
} from 'lucide-react';
import { printEvidenceCertificate, exportRecordsToCsv } from '../../utils/export';
import { Investigation } from '../../types';

export const EvidenceCenter: React.FC = () => {
  const {
    investigations,
    records,
    createInvestigation,
    setSelectedRecordModal
  } = useTraceLock();

  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(investigations[0]?.id || '');
  
  // New Case form
  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [investigator, setInvestigator] = useState('Helena Vance (CISO)');
  const [description, setDescription] = useState('');
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

  const activeCase = investigations.find(i => i.id === selectedCaseId) || investigations[0];
  const caseRecords = records.filter(r => activeCase?.recordIds.includes(r.id));
  const isCaseIntact = caseRecords.every(r => !r.isTampered);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !caseNumber) return;

    createInvestigation({
      caseNumber,
      title,
      leadInvestigator: investigator,
      description,
      status: 'open',
      recordIds: selectedRecordIds.length > 0 ? selectedRecordIds : [records[0]?.id || '']
    });

    setIsNewCaseModalOpen(false);
    setTitle('');
    setCaseNumber('');
    setDescription('');
    setSelectedRecordIds([]);
  };

  const toggleRecordSelection = (id: string) => {
    setSelectedRecordIds(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy-950 font-sans">Evidence Center</h1>
            <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded font-mono font-semibold">
              Digital Forensics & Chain of Custody
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Package and attest cryptographically sealed records for compliance audits, judicial admissibility, and post-mortems.
          </p>
        </div>

        <button
          onClick={() => setIsNewCaseModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Forensic Investigation</span>
        </button>
      </div>

      {/* Case Navigator & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Investigation Cases List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Investigations ({investigations.length})</span>
            <span className="text-[11px] text-slate-500">Chain-of-Custody</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {investigations.map((inv) => {
              const isSelected = inv.id === activeCase?.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedCaseId(inv.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-50/80 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-navy-950">{inv.caseNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                      inv.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-800 mt-1.5 line-clamp-1">{inv.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{inv.description}</p>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{inv.recordIds.length} Sealed Evidence Records</span>
                    <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Case Forensic Dossier */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          {activeCase ? (
            <>
              {/* Case Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-brand-600">{activeCase.caseNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCaseIntact ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {isCaseIntact ? 'ATTESTED UNTAMPERED' : 'CONTAINS ANOMALIES'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-navy-950 mt-1">{activeCase.title}</h2>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>Lead: {activeCase.leadInvestigator}</span>
                    </span>
                    <span>â¢</span>
                    <span className="flex items-center space-x-1">
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Anchor: {activeCase.checkpointReference || 'Local Genesis'}</span>
                    </span>
                  </div>
                </div>

                {/* Report Generation Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportRecordsToCsv(caseRecords)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shadow-2xs flex items-center space-x-1"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => printEvidenceCertificate(activeCase, caseRecords)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-md shadow-xs flex items-center space-x-1.5"
                  >
                    <Printer className="h-3.5 w-3.5 text-brand-400" />
                    <span>Print Forensic Report</span>
                  </button>
                </div>
              </div>

              {/* Case Narrative */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Case Scope & Context</h3>
                <p className="text-xs text-slate-700 leading-relaxed mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {activeCase.description}
                </p>
              </div>

              {/* Bound Evidence Records List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Linked Cryptographic Evidence Records ({caseRecords.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">Click to verify cryptographic proof</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {caseRecords.map(r => {
                    const isTampered = r.isTampered;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRecordModal(r)}
                        className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-900">{r.id}</span>
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              {r.eventType}
                            </span>
                            <span className="text-xs text-slate-600 font-mono">by {r.actor}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">{r.description}</p>
                          <div className="font-mono text-[10px] text-slate-400">
                            SHA-256: {r.currentHash.slice(0, 20)}...
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isTampered ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isTampered ? 'TAMPERED' : 'VERIFIED'}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Select an investigation case to view evidence details.
            </div>
          )}
        </div>
      </div>

      {/* New Investigation Modal */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-navy-950">Create New Digital Forensics Investigation</h3>
            <p className="text-xs text-slate-500">
              Group cryptographically sealed records under an official case file with non-repudiation tracking.
            </p>

            <form onSubmit={handleCreateCase} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Case Number / Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="SEC-CASE-2026-09"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Investigator
                  </label>
                  <input
                    type="text"
                    required
                    value={investigator}
                    onChange={(e) => setInvestigator(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Investigation Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Investigation into Lateral Movement on Vault Server"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Narrative & Scope
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the incident timeline, affected nodes, and compliance scope..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 outline-none h-20"
                />
              </div>

              {/* Record Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select System Records to Bind as Evidence ({selectedRecordIds.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md bg-slate-50 p-1">
                  {records.map(rec => (
                    <label key={rec.id} className="p-2 flex items-center space-x-2.5 hover:bg-white rounded cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedRecordIds.includes(rec.id)}
                        onChange={() => toggleRecordSelection(rec.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="font-mono font-semibold text-slate-800">{rec.id}</span>
                      <span className="text-[11px] text-slate-500 truncate">{rec.eventType} - {rec.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-md shadow-xs"
                >
                  Create Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
