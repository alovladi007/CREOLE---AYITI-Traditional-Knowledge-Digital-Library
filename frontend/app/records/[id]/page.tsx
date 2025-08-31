async function fetchRecord(id: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const res = await fetch(`${base}/v1/records/${id}`, { cache: 'no-store' });
  return res.json();
}

export default async function RecordPage({ params }: any) {
  const record = await fetchRecord(params.id);
  if (!record?.id) return <div>Record not found.</div>;

  return (
    <div>
      <h2>{record.title_ht} {record.title_fr ? `/ ${record.title_fr}` : ''}</h2>
      <p><strong>Class:</strong> {record.creole_class} &nbsp;&nbsp; <strong>Access:</strong> {record.access_tier}</p>
      {record.abstract_en && <p>{record.abstract_en}</p>}
      {record.tk_labels?.length ? <p><strong>TK Labels:</strong> {record.tk_labels.join(', ')}</p> : null}
      {record.ipc_codes?.length ? <p><strong>IPC:</strong> {record.ipc_codes.join(', ')}</p> : null}
      {record.examiner_digest && <pre style={{ background:'#fafafa', padding:12 }}>{record.examiner_digest}</pre>}
      <p><em>Region:</em> {(record.region||[]).join(', ')} &nbsp;&nbsp; <em>Community:</em> {record.community || '—'}</p>
    </div>
  );
}