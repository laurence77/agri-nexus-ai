import React, { useState, useEffect } from 'react';
import { ProvenanceService, ProvenanceMetadata, FieldProvenance } from '@/lib/provenance';

interface CarbonLog {
  id: string;
  fieldId: string;
  practice: string;
  details: string;
  date: string;
  enteredBy: string;
  provenance?: FieldProvenance[];
}

const practices = [
  'cover cropping',
  'no-till',
  'organic inputs',
  'irrigation',
];

export default function CarbonTracking() {
  const [logs, setLogs] = useState<CarbonLog[]>([]);
  const [form, setForm] = useState({ fieldId: '', practice: practices[0], details: '', date: '', enteredBy: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // TODO: Replace with DB fetch
    setLogs([]);
  }, []);

  const submit = async () => {
    const log: CarbonLog = { ...form, id: `log-${Date.now()}`, provenance: [], date: form.date || new Date().toISOString() };
    setLogs(l => [...l, log]);
    setMsg('Log added!');
    // Provenance: record all fields
    const meta: ProvenanceMetadata = { source: 'user', entered_by: form.enteredBy };
    await ProvenanceService.recordRecordChanges('carbon_logs', log.id, {
      fieldId: { newValue: log.fieldId },
      practice: { newValue: log.practice },
      details: { newValue: log.details },
      date: { newValue: log.date },
      enteredBy: { newValue: log.enteredBy }
    }, meta);
  };

  const showProvenance = async (log: CarbonLog) => {
    const prov = await ProvenanceService.getRecordProvenance('carbon_logs', log.id);
    setLogs(l => l.map(x => x.id === log.id ? { ...x, provenance: prov } : x));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Carbon Tracking & ESG Logging</h1>
      <div className="mb-6">
        <h2 className="font-semibold">Log Regenerative Practice</h2>
        <label htmlFor="fieldId-input" className="sr-only">Field ID</label>
        <input id="fieldId-input" className="border p-1 mr-2" placeholder="Field ID" title="Field ID" value={form.fieldId} onChange={e => setForm(f => ({ ...f, fieldId: e.target.value }))} />
        <label htmlFor="practice-select" className="sr-only">Practice</label>
        <select id="practice-select" title="Practice" className="border p-1 mr-2" value={form.practice} onChange={e => setForm(f => ({ ...f, practice: e.target.value }))}>
          {practices.map(p => <option key={p}>{p}</option>)}
        </select>
        <label htmlFor="details-input" className="sr-only">Details</label>
        <input id="details-input" className="border p-1 mr-2" placeholder="Details" title="Details" value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} />
        <label htmlFor="date-input" className="sr-only">Date</label>
        <input id="date-input" className="border p-1 mr-2" type="date" title="Date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <label htmlFor="enteredBy-input" className="sr-only">Entered By</label>
        <input id="enteredBy-input" className="border p-1 mr-2" placeholder="Entered By" title="Entered By" value={form.enteredBy} onChange={e => setForm(f => ({ ...f, enteredBy: e.target.value }))} />
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={submit}>Add Log</button>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold">Practice Logs</h2>
        <ul>
          {logs.map(log => (
            <li key={log.id} className="mb-2 border-b pb-2">
              <b>{log.practice}</b> on field <b>{log.fieldId}</b> by <b>{log.enteredBy}</b> ({log.date})<br />
              <span className="text-xs">{log.details}</span>
              <button className="ml-2 text-blue-600 underline" onClick={() => showProvenance(log)}>Show Provenance</button>
              {log.provenance && log.provenance.length > 0 && (
                <div className="text-xs mt-1 bg-gray-100 p-2 rounded">
                  <b>Provenance:</b>
                  <ul>
                    {log.provenance.map((p: FieldProvenance) => (
                      <li key={p.id}>{p.field_name}: {p.value} (by {p.entered_by}, {p.timestamp})</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {msg && <div className="p-2 bg-green-100 border-green-400 border rounded mb-4">{msg}</div>}
    </div>
  );
}
