'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Contract {
  id: string;
  recordId?: string;
  community: string;
  status: string;
  payout_address?: string;
  terms: any;
  createdAt: string;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  txref?: string;
  createdAt: string;
}

export default function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContractDetails();
  }, []);

  const fetchContractDetails = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      
      if (!session.authenticated || !session.roles.includes('admin')) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const [contractRes, payoutsRes] = await Promise.all([
        fetch(`${apiUrl}/v1/benefit/contracts/${params.id}`, {
          headers: { 'Authorization': `Bearer ${session.token}` },
        }),
        fetch(`${apiUrl}/v1/benefit/contracts/${params.id}/payouts`, {
          headers: { 'Authorization': `Bearer ${session.token}` },
        }),
      ]);

      if (!contractRes.ok || !payoutsRes.ok) {
        throw new Error('Failed to fetch contract details');
      }

      const contractData = await contractRes.json();
      const payoutsData = await payoutsRes.json();
      
      setContract(contractData);
      setPayouts(payoutsData);
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
    pending: '#3498db',
    sent: '#27ae60',
    failed: '#e74c3c',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Loading contract details...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: '#e74c3c' }}>Error: {error || 'Contract not found'}</p>
      </div>
    );
  }

  const totalPayouts = payouts.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#2c3e50' }}>
          Contract Details
        </h2>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: '500', color: '#666' }}>Community</label>
            <p style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{contract.community}</p>
          </div>

          <div>
            <label style={{ fontWeight: '500', color: '#666' }}>Status</label>
            <p style={{ marginTop: '0.25rem' }}>
              <span style={{
                background: statusColors[contract.status],
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}>
                {contract.status}
              </span>
            </p>
          </div>

          {contract.payout_address && (
            <div>
              <label style={{ fontWeight: '500', color: '#666' }}>Payout Address</label>
              <p style={{ marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {contract.payout_address}
              </p>
            </div>
          )}

          <div>
            <label style={{ fontWeight: '500', color: '#666' }}>Contract Terms</label>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '4px',
              marginTop: '0.25rem'
            }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(contract.terms, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <label style={{ fontWeight: '500', color: '#666' }}>Created</label>
            <p style={{ marginTop: '0.25rem' }}>
              {new Date(contract.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.5rem', color: '#2c3e50' }}>
            Payouts
          </h3>
          <a
            href={`/admin/contracts/${params.id}/new-payout`}
            style={{
              background: '#3498db',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            New Payout
          </a>
        </div>

        {payouts.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            No payouts recorded yet
          </p>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Total Payouts:</strong> ${totalPayouts.toFixed(2)} USD
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Reference</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.75rem' }}>
                      ${payout.amount} {payout.currency}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        background: statusColors[payout.status],
                        color: 'white',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}>
                        {payout.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {payout.txref || '-'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}