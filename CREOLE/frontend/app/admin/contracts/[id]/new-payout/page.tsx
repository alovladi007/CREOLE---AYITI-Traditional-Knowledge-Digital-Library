'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPayoutPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
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
      const res = await fetch(`${apiUrl}/v1/benefit/payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          contractId: params.id,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
        }),
      });

      if (!res.ok) throw new Error('Failed to create payout');

      router.push(`/admin/contracts/${params.id}`);
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
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#2c3e50' }}>
        Create New Payout
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

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>
              Amount *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              style={inputStyle}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>
              Currency
            </label>
            <select
              style={inputStyle}
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="HTG">HTG</option>
            </select>
          </div>

          <div style={{ 
            background: '#e8f4fd', 
            padding: '1rem', 
            borderRadius: '4px',
            marginBottom: '1.5rem',
            border: '1px solid #bee5eb'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#004085' }}>
              This will create a pending payout that can be processed through your payment system.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => router.push(`/admin/contracts/${params.id}`)}
              style={{
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              Cancel
            </button>
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
                flex: 1,
              }}
            >
              {loading ? 'Creating...' : 'Create Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}