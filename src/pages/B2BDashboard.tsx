import React, { useState, useEffect } from 'react';
import { ProvenanceViewer } from '@/components/ui/provenance-viewer';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_PARTNER_API_KEY || '';

const fetcher = (url: string) => axios.get(url, { headers: { 'x-api-key': API_KEY } }).then(r => r.data);

export default function B2BDashboard() {
  const [aggregators, setAggregators] = useState<any[]>([]);
  const [offtakers, setOfftakers] = useState<any[]>([]);
  const [inputProviders, setInputProviders] = useState<any[]>([]);
  const [rfqs, setRFQs] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [rfqForm, setRFQForm] = useState({ buyer: '', product: '', quantity: 1 });
  const [offerForm, setOfferForm] = useState({ seller: '', product: '', price: 0 });
  const [escrowForm, setEscrowForm] = useState({ buyer: '', seller: '', amount: 0 });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetcher('/api/b2b?type=aggregators').then(setAggregators);
    fetcher('/api/b2b?type=offtakers').then(setOfftakers);
    fetcher('/api/b2b?type=input-providers').then(setInputProviders);
    fetcher('/api/b2b?action=listRFQs').then(setRFQs).catch(() => {});
    fetcher('/api/b2b?action=listOffers').then(setOffers).catch(() => {});
    fetcher('/api/b2b?action=listEscrows').then(setEscrows).catch(() => {});
  }, [msg]);

  const submitRFQ = async () => {
  await axios.post('/api/b2b', { action: 'rfq', data: rfqForm }, { headers: { 'x-api-key': API_KEY } });
  setMsg('RFQ submitted!');
  // Provenance recording
  const meta = { source: 'user', entered_by: rfqForm.buyer };
  const { ProvenanceService } = await import('@/lib/provenance');
  await ProvenanceService.recordRecordChanges('rfqs', `${rfqForm.buyer}-${Date.now()}`, {
    buyer: { newValue: rfqForm.buyer },
    product: { newValue: rfqForm.product },
    quantity: { newValue: rfqForm.quantity }
  }, meta);
};
  const submitOffer = async () => {
  await axios.post('/api/b2b', { action: 'offer', data: offerForm }, { headers: { 'x-api-key': API_KEY } });
  setMsg('Offer submitted!');
  // Provenance recording
  const meta = { source: 'user', entered_by: offerForm.seller };
  const { ProvenanceService } = await import('@/lib/provenance');
  await ProvenanceService.recordRecordChanges('offers', `${offerForm.seller}-${Date.now()}`, {
    seller: { newValue: offerForm.seller },
    product: { newValue: offerForm.product },
    price: { newValue: offerForm.price }
  }, meta);
};
  const submitEscrow = async () => {
  await axios.post('/api/b2b', { action: 'escrow', data: escrowForm }, { headers: { 'x-api-key': API_KEY } });
  setMsg('Escrow initiated!');
  // Provenance recording
  const meta = { source: 'user', entered_by: escrowForm.buyer };
  const { ProvenanceService } = await import('@/lib/provenance');
  await ProvenanceService.recordRecordChanges('escrows', `${escrowForm.buyer}-${escrowForm.seller}-${Date.now()}`, {
    buyer: { newValue: escrowForm.buyer },
    seller: { newValue: escrowForm.seller },
    amount: { newValue: escrowForm.amount }
  }, meta);
};

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">B2B Marketplace Dashboard</h1>
      <div className="mb-6">
        <h2 className="font-semibold">Aggregators</h2>
        <ul>{aggregators.map((a: any) => <li key={a.id}>{a.name}</li>)}</ul>
        <h2 className="font-semibold mt-4">Off-takers</h2>
        <ul>{offtakers.map((o: any) => <li key={o.id}>{o.name}</li>)}</ul>
        <h2 className="font-semibold mt-4">Input Providers</h2>
        <ul>{inputProviders.map((i: any) => <li key={i.id}>{i.name}</li>)}</ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold">Submit RFQ</h2>
        <input className="border p-1 mr-2" placeholder="Buyer" value={rfqForm.buyer} onChange={e => setRFQForm(f => ({ ...f, buyer: e.target.value }))} />
        <input className="border p-1 mr-2" placeholder="Product" value={rfqForm.product} onChange={e => setRFQForm(f => ({ ...f, product: e.target.value }))} />
        <input className="border p-1 mr-2" type="number" placeholder="Quantity" value={rfqForm.quantity} onChange={e => setRFQForm(f => ({ ...f, quantity: +e.target.value }))} />
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={submitRFQ}>Submit</button>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold">Submit Offer</h2>
        <input className="border p-1 mr-2" placeholder="Seller" value={offerForm.seller} onChange={e => setOfferForm(f => ({ ...f, seller: e.target.value }))} />
        <input className="border p-1 mr-2" placeholder="Product" value={offerForm.product} onChange={e => setOfferForm(f => ({ ...f, product: e.target.value }))} />
        <input className="border p-1 mr-2" type="number" placeholder="Price" value={offerForm.price} onChange={e => setOfferForm(f => ({ ...f, price: +e.target.value }))} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={submitOffer}>Submit</button>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold">Initiate Escrow</h2>
        <input className="border p-1 mr-2" placeholder="Buyer" value={escrowForm.buyer} onChange={e => setEscrowForm(f => ({ ...f, buyer: e.target.value }))} />
        <input className="border p-1 mr-2" placeholder="Seller" value={escrowForm.seller} onChange={e => setEscrowForm(f => ({ ...f, seller: e.target.value }))} />
        <input className="border p-1 mr-2" type="number" placeholder="Amount" value={escrowForm.amount} onChange={e => setEscrowForm(f => ({ ...f, amount: +e.target.value }))} />
        <button className="bg-orange-600 text-white px-3 py-1 rounded" onClick={submitEscrow}>Submit</button>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold">RFQs</h2>
        <ul>{rfqs.map((r: any) => <li key={r.id}>{r.buyer} requests {r.quantity} of {r.product}</li>)}</ul>
        <h2 className="font-semibold mt-4">Offers</h2>
        <ul>{offers.map((o: any) => <li key={o.id}>{o.seller} offers {o.product} at {o.price}</li>)}</ul>
        <h2 className="font-semibold mt-4">Escrows</h2>
        <ul>{escrows.map((e: any) => <li key={e.id}>{e.buyer} &rarr; {e.seller} for {e.amount}</li>)}</ul>
      </div>
      {msg && <div className="p-2 bg-green-100 border-green-400 border rounded mb-4">{msg}</div>}
    {/* Data Provenance Section */}
    <div className="max-w-3xl mx-auto mt-12">
      <ProvenanceViewer
        tableName="rfqs"
        recordId={typeof window !== 'undefined' ? (localStorage.getItem('user_email') || 'demo-user') : 'demo-user'}
        showValue={true}
      />
    </div>
  </div>
  );
}
