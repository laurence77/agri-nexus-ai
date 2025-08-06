import React, { useState } from 'react';

const demoExports = [
  { id: 'users', label: 'User Data' },
  { id: 'farms', label: 'Farm Data' },
  { id: 'transactions', label: 'Transaction Data' },
  { id: 'training', label: 'Training Progress' },
  { id: 'carbon', label: 'Carbon/ESG Logs' }
];

export default function AdminExportTools() {
  const [msg, setMsg] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);
  const [adminTransfer, setAdminTransfer] = useState('');

  const handleExport = async (type: string) => {
    setExporting(type);
    setTimeout(async () => {
      setExporting(null);
      setMsg(`${type} export complete (demo)`);
      // Provenance patch
      try {
        const userEmail = localStorage.getItem('user_email') || 'unknown';
        const { ProvenanceService } = await import('@/lib/provenance');
        await ProvenanceService.recordRecordChanges('admin_exports', userEmail, {
          export_type: { newValue: type },
          action: { newValue: 'export' }
        }, {
          source: 'admin',
          entered_by: userEmail,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to record provenance for export:', err);
      }
    }, 1000);
  };

  const handleTransfer = async () => {
    setMsg(`Admin role transferred to ${adminTransfer} (demo)`);
    // Provenance patch
    try {
      const userEmail = localStorage.getItem('user_email') || 'unknown';
      const { ProvenanceService } = await import('@/lib/provenance');
      await ProvenanceService.recordRecordChanges('admin_transfers', userEmail, {
        new_admin: { newValue: adminTransfer },
        action: { newValue: 'transfer' }
      }, {
        source: 'admin',
        entered_by: userEmail,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to record provenance for admin transfer:', err);
    }
  };


  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Export & Succession Tools</h1>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Export Platform Data</h2>
        <ul>
          {demoExports.map(e => (
            <li key={e.id} className="mb-2">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                onClick={() => handleExport(e.label)}
                disabled={!!exporting}
              >
                {exporting === e.label ? 'Exporting...' : `Export ${e.label}`}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Transfer Admin Role</h2>
        <input
          className="border p-1 mr-2"
          placeholder="New Admin Email/UserID"
          value={adminTransfer}
          onChange={e => setAdminTransfer(e.target.value)}
        />
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleTransfer}>
          Transfer Role
        </button>
      </div>
      {msg && <div className="p-2 bg-green-100 border-green-400 border rounded mb-4">{msg}</div>}
    </div>
  );
}
