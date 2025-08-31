import { SearchBar } from '@/components/SearchBar'
import { RecordCard } from '@/components/RecordCard'

async function fetchRecords(q: string) {
  // Use backend service name for SSR, localhost for client
  const isServer = typeof window === 'undefined';
  const base = isServer ? 'http://backend:4000' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
  const res = await fetch(`${base}/v1/records?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  if (!res.ok) {
    console.error('Failed to fetch records:', res.status);
    return [];
  }
  return res.json();
}

export default async function Home({ searchParams }: any) {
  const q = searchParams?.q ?? '';
  const records = q ? await fetchRecords(q) : [];

  return (
    <div>
      <h1>CREOLE Public Search</h1>
      <p>Search public records (HT/FR/EN keywords). For restricted/secret records, community access is required.</p>
      <SearchBar initialQuery={q} />
      <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
        {records.length ? records.map((r: any) => (
          <RecordCard key={r.id} record={r} />
        )) : <em>Try a query like <code>Joumou</code> or <code>Kasav</code>.</em>}
      </div>
    </div>
  );
}