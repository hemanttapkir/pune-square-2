'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/lib/projects';

export interface CorridorConfig {
  id: string;
  name: string;
  tagline: string;
  localities: string[];
}

export const PUNE_CORRIDORS: CorridorConfig[] = [
  {
    id: 'east-hub',
    name: 'East Pune IT & Business Corridor',
    tagline: 'Kharadi, Kalyani Nagar & Viman Nagar',
    localities: ['Kharadi', 'Kalyani Nagar', 'Viman Nagar', 'Wagholi', 'Mundhwa', 'Hadapsar', 'Manjari'],
  },
  {
    id: 'west-prime',
    name: 'West Pune Prime Belt',
    tagline: 'Baner, Balewadi & Hinjawadi Tech Hub',
    localities: ['Baner', 'Balewadi', 'Hinjewadi', 'Aundh', 'Pimple Saudagar', 'Wakad', 'Tathawade'],
  },
  {
    id: 'central-luxury',
    name: 'Central & Premium Corridor',
    tagline: 'Koregaon Park, Prabhat Road & Kothrud',
    localities: ['Koregaon Park', 'Prabhat Road', 'Kothrud', 'Shivajinagar', 'FC Road', 'Bavdhan'],
  },
  {
    id: 'north-pimpri',
    name: 'PCMC & Northern Growth Belt',
    tagline: 'Charholi, Nigdi & Ravet Expansion',
    localities: ['Punawale', 'Nigdi', 'Ravet', 'Charholi', 'Moshi', 'Pimple Nilakh'],
  },
];

interface CorridorProjectsProps {
  projects: Project[];
  onSelectLocality?: (locality: string) => void;
}

const projectLocality = (p: Project) => (p.locality || p.location || '').toLowerCase().trim();

// Average price per sq.ft, only if the project data carries such a field.
const getAvgPricePerSqft = (list: Project[]): number | null => {
  const values = list
    .map((p) => {
      const anyP = p as any;
      const raw = anyP.pricePerSqft ?? anyP.price_per_sqft ?? anyP.pricePerSqFt;
      const n = typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.]/g, '')) : Number(raw);
      return Number.isFinite(n) && n > 0 ? n : null;
    })
    .filter((n): n is number => n !== null);
  if (!values.length) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
};

