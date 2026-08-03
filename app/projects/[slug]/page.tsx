'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug, Project } from '@/lib/projects';

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    if (typeof params.slug === 'string') {
      setProject(getProjectBySlug(params.slug) ?? null);
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

      <div className="price" style={{ fontSize: 24, margin: '16px 0' }}>{project.price}</div>
      <span className="status ready">{project.rera ? 'MahaRERA Verified' : 'New Launch'}</span>
      {project.propertyType && (
        <span className="status ready" style={{ marginLeft: 8 }}>{project.propertyType}</span>
      )}

      {project.description && <p style={{ marginTop: 24 }}>{project.description}</p>}
    </div>
  );
}
