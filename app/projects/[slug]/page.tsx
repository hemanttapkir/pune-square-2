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
</div>
  );
}