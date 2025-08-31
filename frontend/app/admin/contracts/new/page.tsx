'use client'
import { useState } from 'react'

export default function NewContract(){
  const [community,setCommunity]=useState('')
  const [recordId,setRecordId]=useState('')
  const [terms,setTerms]=useState('{}')
  const [statusMsg,setStatus]=useState('')

  async function submit(e:any){
    e.preventDefault()
    setStatus('Submitting...')
    try{
      const sess = await fetch('/api/auth/session').then(r=>r.json())
      const token = sess?.token
      if(!token){ setStatus('Sign in required'); return }
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(`${base}/v1/benefit/contracts`, {
        method:'POST',
        headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},
        body: JSON.stringify({ community, recordId: recordId||null, terms: JSON.parse(terms||'{}') })
      })
      if(!res.ok){ setStatus('Error'); return }
      setStatus('Created'); 
    }catch(e:any){ setStatus('Error: '+e.message) }
  }

  return (
    <div>
      <h1>New Benefit Contract</h1>
      <form onSubmit={submit} style={{display:'grid', gap:8, maxWidth:520}}>
        <label>Community<br/><input required value={community} onChange={e=>setCommunity(e.target.value)} /></label>
        <label>Record ID (optional)<br/><input value={recordId} onChange={e=>setRecordId(e.target.value)} /></label>
        <label>Terms (JSON)<br/><textarea rows={6} value={terms} onChange={e=>setTerms(e.target.value)} /></label>
        <button type="submit">Create</button>
      </form>
      <p>{statusMsg}</p>
    </div>
  )
}