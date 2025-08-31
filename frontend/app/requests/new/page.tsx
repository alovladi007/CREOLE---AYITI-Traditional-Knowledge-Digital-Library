'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewAccessRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get('recordId') || '';
  
  const [formData, setFormData] = useState({
    recordId: recordId,
    purpose: '',
    requested_fields: '',
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
      
      if (!session.authenticated) {
        router.push('/api/auth/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/v1/access-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          recordId: formData.recordId,
          purpose: formData.purpose,
          requested_fields: formData.requested_fields 
            ? formData.requested_fields.split(',').map(f => f.trim())
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit request');
      }

      router.push('/');
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
        Request Access to Record
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
            Record ID *
          </label>
          <input
            type="text"
            required
            style={inputStyle}
            value={formData.recordId}
            onChange={(e) => setFormData({ ...formData, recordId: e.target.value })}
            placeholder="Enter the ID of the record you want to access"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Purpose of Access *
          </label>
          <textarea
            required
            style={{ ...inputStyle, minHeight: '120px' }}
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="Please describe why you need access to this record and how you plan to use the information"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Specific Fields Requested (optional)
          </label>
          <input
            type="text"
            style={inputStyle}
            value={formData.requested_fields}
            onChange={(e) => setFormData({ ...formData, requested_fields: e.target.value })}
            placeholder="e.g., metadata, community, region (comma-separated)"
          />
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
            Leave blank to request access to all fields
          </p>
        </div>

        <div style={{ 
          background: '#e8f4fd', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1.5rem',
          border: '1px solid #bee5eb'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#004085' }}>
            <strong>Note:</strong> Your request will be reviewed by an administrator. 
            You will be notified by email once a decision has been made.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
        >
          {loading ? 'Submitting...' : 'Submit Access Request'}
        </button>
      </form>
    </div>
  );
}