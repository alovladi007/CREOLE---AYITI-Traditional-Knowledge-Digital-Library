'use client'
import { useState } from 'react'

export default function IntakePage() {
  const [form, setForm] = useState<any>({
    title_ht: '', title_fr: '', abstract_en: '',
    creole_class: 'C-FOOD', access_tier: 'public',
    tk_labels: ['TK_Attribution']
  });
  const [status, setStatus] = useState<string>('');

  async function getToken(){
    const s = await fetch('/api/auth/session').then(r=>r.json())
    return s?.token || null
  }

  async function submit(e: any) {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const token = await getToken()
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/v1/records`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? {Authorization: `Bearer ${token}`} : {})
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setStatus('Submitted! Record ID: ' + data.id);
    } catch (err: any) {
      setStatus('Error: ' + err?.message);
    }
  }

  return (
    <div>
      <h1>Community Intake</h1>
      <p>Submit a new record. Sign in for full access.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <label>Title (HT)<br/>
          <input required value={form.title_ht} onChange={e=>setForm({...form, title_ht:e.target.value})} />
        </label>
        <label>Title (FR)<br/>
          <input value={form.title_fr} onChange={e=>setForm({...form, title_fr:e.target.value})} />
        </label>
        <label>Abstract (EN)<br/>
          <textarea value={form.abstract_en} onChange={e=>setForm({...form, abstract_en:e.target.value})} />
        </label>
        <label>Class<br/>
          <select value={form.creole_class} onChange={e=>setForm({...form, creole_class:e.target.value})}>
            <option>C-FOOD</option>
            <option>C-MED</option>
            <option>C-RIT</option>
            <option>C-MUS</option>
            <option>C-CRAFT</option>
            <option>C-AGRI</option>
            <option>C-ORAL</option>
            <option>C-EDU</option>
          </select>
        </label>
        <label>Access tier<br/>
          <select value={form.access_tier} onChange={e=>setForm({...form, access_tier:e.target.value})}>
            <option>public</option>
            <option>restricted</option>
            <option>secret</option>
          </select>
        </label>
        <button type="submit">Submit</button>
      </form>
      <p>{status}</p>
    </div>
  );
}