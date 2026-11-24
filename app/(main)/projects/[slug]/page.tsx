'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Fraunces, Inter } from 'next/font/google';
import { getProjectBySlug, getSimilarProjects, Project } from '@/lib/projects';
import { submitInquiry } from '@/lib/inquiries';

/**
 * OPTIONAL FIELDS
 * ----------------
 * This page reads a few extra, optional fields off `Project` if you have them.
 * None of them are required — every section that uses them is guarded and
 * simply hides itself when the data isn't there.
 *
 *   developer?: string;
 *   developerYears?: number;         // years in business
 *   developerProjectCount?: number;  // delivered projects
 *   totalUnits?: number;
 *   latitude?: number;
 *   longitude?: number;
 *   reels?: { url: string; title?: string; thumbnail?: string }[]; // direct video URLs (mp4/webm)
 */

const display = Fraunces({ subsets: ['latin'], weight: ['500', '600'], style: ['normal', 'italic'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const C = {
  paper: '#FBF9F4',
  paperRaised: '#FFFFFF',
  ink: '#1B2420',
  inkSoft: '#5B655F',
  hairline: '#E4DFD1',
  hairlineStrong: '#D3CBB8',
  pine: '#0E5C48',
  pineDeep: '#0A4436',
  pineTint: '#EAF2EE',
  gold: '#A9782F',
  goldTint: '#F7EFDE',
  danger: '#B3452F',
};

const ICONS = {
  pin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  shield: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4z" />
    </svg>
  ),
  download: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  share: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  volumeOn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ),
  volumeOff: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  play: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  ),
  pause: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Best-effort parse of strings like "₹75.00 L" / "1.2 Cr" / "7500000" into rupees. */
function parseRupees(value?: string | number | null): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[₹,\s]/g, '');
  const crMatch = cleaned.match(/^([\d.]+)\s*(cr|crore)/i);
  if (crMatch) return parseFloat(crMatch[1]) * 1e7;
  const lMatch = cleaned.match(/^([\d.]+)\s*(l|lac|lakh)/i);
  if (lMatch) return parseFloat(lMatch[1]) * 1e5;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * Indian digit grouping (1,23,456) without Intl.
 * Intl.NumberFormat('en-IN') can differ between Node (small-ICU) and the
 * browser, which breaks hydration — this is deterministic everywhere.
 */
