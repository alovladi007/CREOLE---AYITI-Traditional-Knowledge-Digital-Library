import { serverFetch } from '@/lib/authServer';

async function getRecord(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${apiUrl}/v1/records/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
}

export default async function RecordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const record = await getRecord(params.id);

  if (!record) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2 style={{ color: '#e74c3c' }}>Record Not Found</h2>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          The record you're looking for doesn't exist or has been removed.
        </p>
        <a href="/" style={{ color: '#3498db', marginTop: '2rem', display: 'inline-block' }}>
          ← Back to Home
        </a>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    public: '#27ae60',
    restricted: '#f39c12',
    secret: '#e74c3c',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '0.5rem' }}>
            {record.title_ht}
          </h1>
          {record.title_fr && (
            <h2 style={{ fontSize: '1.5rem', color: '#7f8c8d', fontWeight: 'normal' }}>
              {record.title_fr}
            </h2>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span style={{
            background: tierColors[record.access_tier],
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
          }}>
            {record.access_tier}
          </span>
          
          {record.creole_class && (
            <span style={{
              background: '#3498db',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}>
              {record.creole_class}
            </span>
          )}

          {record.community && (
            <span style={{
              background: '#9b59b6',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}>
              {record.community}
            </span>
          )}
        </div>

        {record.abstract_en && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
              Abstract
            </h3>
            <p style={{ lineHeight: '1.6', color: '#555' }}>
              {record.abstract_en}
            </p>
          </div>
        )}

        {record.tk_labels && record.tk_labels.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
              TK Labels
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {record.tk_labels.map((label: string) => (
                <span
                  key={label}
                  style={{
                    background: '#ecf0f1',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    border: '1px solid #bdc3c7',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {record.region && record.region.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
              Regions
            </h3>
            <p style={{ color: '#555' }}>
              {record.region.join(', ')}
            </p>
          </div>
        )}

        {record.metadata && Object.keys(record.metadata).length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
              Additional Information
            </h3>
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(record.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {record.access_tier !== 'public' && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px'
          }}>
            <p style={{ margin: 0, color: '#856404' }}>
              This record has restricted access. 
              <a 
                href={`/requests/new?recordId=${record.id}`}
                style={{ marginLeft: '0.5rem', color: '#0056b3' }}
              >
                Request Access →
              </a>
            </p>
          </div>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ecf0f1' }}>
          <p style={{ fontSize: '0.875rem', color: '#95a5a6' }}>
            Record ID: {record.id}<br />
            Created: {new Date(record.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}