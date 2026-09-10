'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProjectBySlug, Project } from '@/lib/projects';
import { submitInquiry } from '@/lib/inquiries';

const ICONS = {
  pin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4z" />
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  download: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Download Official Brochure');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (params?.slug && typeof params.slug === 'string') {
      const decodedSlug = decodeURIComponent(params.slug);
      getProjectBySlug(decodedSlug).then((data) => setProject(data ?? null));
    }
  }, [params?.slug]);

  const openLeadModal = (title: string = 'Download Official Brochure') => {
    setModalTitle(title);
    setIsSubmitted(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !project) return; // Guard ensures project exists
  
    setIsSubmitting(true);
    try {
      await submitInquiry({
        project_id: project.id, // Fixed: TypeScript now knows project & project.id exist
        project_title: project.title || 'Unknown Project',
        fullName: formData.name,
        phone: formData.phone,
      });
      setIsSubmitted(true);
      setFormData({ name: '', phone: '' });
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      alert('There was an issue submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (project === undefined) {
    return <div className="wrap" style={{ padding: '64px 32px' }}>Loading project details…</div>;
  }

  if (!project) {
    return (
      <div className="wrap detail-notfound" style={{ padding: '64px 32px' }}>
        <h1>We couldn&apos;t find that project</h1>
        <p>It may have been unpublished or the link is out of date.</p>
        <Link href="/#projects" className="btn btn-solid" style={{ marginTop: 16, display: 'inline-block' }}>
          Browse active projects
        </Link>
      </div>
    );
  }

  const mainImage = project.featured_image || project.imagesUrl?.[0] || '/placeholder.svg';

  return (
    <div style={{ paddingBottom: '90px' }}>
      <div className="wrap" style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
        {/* Navigation back link */}
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          ← Back to all projects
        </Link>

        {/* Header Title Section */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>{project.title}</h1>
            <p style={{ color: '#666', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              {ICONS.pin} {project.locality || project.location || project.city}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
              {project.price || 'Price on Request'}
            </div>
            {project.rera_id && (
              <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                MahaRERA: {project.rera_id}
              </span>
            )}
          </div>
        </div>

        {/* Hero Image & Primary Action CTA */}
        <div style={{ position: 'relative', marginTop: 24, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <img
            src={mainImage}
            alt={project.title}
            style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 12 }}>
            <button
              onClick={() => openLeadModal('Download Official Brochure')}
              style={{
                backgroundColor: '#111',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {ICONS.download} Download Brochure
            </button>
          </div>
        </div>

        {/* Key Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 32 }}>
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Property Type</span>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: 4 }}>{project.propertyType || 'Residential Flat'}</div>
          </div>
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: 4 }}>
              {project.constructionStatus?.replace(/_/g, ' ') || (project.rera_id ? 'MahaRERA Verified' : 'New Launch')}
            </div>
          </div>
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Possession Date</span>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: 4 }}>
              {project.possessionDate ? new Date(project.possessionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'On Request'}
            </div>
          </div>
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</span>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: 4 }}>{project.locality || project.city || 'Pune'}</div>
          </div>
        </div>

        {/* Project Description */}
        {project.description && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>About {project.title}</h2>
            <p style={{ marginTop: 12, lineHeight: 1.7, color: '#374151', fontSize: '15px', whiteSpace: 'pre-line' }}>
              {project.description}
            </p>
          </div>
        )}

        {/* Brochure Download Banner CTA */}
        <div style={{ marginTop: 40, background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: '#fff', padding: '28px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Interested in {project.title}?</h3>
            <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: '14px' }}>Get complete floor plans, pricing sheets, and site layout directly on WhatsApp.</p>
          </div>
          <button
            onClick={() => openLeadModal('Request Detailed Price Sheet')}
            style={{ backgroundColor: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Get Instant Details
          </button>
        </div>

        {/* Unit Configurations & Pricing */}
        {project.unit_pricing && project.unit_pricing.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Configurations & Price List</h2>
            <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Unit Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Carpet Area</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {project.unit_pricing.map((unit: any, index: number) => (
                    <tr key={index} style={{ borderBottom: index < project.unit_pricing!.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{unit.unit_type || 'N/A'}</td>
                      <td style={{ padding: '14px 16px', color: '#4b5563' }}>{unit.carpet_area || 'On Request'}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>{unit.price || 'Price on Request'}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => openLeadModal(`Inquire: ${unit.unit_type}`)}
                          style={{ background: 'none', border: '1px solid #10b981', color: '#10b981', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Unlock Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Amenities Section */}
        {project.amenities && project.amenities.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Amenities & Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
              {project.amenities.map((item: string, index: number) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ color: '#10b981' }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Mobile & Desktop CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', padding: '12px 24px', zIndex: 40, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Starting Price</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111' }}>{project.price || 'Price on Request'}</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => openLeadModal('Schedule Site Visit')}
              style={{ backgroundColor: '#ffffff', color: '#111827', border: '1px solid #d1d5db', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Schedule Site Visit
            </button>
            <button
              onClick={() => openLeadModal('Download Official Brochure')}
              style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {ICONS.download} Download Brochure
            </button>
          </div>
        </div>
      </div>

      {/* Popup Modal Lead Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
            >
              {ICONS.close}
            </button>

            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div style={{ fontSize: '48px', marginBottom: 12 }}>✅</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Request Submitted!</h3>
                <p style={{ color: '#6b7280', marginTop: 8, fontSize: '14px' }}>
                  Thank you! Our property specialist will share the details and brochure with you shortly.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ marginTop: 20, backgroundColor: '#111827', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{modalTitle}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: 6 }}>
                  Enter your details to receive full project floor plans and price list.
                </p>

                <form onSubmit={handleFormSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      marginTop: 8,
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit & Download'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}