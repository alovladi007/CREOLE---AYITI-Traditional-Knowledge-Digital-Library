import SearchBar from '@/components/SearchBar';
import RecordCard from '@/components/RecordCard';

async function getRecords(query?: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const url = query 
    ? `${apiUrl}/v1/records?q=${encodeURIComponent(query)}`
    : `${apiUrl}/v1/records`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const records = await getRecords(searchParams.q);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#2c3e50' }}>
        Traditional Knowledge Repository
      </h2>
      
      <SearchBar initialQuery={searchParams.q} />
      
      <div style={{ marginTop: '2rem' }}>
        {records.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No records found. Try a different search term.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {records.map((record: any) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}