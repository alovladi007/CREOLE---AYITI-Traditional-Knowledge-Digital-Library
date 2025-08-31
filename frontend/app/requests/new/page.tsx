'use client'
import { useState } from 'react'

export default function NewRequest(){
  const [recordId, setRecordId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [status, setStatus] = useState<string>('')

  async function getToken(){
    const s = await fetch('/api/auth/session').then(r=>r.json())
    return s?.token || null
  }

  async function submit(e:any){
    e.preventDefault()
    setStatus('Submitting...')
    try {
      const token = await getToken()
      if (!token) { setStatus('Sign in required'); return }
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/v1/access-requests`, {
        method:'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recordId, purpose })
      })
      const data = await res.json()
      if (!res.ok) { setStatus('Error: ' + (data?.message || res.status)); return }
      setStatus('Submitted: ' + data.id)
    } catch (e:any){
      setStatus('Error: ' + e.message)
    }
  }

  return (
    <div>
      <h1>New Access Request</h1>
      <p>Provide context for why you request access. You must be signed in.</p>
      <form onSubmit={submit} style={{ display:'grid', gap:8, maxWidth:520 }}>
        <label>Record ID (required)<br/><input required value={recordId} onChange={e=>setRecordId(e.target.value)} /></label>
        <label>Purpose<br/><textarea value={purpose} onChange={e=>setPurpose(e.target.value)} required /></label>
        <button type="submit">Submit</button>
      </form>
      <p>{status}</p>
    </div>
  )
}