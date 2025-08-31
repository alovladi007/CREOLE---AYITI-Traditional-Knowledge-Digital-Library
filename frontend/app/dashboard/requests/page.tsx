'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccessRequest {
  id: string;
  recordId: string;
  requester: string;
  purpose: string;
  requested_fields?: string[];
  status: string;
  createdAt: string;
}

export default function AdminInboxPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      
      if (!session.authenticated || !session.roles.includes('admin')) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/v1/access-requests/inbox`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch requests');
      
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, decision: 'approve' | 'deny', note?: string) => {
    setProcessing(id);
    
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/v1/access-requests/${id}/${decision}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({ note }),
      });

      if (!res.ok) throw new Error(`Failed to ${decision} request`);
      
      await fetchRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Loading access requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: '#e74c3c' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#2c3e50' }}>
        Access Request Inbox
      </h2>

      {requests.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          No pending access requests
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {requests.map((request) => (
            <div
              key={request.id}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                opacity: processing === request.id ? 0.6 : 1,
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.1rem' }}>
                    Request from {request.requester}
                  </strong>
                  <span style={{ color: '#666', fontSize: '0.875rem' }}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Record ID: {request.recordId}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Purpose:</strong>
                <p style={{ marginTop: '0.5rem', color: '#555' }}>
                  {request.purpose}
                </p>
              </div>

              {request.requested_fields && request.requested_fields.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Requested Fields:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#555' }}>
                    {request.requested_fields.join(', ')}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    const note = prompt('Add a note (optional):');
                    handleDecision(request.id, 'approve', note || undefined);
                  }}
                  disabled={processing === request.id}
                  style={{
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '4px',
                    cursor: processing === request.id ? 'not-allowed' : 'pointer',
                    flex: 1,
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    const note = prompt('Reason for denial:');
                    if (note) {
                      handleDecision(request.id, 'deny', note);
                    }
                  }}
                  disabled={processing === request.id}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '4px',
                    cursor: processing === request.id ? 'not-allowed' : 'pointer',
                    flex: 1,
                  }}
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}