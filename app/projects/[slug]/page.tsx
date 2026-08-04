'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug, Project } from '@/lib/projects';
import { supabase } from '@/lib/supabase';

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (typeof params.slug === 'string') {
      if (params?.slug) {
        getProjectBySlug(params.slug).then((data) => setProject(data ?? null));
      }
    }
  }, [params.slug]);

  useEffect(() => {
    setActiveImage(0);
  }, [project]);

  if (project === undefined) {
    return (
      <div className="wrap" style={{ padding: '64px 32px' }}>
        <div className="pd-skeleton" />
        <style jsx>{`
          .pd-skeleton {
            height: 420px;
            border-radius: var(--radius);
            background: linear-gradient(90deg, #f0efe9 0%, #f8f7f3 50%, #f0efe9 100%);
            background-size: 200% 100%;
            animation: shimmer 1.4s ease-in-out infinite;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="wrap" style={{ padding: '64px 32px' }}>
        <p>We couldn&apos;t find that project.</p>
        <Link href="/" style={{ color: 'var(--brick)', fontWeight: 600 }}>← Back to all projects</Link>
      </div>
    );
  }

  const images = project.imagesUrl && project.imagesUrl.length > 0 ? project.imagesUrl : [];

  return (
    <div className="pd-page">
      <div className="pd-wrap">
        <Link href="/" className="pd-back">← Back to all projects</Link>

        {/* GALLERY */}
        {images.length > 0 && (
          <div className="pd-gallery">
            <div className="pd-gallery-main">
              <img src={images[activeImage]} alt={project.title} />
              <div className="pd-gallery-overlay">
                <span className="pd-badge">
                  {project.rera ? 'MahaRERA Verified' : 'New Launch'}
                </span>
                {images.length > 1 && (
                  <span className="pd-counter">{activeImage + 1} / {images.length}</span>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${i === activeImage ? 'is-active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pd-body">
          {/* MAIN COLUMN */}
          <main className="pd-main">
            <div className="pd-eyebrow">{project.location}</div>
            <h1 className="pd-title">{project.title}</h1>

            {project.propertyType && (
              <span className="pd-chip">{project.propertyType}</span>
            )}

            <div className="pd-coursing" aria-hidden="true">
              <span /><span /><span /><span /><span /><span />
            </div>

            {project.description && (
              <section className="pd-section">
                <p className="pd-description">{project.description}</p>
              </section>
            )}

            {project.amenities && project.amenities.length > 0 && (
              <section className="pd-section">
                <h3 className="pd-h3">Amenities</h3>
                <div className="pd-amenities">
                  {project.amenities.map((item: string, index: number) => (
                    <span key={index} className="pd-amenity">{item}</span>
                  ))}
                </div>
              </section>
            )}

            {project.unit_pricing && project.unit_pricing.length > 0 && (
              <section className="pd-section">
                <h3 className="pd-h3">Unit Configurations &amp; Pricing</h3>
                <div className="pd-table">
                  <div className="pd-table-head">
                    <span>Type</span>
                    <span>Carpet Area</span>
                    <span>Price</span>
                  </div>
                  {project.unit_pricing.map((unit: any, index: number) => (
                    <div key={index} className="pd-table-row">
                      <span>{unit.unit_type}</span>
                      <span>{unit.carpet_area}</span>
                      <strong>{unit.price}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* STICKY SIDEBAR */}
          <aside className="pd-sidebar">
            <div className="pd-card">
              {project.price && (
                <>
                  <div className="pd-card-label">Starting from</div>
                  <div className="pd-card-price">{project.price}</div>
                </>
              )}
              <div className="pd-coursing pd-coursing--sm" aria-hidden="true">
                <span /><span /><span /><span />
              </div>
              {project.rera && (
                <div className="pd-rera">
                  <span className="pd-rera-label">MahaRERA No.</span>
                  <span className="pd-rera-value">{project.rera}</span>
                </div>
              )}
              <button className="pd-cta">Enquire Now</button>
              <button className="pd-cta pd-cta--ghost">Download Brochure</button>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .pd-page {
          background: var(--paper, #faf9f6);
          min-height: 100vh;
        }
        .pd-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 40px 32px 96px;
        }
        .pd-back {
          display: inline-block;
          color: var(--brick);
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          margin-bottom: 24px;
        }
        .pd-back:hover { text-decoration: underline; }

        /* Gallery */
        .pd-gallery { margin-bottom: 40px; }
        .pd-gallery-main {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: var(--radius);
          overflow: hidden;
          background: #eee;
        }
        .pd-gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pd-gallery-overlay {
          position: absolute;
          inset: auto 0 0 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 16px;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%);
        }
        .pd-badge {
          background: rgba(255,255,255,0.92);
          color: var(--ink, #1a1613);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 6px 12px;
          border-radius: 999px;
        }
        .pd-counter {
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          background: rgba(0,0,0,0.35);
          padding: 4px 10px;
          border-radius: 999px;
        }
        .pd-thumbs {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .pd-thumb {
          flex: 0 0 auto;
          width: 84px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          padding: 0;
          cursor: pointer;
          background: none;
          opacity: 0.65;
          transition: opacity 0.15s ease, border-color 0.15s ease;
        }
        .pd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pd-thumb.is-active { border-color: var(--brick); opacity: 1; }
        .pd-thumb:hover { opacity: 1; }

        /* Body layout */
        .pd-body {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 48px;
          align-items: start;
        }
        .pd-eyebrow {
          color: var(--ink-soft);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .pd-title {
          font-size: 34px;
          line-height: 1.15;
          margin: 6px 0 12px;
          color: var(--ink, #1a1613);
        }
        .pd-chip {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: var(--brick);
          border: 1px solid var(--brick);
          padding: 4px 12px;
          border-radius: 999px;
        }

        /* Brick coursing divider — signature motif */
        .pd-coursing {
          display: flex;
          gap: 4px;
          margin: 28px 0;
        }
        .pd-coursing span {
          height: 6px;
          flex: 1;
          background: var(--brick);
          opacity: 0.18;
          border-radius: 2px;
        }
        .pd-coursing span:nth-child(2n) { opacity: 0.32; }
        .pd-coursing span:nth-child(3n) { opacity: 0.45; }
        .pd-coursing--sm { margin: 18px 0; }

        .pd-section { margin-bottom: 36px; }
        .pd-h3 {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          margin-bottom: 14px;
        }
        .pd-description {
          font-size: 16px;
          line-height: 1.7;
          color: var(--ink, #2a2420);
        }
        .pd-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pd-amenity {
          background: #f3f2ee;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          color: var(--ink, #2a2420);
        }

        .pd-table {
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .pd-table-head, .pd-table-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          padding: 12px 16px;
          font-size: 14px;
        }
        .pd-table-head {
          background: #f3f2ee;
          font-weight: 700;
          color: var(--ink-soft);
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.03em;
        }
        .pd-table-row {
          border-top: 1px solid rgba(0,0,0,0.06);
          align-items: center;
          transition: background 0.15s ease;
        }
        .pd-table-row:hover { background: #faf7f2; }

        /* Sidebar */
        .pd-sidebar { position: sticky; top: 24px; }
        .pd-card {
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: var(--radius);
          padding: 24px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(20,15,10,0.06);
        }
        .pd-card-label {
          font-size: 12px;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          font-weight: 600;
        }
        .pd-card-price {
          font-size: 28px;
          font-weight: 700;
          color: var(--ink, #1a1613);
          margin-top: 4px;
        }
        .pd-rera {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 18px;
        }
        .pd-rera-label { font-size: 12px; color: var(--ink-soft); }
        .pd-rera-value { font-size: 13px; font-weight: 600; color: var(--ink, #2a2420); }
        .pd-cta {
          width: 100%;
          padding: 13px 16px;
          border-radius: var(--radius);
          border: none;
          background: var(--brick);
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          margin-bottom: 10px;
          transition: opacity 0.15s ease;
        }
        .pd-cta:hover { opacity: 0.88; }
        .pd-cta--ghost {
          background: transparent;
          color: var(--brick);
          border: 1.5px solid var(--brick);
          margin-bottom: 0;
        }

        @media (max-width: 860px) {
          .pd-body { grid-template-columns: 1fr; }
          .pd-sidebar { position: static; }
          .pd-title { font-size: 26px; }
          .pd-wrap { padding: 24px 20px 120px; }
          .pd-gallery-main { aspect-ratio: 4 / 3; }
        }
      `}</style>
    </div>
  );
}