export default function CorridorProjectsSection({ projects, onSelectLocality }: CorridorProjectsProps) {
  const [activeCorridorId, setActiveCorridorId] = useState<string>(PUNE_CORRIDORS[0].id);
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const activeCorridor = useMemo(
    () => PUNE_CORRIDORS.find((c) => c.id === activeCorridorId) || PUNE_CORRIDORS[0],
    [activeCorridorId]
  );

  // One entry per locality in the active corridor, with its projects + card data
  const localityCards = useMemo(() => {
    return activeCorridor.localities.map((loc) => {
      const locLower = loc.toLowerCase().trim();
      const list = projects.filter((p) => projectLocality(p).includes(locLower));
      const withImage = list.find((p) => p.featured_image || p.imagesUrl?.[0]);
      return {
        name: loc,
        projects: list,
        count: list.length,
        image: withImage ? withImage.featured_image || withImage.imagesUrl?.[0] : undefined,
        avgPrice: getAvgPricePerSqft(list),
      };
    });
  }, [projects, activeCorridor]);

  const selectedCard = useMemo(
    () => localityCards.find((c) => c.name === selectedLocality) || null,
    [localityCards, selectedLocality]
  );

  // Scroll to results when a locality is picked
  useEffect(() => {
    if (selectedLocality && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedLocality]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -400 : 400,
      behavior: 'smooth',
    });
  };

  const handleCorridorChange = (corridorId: string) => {
    setActiveCorridorId(corridorId);
    setSelectedLocality(null);
    onSelectLocality?.('');
    scrollRef.current?.scrollTo({ left: 0 });
  };

  const handleLocalityClick = (loc: string | null) => {
    setSelectedLocality(loc);
    onSelectLocality?.(loc ?? '');
  };

  return (
    <section className="corridor-section" style={{ background: 'var(--bg-light)', padding: '60px 0' }}>
      <style>{`
        .lcard {
          position: relative;
          flex: 0 0 300px;
          height: 480px;
          border-radius: 32px;
          overflow: hidden;
          border: 0;
          padding: 0;
          text-align: left;
          cursor: pointer;
          scroll-snap-align: start;
          color: #fff;
          background: #1a1a1a;
          font-family: var(--font-sans);
          transition: transform .45s cubic-bezier(.2,.7,.2,1), box-shadow .45s ease;
        }
        .lcard:hover, .lcard.is-selected { transform: translateY(-6px); box-shadow: 0 22px 40px rgba(0,0,0,.28); }
        .lcard.is-selected { outline: 2px solid var(--accent-gold); outline-offset: 3px; }
        .lcard-img { object-fit: cover; transition: transform .8s ease; }
        .lcard:hover .lcard-img { transform: scale(1.06); }
        .lcard-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(10,10,10,.2) 0%, rgba(10,10,10,.55) 50%, rgba(10,10,10,.92) 100%);
          transition: background .45s ease;
        }
        .lcard:hover .lcard-overlay {
          background: linear-gradient(180deg, rgba(10,10,10,.4) 0%, rgba(10,10,10,.78) 45%, rgba(10,10,10,.96) 100%);
        }
        .lcard-body { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 28px 32px; z-index: 2; }
        .lcard-name {
          font-family: var(--font-serif);
          font-size: 32px; font-weight: 500; line-height: 1.15; margin: 0 0 8px; color: #fff;
        }
        .lcard-price { font-size: 17px; font-weight: 600; color: var(--accent-gold); margin: 0; }
        .lcard-more { max-height: 0; opacity: 0; overflow: hidden; transition: max-height .5s ease, opacity .4s ease, margin .4s ease; }
        .lcard:hover .lcard-more, .lcard.is-selected .lcard-more { max-height: 170px; opacity: 1; margin-top: 14px; }
        .lcard-desc { font-size: 13px; line-height: 1.6; color: rgba(255,255,255,.82); margin: 0 0 14px; }
        .lcard-cta { display: inline-flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; }
        @media (hover: none) { .lcard-more { max-height: 170px; opacity: 1; margin-top: 14px; } }
        @media (max-width: 768px) { .lcard { flex-basis: 78vw; height: 440px; } }
      `}</style>

      <div className="wrap">
        <div className="section-head-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span className="eyebrow">CURATED REGIONAL PORTFOLIO</span>
            <h2>Explore Projects Locality</h2>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {(['left', 'right'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => handleScroll(dir)}
                aria-label={dir === 'left' ? 'Previous Slide' : 'Next Slide'}
                style={{
                  width: '48px',
                  height: '48px',
                  border: '1px solid var(--line-light)',
                  background: 'var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={dir === 'left' ? 'M19 12H5M12 19l-7-7 7-7' : 'M5 12h14M12 5l7 7-7 7'} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Corridor Tabs */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px', scrollbarWidth: 'none' }}>
          {PUNE_CORRIDORS.map((corridor) => (
            <button
              key={corridor.id}
              onClick={() => handleCorridorChange(corridor.id)}
              style={{
                padding: '14px 24px',
                border: activeCorridorId === corridor.id ? '1px solid var(--text-dark)' : '1px solid var(--line-light)',
                background: activeCorridorId === corridor.id ? 'var(--text-dark)' : 'var(--bg-surface)',
                color: activeCorridorId === corridor.id ? 'var(--bg-light)' : 'var(--text-dark)',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {corridor.name}
            </button>
          ))}
        </div>

        {/* Locality Cards Carousel */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '28px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            padding: '8px 4px 32px',
            scrollbarWidth: 'none',
          }}
        >
          {localityCards.map((card) => (
            <button
              key={card.name}
              type="button"
              onClick={() => handleLocalityClick(card.name)}
              className={`lcard ${selectedLocality === card.name ? 'is-selected' : ''}`}
              aria-pressed={selectedLocality === card.name}
            >
              {card.image && (
                <Image src={card.image} alt={card.name} fill sizes="320px" unoptimized className="lcard-img" />
              )}
              <div className="lcard-overlay" />
              <div className="lcard-body">
                <h3 className="lcard-name">{card.name}</h3>
                <p className="lcard-price">
                  {card.avgPrice
                    ? `₹ ${card.avgPrice.toLocaleString('en-IN')}/sq.ft`
                    : `${card.count} ${card.count === 1 ? 'Project' : 'Projects'}`}
                </p>
                <div className="lcard-more">
                  <p className="lcard-desc">
                    {card.count > 0
                      ? `${card.count} residential ${card.count === 1 ? 'project' : 'projects'} in ${card.name}, part of the ${activeCorridor.name}.`
                      : `${card.name} is part of the ${activeCorridor.name}. New projects coming soon.`}
                  </p>
                  <span className="lcard-cta">
                    View Properties
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Results for the selected locality */}
        <div ref={resultsRef} style={{ scrollMarginTop: '24px' }}>
          {selectedCard && (
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
                <div>
                  <span className="eyebrow">{activeCorridor.name.toUpperCase()}</span>
                  <h2>
                    Projects in {selectedCard.name}{' '}
                    <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
                      ({selectedCard.count})
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => handleLocalityClick(null)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid var(--line-light)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-dark)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Clear Locality
                </button>
              </div>

              {selectedCard.projects.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                  {selectedCard.projects.map((project) => (
                    <div key={project.id} className="pcard" style={{ width: '380px', maxWidth: '100%' }}>
                      <Link href={`/projects/${project.slug}`} className="pcard-img">
                        <Image
                          src={project.featured_image || project.imagesUrl?.[0] || '/placeholder.png'}
                          alt={project.title}
                          width={380}
                          height={260}
                          unoptimized
                          style={{ objectFit: 'cover' }}
                        />
                        {project.imagesUrl && project.imagesUrl.length > 1 && (
                          <div className="img-count">
                            <span className="img-count-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            </span>
                            {project.imagesUrl.length} Photos
                          </div>
                        )}
                      </Link>

                      <div className="pcard-body">
                        <div className="pcard-top">
                          <span className="loc">
                            <span className="loc-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                            </span>
                            {project.locality || project.city || 'Pune'}
                          </span>
                          {project.constructionStatus && (
                            <span className="status ready">{project.constructionStatus.replace('_', ' ')}</span>
                          )}
                        </div>

                        <Link href={`/projects/${project.slug}`} className="pcard-title-link">
                          <h3>{project.title}</h3>
                        </Link>

                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 16px' }}>
                          {Array.isArray(project.propertyTypes)
                            ? project.propertyTypes.join(' • ')
                            : project.propertyType || 'Residential Luxury'}
                        </p>

                        <div className="divider" />

                        <div className="meta">
                          <div className="price">
                            {project.price}
                            <small>Starting Price</small>
                          </div>
                          <Link href={`/projects/${project.slug}`} className="btn btn-solid" style={{ padding: '10px 18px', fontSize: '10px' }}>
                            View Residence
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--line-light)' }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--text-dark)' }}>
                    No projects found in {selectedCard.name} at present.
                  </p>
                  <button onClick={() => handleLocalityClick(null)} className="btn btn-solid" style={{ marginTop: '16px' }}>
                    Back to Localities
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}