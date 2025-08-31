import Link from 'next/link'

export function RecordCard({ record }: { record: any }) {
  return (
    <div style={{ border:'1px solid #eee', borderRadius:8, padding:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <strong>{record.title_ht}</strong>
        <code>{record.creole_class}</code>
      </div>
      {record.title_fr && <div><em>{record.title_fr}</em></div>}
      {record.abstract_en && <p>{record.abstract_en}</p>}
      <div style={{ fontSize:12, color:'#555' }}>
        Access: {record.access_tier} • Labels: {(record.tk_labels||[]).join(', ')}
      </div>
      <div style={{ marginTop:8 }}>
        <Link href={`/records/${record.id}`}>View details →</Link>
      </div>
    </div>
  );
}