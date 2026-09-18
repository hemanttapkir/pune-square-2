'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProperties(data);
    }
    setLoading(false);
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const { error } = await supabase
      .from('properties')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this property?')) return;

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (!error) {
      setProperties(properties.filter(p => p.id !== id));
    } else {
      alert('Error deleting property: ' + error.message);
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/admin/inquiries"
            style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #ccc', textDecoration: 'none', color: '#000', borderRadius: '4px' }}
          >
            View Leads
          </Link>
          <Link
            href="/admin/add-project"
            style={{ padding: '8px 16px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}
          >
            + Add New Property
          </Link>
        </div>
      </div>
      <Link href="/" style={{ fontSize: '13px', color: '#666' }}>← Back to site</Link>

      <div style={{ marginTop: '24px' }}>
        {loading ? (
          <p>Loading projects...</p>
        ) : properties.length === 0 ? (
          <p>No properties found. Click "+ Add New Property" to get started.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px' }}>Project Title</th>
                <th style={{ padding: '12px' }}>Locality</th>
                <th style={{ padding: '12px' }}>MahaRERA No.</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    <Link href={`/projects/${p.slug}`} target="_blank" style={{ color: 'inherit' }}>
                      {p.title}
                    </Link>
                  </td>
                  <td style={{ padding: '12px' }}>{p.locality || '—'}</td>
                  <td style={{ padding: '12px' }}>{p.rera_id || '—'}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: p.status === 'active' ? '#dcfce7' : '#f3f4f6',
                        color: p.status === 'active' ? '#15803d' : '#4b5563'
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleStatus(p.id, p.status)}
                      style={{ marginRight: '8px', cursor: 'pointer', padding: '4px 8px' }}
                    >
                      {p.status === 'active' ? 'Hide' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{ color: 'red', cursor: 'pointer', padding: '4px 8px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}