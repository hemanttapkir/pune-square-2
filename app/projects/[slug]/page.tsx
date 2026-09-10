'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getProjectBySlug, getSimilarProjects, Project } from '@/lib/projects';
import { submitInquiry } from '@/lib/inquiries';

const ICONS = {
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.94-.27-.1-.46-.15-.66.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.08-.3-.15-1.24-.46-2.37-1.47-.87-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.66-.5-.17 0-.37-.03-.56-.03-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.34z" />
      <path d="M12 2a10 10 0 0 0-8.5 15.24L2 22l4.9-1.44A10 10 0 1 0 12 2z" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  ruler: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h18v8H3z" />
      <path d="M7 8v3M11 8v3M15 8v3M19 8v3" />
    </svg>
  ),
};

const STATUS_LABEL: Record<string, string> = {
  under_construction: 'Under Construction',
  ready_to_move: 'Ready to Move',
  new_launch: 'New Launch',
};

// A handful of generic amenity icons matched loosely by keyword — falls back to a dot.
function amenityIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('pool')) return '🏊';
  if (n.includes('gym') || n.includes('fitness')) return '🏋️';
  if (n.includes('club')) return '🏛️';
  if (n.includes('secur') || n.includes('cctv')) return '🛡️';
  if (n.includes('park') && n.includes('car')) return '🚗';
  if (n.includes('garden') || n.includes('park')) return '🌳';
  if (n.includes('play')) return '🧒';
  if (n.includes('lift') || n.includes('elevator')) return '🛗';
  if (n.includes('power') || n.includes('backup')) return '🔌';
  if (n.includes('water')) return '💧';
  if (n.includes('sport') || n.includes('court') || n.includes('badminton') || n.includes('tennis')) return '🏸';
  if (n.includes('yoga') || n.includes('meditation')) return '🧘';
  if (n.includes('wifi') || n.includes('internet')) return '📶';
  return '✅';
}

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

  if (notFound() || !project) {
    return (
      <div className="wrap detail-notfound">
        <h1>We couldn&apos;t find that project</h1>
        <p>It may have been unpublished or the link is out of date.</p>
        <Link href="/#projects" className="btn btn-solid">Browse active projects</Link>
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
