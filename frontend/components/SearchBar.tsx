'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchBar({ initialQuery='' }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();
  return (
    <form onSubmit={(e)=>{e.preventDefault(); router.push(`/?q=${encodeURIComponent(q)}`)}}>
      <input
        placeholder="Search CREOLE... (e.g., Joumou, Kasav)"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        style={{ width:'60%', maxWidth:500, padding:8, border:'1px solid #ddd', borderRadius:6 }}
      />
      <button style={{ marginLeft: 8, padding:'8px 12px' }}>Search</button>
    </form>
  );
}