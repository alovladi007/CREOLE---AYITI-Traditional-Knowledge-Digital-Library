'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntakePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title_ht: '',
    title_fr: '',
    abstract_en: '',
    creole_class: 'C-FOOD',
    access_tier: 'public',
    community: '',
    region: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      if (!session.authenticated) {
        router.push('/api/auth/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/v1/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          ...formData,
          region: formData.region ? formData.region.split(',').map(r => r.trim()) : [],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create record');
      }

      const record = await res.json();
      router.push(`/records/${record.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#2c3e50' }}>
        Submit New Record
      </h2>

      {error && (
        <div style={{ 
          background: '#e74c3c', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Title (Haitian Creole) *
          </label>
          <input
            type="text"
            required
            style={inputStyle}
            value={formData.title_ht}
            onChange={(e) => setFormData({ ...formData, title_ht: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Title (French)
          </label>
          <input
            type="text"
            style={inputStyle}
            value={formData.title_fr}
            onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Abstract (English)
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: '100px' }}
            value={formData.abstract_en}
            onChange={(e) => setFormData({ ...formData, abstract_en: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Classification
          </label>
          <select
            style={inputStyle}
            value={formData.creole_class}
            onChange={(e) => setFormData({ ...formData, creole_class: e.target.value })}
          >
            <option value="C-FOOD">C-FOOD</option>
            <option value="C-MED">C-MED</option>
            <option value="C-AGRI">C-AGRI</option>
            <option value="C-CRAFT">C-CRAFT</option>
            <option value="C-RITUAL">C-RITUAL</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Access Tier
          </label>
          <select
            style={inputStyle}
            value={formData.access_tier}
            onChange={(e) => setFormData({ ...formData, access_tier: e.target.value })}
          >
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
            <option value="secret">Secret</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Community
          </label>
          <input
            type="text"
            style={inputStyle}
            value={formData.community}
            onChange={(e) => setFormData({ ...formData, community: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Regions (comma-separated)
          </label>
          <input
            type="text"
            style={inputStyle}
            placeholder="e.g., Ouest, Nord, Sud"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
        >
          {loading ? 'Submitting...' : 'Submit Record'}
        </button>
      </form>
    </div>
  );
}