function groupIndian(n: number): string {
  const s = Math.round(Math.abs(n)).toString();
  const sign = n < 0 ? '-' : '';
  if (s.length <= 3) return sign + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${sign}${rest},${last3}`;
}

function formatRupees(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.00$/, '')} L`;
  return `₹${groupIndian(n)}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Deterministic "March 2027" / "Mar 2027" formatting.
 * Uses a fixed IST offset (UTC+5:30, no DST) and getUTC* accessors so the
 * server's timezone can never disagree with the browser's.
 */
function formatMonthYear(input?: string | Date | null, short = false): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '';
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  const month = MONTHS[ist.getUTCMonth()];
  return `${short ? month.slice(0, 3) : month} ${ist.getUTCFullYear()}`;
}

function computeEmi(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 12 / 100;
  const n = years * 12;
  if (r === 0) return principal / n;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi;
}

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);
  const [activeUnitType, setActiveUnitType] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [similarProjects, setSimilarProjects] = useState<Project[]>([]);

  // Reels / Shorts viewer state
  const [reelsViewerIndex, setReelsViewerIndex] = useState<number | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Download Official Brochure');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // EMI calculator state
  const [loanLakhs, setLoanLakhs] = useState<number>(50);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  useEffect(() => {
    if (params?.slug && typeof params.slug === 'string') {
      const decodedSlug = decodeURIComponent(params.slug);
      getProjectBySlug(decodedSlug).then((data) => setProject(data ?? null));
    }
  }, [params?.slug]);

  // Fetch similar projects once we know the current project
  useEffect(() => {
    if (project) {
      getSimilarProjects(project.id, project.city).then(setSimilarProjects);
    }
  }, [project]);

  const images: string[] = useMemo(() => {
    if (!project) return [];
    const list = [project.featured_image, ...(project.imagesUrl || [])].filter(Boolean) as string[];
    return list.length ? Array.from(new Set(list)) : ['/placeholder.png'];
  }, [project]);

  const reels = (project as any)?.reels as { url: string; title?: string; thumbnail?: string }[] | undefined;

  const unitGroups = useMemo(() => {
    const pricing: any[] = (project as any)?.unit_pricing || [];
    const map = new Map<string, any[]>();
    pricing.forEach((u) => {
      const key = u.unit_type || 'Configuration';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(u);
    });
    return Array.from(map.entries()).map(([type, units]) => ({ type, units }));
  }, [project]);

  useEffect(() => {
    if (unitGroups.length && !activeUnitType) setActiveUnitType(unitGroups[0].type);
  }, [unitGroups, activeUnitType]);

  const activeGroup = unitGroups.find((g) => g.type === activeUnitType) || unitGroups[0];

  const priceRange = useMemo(() => {
    const pricing: any[] = (project as any)?.unit_pricing || [];
    const values = pricing.map((u) => parseRupees(u.price)).filter((n): n is number => n != null);
    if (!values.length) return null;
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [project]);

  // Seed the EMI calculator once we know the price range
  useEffect(() => {
    if (priceRange) setLoanLakhs(Math.round((priceRange.min * 0.8) / 1e5));
  }, [priceRange]);

  const highlights = useMemo(() => {
    if (!project) return [];
    const items: string[] = [];
    if (project.rera_id) items.push(`Registered with MahaRERA under ${project.rera_id}`);
    if (unitGroups.length) items.push(`${unitGroups.length} configuration${unitGroups.length > 1 ? 's' : ''} available — ${unitGroups.map((g) => g.type).join(', ')}`);
    if (project.possessionDate) {
      items.push(
        `Possession expected ${formatMonthYear(project.possessionDate)}`
      );
    }
    if (project.amenities?.length) items.push(`${project.amenities.length} on-site amenities, including ${project.amenities.slice(0, 3).join(', ')}`);
    if ((project as any).developer) items.push(`Developed by ${(project as any).developer}`);
    return items;
  }, [project, unitGroups]);

  const openLeadModal = (title: string = 'Download Official Brochure') => {
    setModalTitle(title);
    setIsSubmitted(false);
    setIsModalOpen(true);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: project?.title, url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !project) return;

    setIsSubmitting(true);
    try {
      await submitInquiry({
        project_id: project.id,
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
    return (
      <div className={`${body.variable}`} style={{ padding: '96px 32px', textAlign: 'center', color: C.inkSoft, fontFamily: 'var(--font-body)' }}>
        Loading project details…
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`${display.variable} ${body.variable}`} style={{ padding: '96px 32px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600 }}>We couldn&apos;t find that project</h1>
        <p style={{ color: C.inkSoft, marginTop: 10 }}>It may have been unpublished, or the link is out of date.</p>
        <Link
          href="/#projects"
          style={{ marginTop: 24, display: 'inline-block', background: C.pine, color: '#fff', padding: '12px 22px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}
        >
          Browse active projects
        </Link>
      </div>
    );
  }

  const emiMonthly = computeEmi(loanLakhs * 1e5, interestRate, tenureYears);
  const totalPayment = emiMonthly * tenureYears * 12;
  const totalInterest = totalPayment - loanLakhs * 1e5;

  const statusLabel = project.constructionStatus?.replace(/_/g, ' ') || (project.rera_id ? 'RERA registered' : 'New launch');
  const possessionLabel = project.possessionDate ? formatMonthYear(project.possessionDate, true) : null;
  const locationLabel = project.locality || project.location || project.city || 'Pune';

  return (
    <div className={`${display.variable} ${body.variable}`} style={{ fontFamily: 'var(--font-body)', color: C.ink, background: C.paper, paddingBottom: 96 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px 0' }}>
        <Link href="/" style={{ color: C.inkSoft, textDecoration: 'none', fontSize: 13.5, fontWeight: 500 }}>
          ← Back to all projects
        </Link>

        {/* Status strip */}
        <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Pill icon={ICONS.shield} tone="pine">
            {project.rera_id ? 'RERA registered' : statusLabel}
          </Pill>
          {possessionLabel && (
            <Pill icon={ICONS.clock} tone="neutral">
              Possession by {possessionLabel}
            </Pill>
          )}
          <button
            onClick={handleShare}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${C.hairline}`, borderRadius: 20, padding: '7px 14px', fontSize: 13, fontWeight: 500, color: C.ink, cursor: 'pointer' }}
          >
            {ICONS.share} {shareCopied ? 'Link copied' : 'Share'}
          </button>
        </div>

        {/* Title block */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 6 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(28px, 4vw, 42px)', margin: 0, lineHeight: 1.08 }}>
            {project.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', color: C.inkSoft, fontSize: 15 }}>
            {(project as any).developer && <span>By {(project as any).developer}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{ICONS.pin} {locationLabel}</span>
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div
        style={{
          maxWidth: 1180,
          margin: '28px auto 0',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 40,
        }}
        className="pd-layout"
      >
        <style>{`
          .pd-layout { grid-template-columns: 1fr; }
          @media (min-width: 960px) {
            .pd-layout { grid-template-columns: minmax(0, 1fr) 360px; align-items: start; }
          }
          .pd-rail { position: static; }
          @media (min-width: 960px) {
            .pd-rail { position: sticky; top: 24px; }
          }
          .pd-reels::-webkit-scrollbar { height: 6px; }
          .pd-reels::-webkit-scrollbar-thumb { background: ${C.hairlineStrong}; border-radius: 3px; }
          .pd-similar::-webkit-scrollbar { height: 6px; }
          .pd-similar::-webkit-scrollbar-thumb { background: ${C.hairlineStrong}; border-radius: 3px; }
          .pd-shorts-track::-webkit-scrollbar { display: none; }
        `}</style>

        {/* -------- LEFT COLUMN -------- */}
        <div style={{ minWidth: 0 }}>
          {/* Gallery */}
          <div>
            <div style={{ borderRadius: 4, overflow: 'hidden', background: '#eee' }}>
              <img src={images[activeImage]} alt={project.title} style={{ width: '100%', maxHeight: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10, overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      flex: '0 0 auto',
                      padding: 0,
                      border: i === activeImage ? `2px solid ${C.pine}` : `2px solid transparent`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: 'none',
                    }}
                  >
                    <img src={img} alt="" style={{ width: 84, height: 60, objectFit: 'cover', borderRadius: 2, display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property reels / shorts — inline autoplay previews, tap to open fullscreen viewer */}
          {reels && reels.length > 0 && (
            <Section title="Property reels">
              <ReelsRow reels={reels} onOpen={(i) => setReelsViewerIndex(i)} />
            </Section>
          )}

          {/* Description */}
          {project.description && (
            <Section title={`About ${project.title}`}>
              <p style={{ lineHeight: 1.75, color: '#3A4340', fontSize: 15.5, whiteSpace: 'pre-line', margin: 0 }}>{project.description}</p>
            </Section>
          )}

          {/* Highlights — derived from real project data */}
          {highlights.length > 0 && (
            <Section title="Highlights">
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
                {highlights.map((h, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.6 }}>
                    <span style={{ marginTop: 3, width: 18, height: 18, borderRadius: '50%', background: C.pineTint, color: C.pine, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                      {ICONS.check}
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Pricing table */}
          {unitGroups.length > 0 && (
            <Section title="Configurations & price list">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {unitGroups.map((g) => (
                  <button
                    key={g.type}
                    onClick={() => setActiveUnitType(g.type)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: `1px solid ${g.type === activeUnitType ? C.pine : C.hairline}`,
                      background: g.type === activeUnitType ? C.pine : 'transparent',
                      color: g.type === activeUnitType ? '#fff' : C.ink,
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {g.type}
                  </button>
                ))}
              </div>

              <div style={{ border: `1px solid ${C.hairline}`, borderRadius: 6, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#F4F1E9', borderBottom: `1px solid ${C.hairline}` }}>
                      <th style={th}>Carpet area</th>
                      <th style={th}>Price</th>
                      <th style={{ ...th, textAlign: 'right' as const }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeGroup?.units || []).map((unit: any, index: number) => (
                      <tr key={index} style={{ borderBottom: index < activeGroup.units.length - 1 ? `1px solid ${C.hairline}` : 'none' }}>
                        <td style={td}>{unit.carpet_area || 'On request'}</td>
                        <td style={{ ...td, fontWeight: 700, color: C.gold }}>{unit.price || 'Price on request'}</td>
                        <td style={{ ...td, textAlign: 'right' as const }}>
                          <button onClick={() => openLeadModal(`Enquire: ${activeGroup.type} · ${unit.carpet_area || ''}`)} style={smallOutlineBtn}>
                            Enquire now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Property details grid */}
          <Section title="Property details">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '18px 24px' }}>
              <Fact label="Property type" value={project.propertyType || 'Residential'} />
              <Fact label="Status" value={statusLabel} />
              {possessionLabel && <Fact label="Possession by" value={possessionLabel} />}
              <Fact label="Configurations" value={unitGroups.map((g) => g.type).join(', ') || '—'} />
              {(project as any).totalUnits && <Fact label="Total units" value={`${(project as any).totalUnits} units`} />}
              <Fact label="Location" value={locationLabel} />
              {project.rera_id && <Fact label="RERA ID" value={project.rera_id} />}
            </div>
          </Section>

          {/* Amenities */}
          {project.amenities && project.amenities.length > 0 && (
            <Section title="Amenities">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
                {project.amenities.map((item: string, index: number) => (
                  <div key={index} style={{ border: `1px solid ${C.hairline}`, borderRadius: 6, padding: '10px 14px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: C.pine }}>{ICONS.check}</span> {item}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Developer legacy */}
          {(project as any).developer && (
            <Section title="Developer">
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', border: `1px solid ${C.hairline}`, borderRadius: 6, padding: 20 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{(project as any).developer}</div>
                  <div style={{ color: C.inkSoft, fontSize: 14, marginTop: 4 }}>Developer of {project.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 32, marginLeft: 'auto' }}>
                  {(project as any).developerYears && <Stat value={`${(project as any).developerYears}+`} label="Years of experience" />}
                  {(project as any).developerProjectCount && <Stat value={`${(project as any).developerProjectCount}+`} label="Projects delivered" />}
                </div>
              </div>
            </Section>
          )}

          {/* Location */}
          <Section title="Location & connectivity">
            <p style={{ color: C.inkSoft, fontSize: 14.5, margin: '0 0 14px' }}>{locationLabel}</p>
            {(project as any).latitude && (project as any).longitude ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${(project as any).latitude},${(project as any).longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.pine, color: '#fff', padding: '10px 18px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
              >
                Get directions {ICONS.chevronRight}
              </a>
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.title + ' ' + locationLabel)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.pine, color: '#fff', padding: '10px 18px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
              >
                View on map {ICONS.chevronRight}
              </a>
            )}
          </Section>

          {/* EMI calculator */}
          <Section title="EMI calculator">
            <div style={{ border: `1px solid ${C.hairline}`, borderRadius: 6, padding: 24, display: 'grid', gap: 20 }}>
              <SliderField label="Loan amount" value={loanLakhs} min={5} max={500} step={1} suffix=" L" onChange={setLoanLakhs} />
              <SliderField label="Interest rate" value={interestRate} min={6} max={14} step={0.1} suffix="%" onChange={setInterestRate} />
              <SliderField label="Tenure" value={tenureYears} min={1} max={30} step={1} suffix=" yrs" onChange={setTenureYears} />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, paddingTop: 8, borderTop: `1px solid ${C.hairline}` }}>
                <div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft }}>Monthly EMI</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.pine, fontFamily: 'var(--font-display)' }}>{formatRupees(emiMonthly)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft }}>Total interest</div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{formatRupees(totalInterest)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft }}>Total payment</div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{formatRupees(totalPayment)}</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: C.inkSoft, margin: 0 }}>Indicative figures for planning purposes only — actual EMI depends on your lender's terms.</p>
            </div>
          </Section>
        </div>

        {/* -------- RIGHT RAIL -------- */}
        <div className="pd-rail">
          <div style={{ background: C.paperRaised, border: `1px solid ${C.hairline}`, borderRadius: 8, padding: 22, boxShadow: '0 8px 24px rgba(27,36,32,0.06)' }}>
            {project.rera_id && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${C.hairline}` }}>
                <div>
                  <div style={{ fontSize: 11.5, color: C.inkSoft }}>MahaRERA</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{project.rera_id}</div>
                </div>
                <a href="https://maharera.mahaonline.gov.in" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: C.pine, fontWeight: 600, textDecoration: 'none' }}>
                  Verify →
                </a>
              </div>
            )}

            <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 2 }}>{priceRange ? 'Price range' : 'Price'}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: C.ink }}>
              {priceRange ? `${formatRupees(priceRange.min)} – ${formatRupees(priceRange.max)}` : project.price || 'Price on request'}
            </div>

            {unitGroups.length > 0 && (
              <>
                <div style={{ display: 'flex', gap: 6, marginTop: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                  {unitGroups.map((g) => (
                    <button
                      key={g.type}
                      onClick={() => setActiveUnitType(g.type)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 16,
                        border: `1px solid ${g.type === activeUnitType ? C.pine : C.hairline}`,
                        background: g.type === activeUnitType ? C.pineTint : 'transparent',
                        color: g.type === activeUnitType ? C.pine : C.ink,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {g.type}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {(activeGroup?.units || []).map((u: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '6px 0', borderBottom: i < activeGroup.units.length - 1 ? `1px dashed ${C.hairline}` : 'none' }}>
                      <span style={{ color: C.inkSoft }}>{u.carpet_area || 'On request'}</span>
                      <span style={{ fontWeight: 700, color: C.gold }}>{u.price || 'On request'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
              <button onClick={() => openLeadModal('Download Official Brochure')} style={primaryBtn}>
                {ICONS.download} Download brochure
              </button>
              <button onClick={() => openLeadModal('Schedule Site Visit')} style={secondaryBtn}>
                Schedule a site visit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -------- SIMILAR PROJECTS -------- */}
      {similarProjects.length > 0 && (
        <div style={{ maxWidth: 1180, margin: '56px auto 0', padding: '0 24px' }}>
          <Section title="Similar projects you might like">
            <div className="pd-similar" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
              {similarProjects.map((p) => (
                <SimilarProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Sticky bottom bar (mobile-first, visible on all sizes) */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: C.paperRaised, borderTop: `1px solid ${C.hairline}`, padding: '12px 24px', zIndex: 40 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11.5, color: C.inkSoft }}>Starting price</div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {priceRange ? formatRupees(priceRange.min) : project.price || 'On request'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => openLeadModal('Schedule Site Visit')} style={{ ...secondaryBtn, padding: '10px 16px' }}>
              Site visit
            </button>
            <button onClick={() => openLeadModal('Download Official Brochure')} style={{ ...primaryBtn, padding: '10px 16px' }}>
              {ICONS.download} Brochure
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Reels / Shorts viewer */}
      {reels && reels.length > 0 && reelsViewerIndex !== null && (
        <ReelsViewer reels={reels} startIndex={reelsViewerIndex} onClose={() => setReelsViewerIndex(null)} />
      )}

      {/* Lead form modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,24,22,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ backgroundColor: C.paperRaised, borderRadius: 10, padding: 28, maxWidth: 420, width: '100%', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: C.inkSoft }}>
              {ICONS.close}
            </button>

            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 6px' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.pineTint, color: C.pine, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>Request submitted</h3>
                <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 14 }}>Thanks — our property specialist will share the details shortly.</p>
                <button onClick={() => setIsModalOpen(false)} style={{ ...primaryBtn, width: '100%', marginTop: 18, justifyContent: 'center' }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>{modalTitle}</h3>
                <p style={{ color: C.inkSoft, fontSize: 13.5, marginTop: 6 }}>Share your details and we'll send the full floor plans and price list.</p>

                <form onSubmit={handleFormSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Full name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{ ...primaryBtn, justifyContent: 'center', marginTop: 6, opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Submitting…' : 'Submit & download'}
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

// ---------------------------------------------------------------------------
// Presentational subcomponents & style objects
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 44 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 16px' }}>{title}</h2>
      {children}
    </div>
  );
}

function Pill({ children, icon, tone }: { children: React.ReactNode; icon?: React.ReactNode; tone: 'pine' | 'neutral' }) {
  const styles =
    tone === 'pine'
      ? { background: C.pineTint, color: C.pineDeep, border: `1px solid transparent` }
      : { background: 'transparent', color: C.inkSoft, border: `1px solid ${C.hairline}` };
  return (
    <span style={{ ...styles, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, fontSize: 12.5, fontWeight: 600 }}>
      {icon} {children}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.pine }}>{value}</div>
      <div style={{ fontSize: 12.5, color: C.inkSoft }}>{label}</div>
    </div>
  );
}

/**
 * Horizontally scrollable row of vertical (9:16) video-card previews.
 * Each preview autoplays muted + looped + inline as soon as it's visible
 * (IntersectionObserver — only on-screen previews actually play). Tapping
 * any card opens the fullscreen Reels/Shorts viewer at that index.
 */
function ReelsRow({
  reels,
  onOpen,
}: {
  reels: { url: string; title?: string; thumbnail?: string }[];
  onOpen: (index: number) => void;
}) {
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              /* autoplay can be blocked until user interacts with the page; safe to ignore */
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, [reels]);

  return (
    <div className="pd-reels" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory' }}>
      {reels.map((reel, i) => (
        <button
          key={reel.url + i}
          onClick={() => onOpen(i)}
          aria-label={`Play reel${reel.title ? `: ${reel.title}` : ''}`}
          style={{
            position: 'relative',
            flex: '0 0 auto',
            width: 200,
            aspectRatio: '9 / 16',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#000',
            scrollSnapAlign: 'start',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={reel.url}
            poster={reel.thumbnail}
            loop
            muted
            playsInline
            preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
          />

          {/* Play glyph hint */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(2px)' }}>
              <span style={{ marginLeft: 2 }}>{ICONS.play}</span>
            </div>
          </div>

          {reel.title && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
                color: '#fff',
                fontSize: 12.5,
                fontWeight: 600,
                textAlign: 'left',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              }}
            >
              {reel.title}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Fullscreen, swipeable Reels/Shorts-style viewer.
 * - Vertical scroll-snap: one video fills the screen at a time.
 * - Native touch swipe / mouse-wheel scroll moves between reels — no custom
 *   gesture code needed, the browser's scroll-snap handles it.
 * - Only the reel currently in view plays (IntersectionObserver); everything
 *   else is paused, so nothing plays audio/video off-screen.
 * - Tap the video to play/pause, tap the speaker icon to toggle sound.
 */
function ReelsViewer({
  reels,
  startIndex,
  onClose,
}: {
  reels: { url: string; title?: string; thumbnail?: string }[];
  startIndex: number;
  onClose: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Lock page scroll while the viewer is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Jump to the tapped reel immediately (no smooth animation on open)
  useEffect(() => {
    const container = containerRef.current;
    const target = videoRefs.current[startIndex]?.parentElement as HTMLElement | undefined;
    if (container && target) {
      container.scrollTo({ top: target.offsetTop, behavior: 'auto' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play only the reel that's mostly in view; pause the rest
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const idx = videoRefs.current.indexOf(video);
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveIndex(idx);
            setIsPaused(false);
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { root: container, threshold: [0, 0.6, 1] }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, [reels]);

  const togglePlayPause = () => {
    const video = videoRefs.current[activeIndex];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close reels"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 5,
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.14)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {ICONS.close}
      </button>

      {/* Mute toggle */}
      <button
        onClick={() => setIsMuted((m) => !m)}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 5,
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.14)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {isMuted ? ICONS.volumeOff : ICONS.volumeOn}
      </button>

      {/* Progress dots */}
      {reels.length > 1 && (
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 5 }}>
          {reels.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === activeIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'width 0.2s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Vertical snap track */}
      <div
        ref={containerRef}
        className="pd-shorts-track"
        style={{
          height: '100%',
          width: '100%',
          maxWidth: 480,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
        }}
      >
        {reels.map((reel, i) => (
          <div
            key={reel.url + i}
            style={{
              height: '100%',
              width: '100%',
              scrollSnapAlign: 'center',
              scrollSnapStop: 'always',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={togglePlayPause}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={reel.url}
              poster={reel.thumbnail}
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />

            {i === activeIndex && isPaused && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  {ICONS.play}
                </div>
              </div>
            )}

            {reel.title && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 28,
                  left: 20,
                  right: 20,
                  color: '#fff',
                  fontSize: 14.5,
                  fontWeight: 600,
                  textShadow: '0 1px 6px rgba(0,0,0,0.7)',
                }}
              >
                {reel.title}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Card used in the "Similar projects" strip at the bottom of the page. */
function SimilarProjectCard({ project }: { project: Project }) {
  const priceLabel = project.priceRange || project.price || 'Price on request';
  const locationLabel = project.locality || project.location || project.city || '';
  const image = project.featured_image || project.imagesUrl?.[0] || '/placeholder.png';

  return (
    <Link
      href={`/projects/${project.slug}`}
      style={{
        flex: '0 0 auto',
        width: 260,
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${C.hairline}`,
        background: C.paperRaised,
        textDecoration: 'none',
        color: C.ink,
        display: 'block',
      }}
    >
      <div style={{ width: '100%', height: 150, background: '#eee' }}>
        <img src={image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.title}
        </div>
        {locationLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.inkSoft, fontSize: 12.5, marginBottom: 8 }}>
            {ICONS.pin} {locationLabel}
          </div>
        )}
        <div style={{ fontWeight: 700, fontSize: 14, color: C.gold }}>{priceLabel}</div>
      </div>
    </Link>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 8 }}>
        <span style={{ color: C.inkSoft }}>{label}</span>
        <span style={{ fontWeight: 700 }}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: C.pine }}
      />
    </div>
  );
}

const th: React.CSSProperties = { padding: '12px 16px', fontWeight: 600, textAlign: 'left', fontSize: 12.5, color: C.inkSoft };
const td: React.CSSProperties = { padding: '13px 16px' };

const primaryBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  backgroundColor: C.pine,
  color: '#fff',
  border: 'none',
  padding: '12px 18px',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  backgroundColor: 'transparent',
  color: C.ink,
  border: `1px solid ${C.hairlineStrong}`,
  padding: '12px 18px',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

const smallOutlineBtn: React.CSSProperties = {
  background: 'none',
  border: `1px solid ${C.pine}`,
  color: C.pine,
  padding: '6px 12px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#3A4340', marginBottom: 4 };

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: `1px solid ${C.hairlineStrong}`,
  fontSize: 14,
  boxSizing: 'border-box',
};