'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewContractPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    community: '',
    recordId: '',
    payout_address: '',
    terms: {
      revenue_share: 0,
      payment_frequency: 'quarterly',
      minimum_payout: 100,
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      
      if (!session.authenticated || !session.roles.includes('admin')) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/v1/benefit/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          community: formData.community,
          recordId: formData.recordId || undefined,
          payout_address: formData.payout_address || undefined,
          terms: formData.terms,
          status: 'draft',
        }),
      });

      if (!res.ok) throw new Error('Failed to create contract');

      const contract = await res.json();
      router.push(`/admin/contracts/${contract.id}`);
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
        Create Benefit-Sharing Contract
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
            Community Name *
          </label>
          <input
            type="text"
            required
            style={inputStyle}
            value={formData.community}
            onChange={(e) => setFormData({ ...formData, community: e.target.value })}
            placeholder="e.g., Artibonite Communities"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Associated Record ID (optional)
          </label>
          <input
            type="text"
            style={inputStyle}
            value={formData.recordId}
            onChange={(e) => setFormData({ ...formData, recordId: e.target.value })}
            placeholder="UUID of related knowledge record"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Payout Address (optional)
          </label>
          <input
            type="text"
            style={inputStyle}
            value={formData.payout_address}
            onChange={(e) => setFormData({ ...formData, payout_address: e.target.value })}
            placeholder="Bank account or digital wallet address"
          />
        </div>

        <fieldset style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <legend style={{ padding: '0 0.5rem', fontWeight: '500' }}>Contract Terms</legend>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              Revenue Share (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              style={inputStyle}
              value={formData.terms.revenue_share}
              onChange={(e) => setFormData({ 
                ...formData, 
                terms: { ...formData.terms, revenue_share: parseInt(e.target.value) || 0 }
              })}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              Payment Frequency
            </label>
            <select
              style={inputStyle}
              value={formData.terms.payment_frequency}
              onChange={(e) => setFormData({ 
                ...formData, 
                terms: { ...formData.terms, payment_frequency: e.target.value }
              })}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Minimum Payout (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              style={inputStyle}
              value={formData.terms.minimum_payout}
              onChange={(e) => setFormData({ 
                ...formData, 
                terms: { ...formData.terms, minimum_payout: parseFloat(e.target.value) || 0 }
              })}
            />
          </div>
        </fieldset>

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
          {loading ? 'Creating...' : 'Create Contract'}
        </button>
      </form>
    </div>
  );
}