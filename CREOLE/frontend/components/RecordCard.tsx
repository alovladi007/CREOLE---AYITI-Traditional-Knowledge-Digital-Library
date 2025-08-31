import Link from 'next/link';

interface RecordProps {
  record: {
    id: string;
    title_ht: string;
    title_fr?: string;
    abstract_en?: string;
    creole_class?: string;
    access_tier: string;
    community?: string;
    region?: string[];
    createdAt: string;
  };
}

export default function RecordCard({ record }: RecordProps) {
  const tierColors: Record<string, string> = {
    public: '#27ae60',
    restricted: '#f39c12',
    secret: '#e74c3c',
  };

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href={`/records/${record.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            color: '#2c3e50',
            marginBottom: '0.25rem',
            cursor: 'pointer',
          }}>
            {record.title_ht}
          </h3>
        </Link>
        {record.title_fr && (
          <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
            {record.title_fr}
          </p>
        )}
      </div>

      {record.abstract_en && (
        <p style={{ 
          color: '#555', 
          marginBottom: '1rem',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {record.abstract_en}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          background: tierColors[record.access_tier],
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          fontWeight: '500',
        }}>
          {record.access_tier}
        </span>
        
        {record.creole_class && (
          <span style={{
            background: '#3498db',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
          }}>
            {record.creole_class}
          </span>
        )}
        
        {record.community && (
          <span style={{
            background: '#9b59b6',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
          }}>
            {record.community}
          </span>
        )}

        <span style={{ 
          marginLeft: 'auto', 
          color: '#95a5a6', 
          fontSize: '0.75rem' 
        }}>
          {new Date(record.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}