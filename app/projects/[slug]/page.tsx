'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug, Project } from '@/lib/projects';
import { supabase } from '@/lib/supabase';

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    if (typeof params.slug === 'string') {
      if (params?.slug) {
        getProjectBySlug(params.slug).then((data) => setProject(data ?? null));
      }
    }
  }, [params.slug]);

  if (project === undefined) {
    return <div className="wrap" style={{ padding: '64px 32px' }}>Loading…</div>;
  }

  if (project === null) {
    return (
      <div className="wrap" style={{ padding: '64px 32px' }}>
        <p>We couldn&apos;t find that project.</p>
        <Link href="/" style={{ color: 'var(--brick)', fontWeight: 600 }}>← Back to all projects</Link>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: '64px 32px', maxWidth: 800 }}>
      <Link href="/" style={{ color: 'var(--brick)', fontWeight: 600 }}>← Back to all projects</Link>
      <h1 style={{ marginTop: 16 }}>{project.title}</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{project.location}</p>

      {project.imagesUrl && project.imagesUrl.length > 0 && (
        <img 
          src={project.imagesUrl[0]} 
          alt={project.title}
          style={{ width: '100%', borderRadius: 'var(--radius)', margin: '24px 0' }}
        />
      )}

      {project.rera && (
        <div style={{ marginTop: 8, fontSize: '14px', color: '#555' }}>
          <strong>MahaRERA No:</strong> {project.rera}
        </div>
      )}

      {/* 1. AMENITIES SECTION */}
      {project.amenities && project.amenities.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Amenities</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 12 }}>
            {project.amenities.map((item: string, index: number) => (
              <span 
                key={index} 
                style={{ backgroundColor: '#f3f4f6', padding: '6px 12px', borderRadius: '16px', fontSize: '14px' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. UNIT PRICING SECTION */}
      {project.unit_pricing && project.unit_pricing.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Unit Configurations & Pricing</h3>
          <div style={{ marginTop: 12 }}>
            {project.unit_pricing.map((unit: any, index: number) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span>{unit.unit_type}</span>
                <span>{unit.carpet_area}</span>
                <strong>{unit.price}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.price && (
        <div className="price" style={{ fontSize: 24, margin: '16px 0' }}>{project.price}</div>
      )}
      
      <span className="status ready">{project.rera ? 'MahaRERA Verified' : 'New Launch'}</span>
      {project.propertyType && (
        <span className="status ready" style={{ marginLeft: 8 }}>{project.propertyType}</span>
      )}

      {project.description && <p style={{ marginTop: 24 }}>{project.description}</p>}

      {/* INQUIRY LEAD CAPTURE FORM */}
      <InquiryForm propertyId={project.id} />
    </div>
  );
}

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('inquiries').insert([
      {
        property_id: propertyId,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
      },
    ]);

    setLoading(false);
    if (error) {
      alert('Error submitting inquiry: ' + error.message);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#e6fffa', borderRadius: '8px' }}>
        <h3>Thank you!</h3>
        <p>Our team will contact you shortly regarding this property.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '32px', padding: '24px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Enquire About This Project</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <input
          type="text"
          placeholder="Full Name *"
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          style={{ padding: '8px' }}
        />
        <input
          type="tel"
          placeholder="Phone Number *"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={{ padding: '8px' }}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ padding: '8px' }}
        />
        <textarea
          placeholder="Message / Questions"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          style={{ padding: '8px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Request Callback'}
        </button>
      </form>
    </div>
  );
}