'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPayout({ params }: any){
  const [amount,setAmount]=useState('100.00')
  const [currency,setCurrency]=useState('USD')
  const [statusMsg,setStatus]=useState('')
  const router = useRouter()

  async function submit(e:any){
    e.preventDefault()
    setStatus('Submitting...')
    try{
      const sess = await fetch('/api/auth/session').then(r=>r.json())
      const token = sess?.token
      if(!token){ setStatus('Sign in required'); return }
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(`${base}/v1/benefit/payouts`, {
        method:'POST',
        headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`},
        body: JSON.stringify({ contractId: params.id, amount: parseFloat(amount), currency })
      })
      if(!res.ok){ setStatus('Error'); return }
      setStatus('Created')
      router.push(`/admin/contracts/${params.id}`)
    }catch(e:any){ setStatus('Error: '+e.message) }
  }

  return (
    <div>
      <h1>New Payout</h1>
      <form onSubmit={submit} style={{display:'grid', gap:8, maxWidth:520}}>
        <label>Amount<br/><input value={amount} onChange={e=>setAmount(e.target.value)} /></label>
        <label>Currency<br/><input value={currency} onChange={e=>setCurrency(e.target.value)} /></label>
        <button type="submit">Create</button>
      </form>
      <p>{statusMsg}</p>
    </div>
  )
}