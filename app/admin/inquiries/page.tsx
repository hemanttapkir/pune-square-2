'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Inquiry {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  property_id: string | null;
  properties?: {
    title: string;
    slug: string;
  };
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    // Fetch inquiries and join with properties table to get the project title
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        properties (
          title,
          slug
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inquiries:', error.message);
    } else {
      setInquiries(data || []);
    }
    setLoading(false);
  };

  function projectLabel(item: Inquiry) {
    if (item.properties?.title) return item.properties.title;
    if (item.property_id === null) return 'General enquiry';
    return 'Unknown project';
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
      <Link href="/admin" style={{ fontSize: '13px', color: '#666' }}>← Back to dashboard</Link>
      <h1 style={{ marginTop: '8px' }}>Incoming Leads</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Includes both project-specific enquiries and general shortlist requests submitted on the homepage.
      </p>

      {loading ? (
        <div>Loading leads...</div>
      ) : inquiries.length === 0 ? (
        <div>No inquiries received yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', background: '#f9f9f9' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Project</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Contact</th>
              <th style={{ padding: '12px' }}>Message</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>
                  {item.properties?.slug ? (
                    <Link href={`/projects/${item.properties.slug}`} target="_blank" style={{ color: 'inherit' }}>
                      {projectLabel(item)}
                    </Link>
                  ) : (
                    <span style={{ color: item.property_id === null ? '#4b5563' : 'inherit' }}>{projectLabel(item)}</span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>{item.full_name}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  <div>📞 {item.phone}</div>
                  {item.email && <div style={{ color: '#666', fontSize: '12px' }}>✉️ {item.email}</div>}
                </td>
                <td style={{ padding: '12px', fontSize: '14px', maxWidth: '320px' }}>
                  {item.message || <span style={{ color: '#999' }}>No message</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
