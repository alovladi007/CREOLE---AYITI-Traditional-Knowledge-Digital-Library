'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Contract {
  id: string;
  recordId?: string;
  community: string;
  status: string;
  payout_address?: string;
  createdAt: string;
}

export default function ContractsListPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      
      if (!session.authenticated || !session.roles.includes('admin')) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/v1/benefit/contracts`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch contracts');
      
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    draft: '#95a5a6',
    active: '#27ae60',
    suspended: '#f39c12',
    terminated: '#e74c3c',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Loading contracts...</p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#2c3e50' }}>
          Benefit-Sharing Contracts
        </h2>
        <a
          href="/admin/contracts/new"
          style={{
            background: '#3498db',
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          New Contract
        </a>
      </div>

      {contracts.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          No contracts found
        </div>
      ) : (
        <div style={{ 
          background: 'white', 
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Community</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Created</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>{contract.community}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: statusColors[contract.status],
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                    }}>
                      {contract.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <a
                      href={`/admin/contracts/${contract.id}`}
                      style={{ color: '#3498db', textDecoration: 'none' }}
                    >
                      View Details →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}