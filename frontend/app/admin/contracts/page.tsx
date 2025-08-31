import { serverFetch } from '@/lib/authServer'
import Link from 'next/link'

export default async function ContractsPage(){
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const res = await serverFetch(`${base}/v1/benefit/contracts`)
  const items = res.ok ? await res.json() : []
  return (
    <div>
      <h1>Benefit Contracts</h1>
      <Link href="/admin/contracts/new">+ New contract</Link>
      <div style={{display:'grid', gap:8, marginTop:12}}>
        {items.map((c:any)=>(
          <div key={c.id} style={{border:'1px solid #eee', borderRadius:8, padding:10}}>
            <div><strong>{c.community}</strong> — status: {c.status}</div>
            <div>Record: {c.recordId || '—'}</div>
            <div>Terms: <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(c.terms,null,2)}</pre></div>
            <Link href={`/admin/contracts/${c.id}`}>View payouts →</Link>
          </div>
        ))}
      </div>
    </div>
  )
}