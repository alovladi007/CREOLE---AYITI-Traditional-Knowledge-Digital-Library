import { SearchBar } from '@/components/SearchBar'
import { RecordCard } from '@/components/RecordCard'

async function fetchRecords(q: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const res = await fetch(`${base}/v1/records?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
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