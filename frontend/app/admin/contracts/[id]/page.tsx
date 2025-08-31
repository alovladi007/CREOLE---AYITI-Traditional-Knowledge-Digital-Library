import { serverFetch } from '@/lib/authServer'
import Link from 'next/link'

async function fetchPayouts(id: string){
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const res = await serverFetch(`${base}/v1/benefit/contracts/${id}/payouts`)
  if(!res.ok) return []
  return res.json()
}

export default async function ContractDetail({ params }: any){
  const payouts = await fetchPayouts(params.id)
  return (
    <div>
      <h1>Contract {params.id}</h1>
      <Link href={`/admin/contracts/${params.id}/new-payout`}>+ New payout</Link>
      <div style={{display:'grid', gap:8, marginTop:12}}>
        {payouts.map((p:any)=>(
          <div key={p.id} style={{border:'1px solid #eee', borderRadius:8, padding:10}}>
            <div>Amount: {p.amount} {p.currency} — status: {p.status}</div>
            <div>tx: {p.txref || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}