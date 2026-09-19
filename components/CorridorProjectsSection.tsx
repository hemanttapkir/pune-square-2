'use client';

import React, { useState, useRef, useMemo } from 'react';
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

export default function CorridorProjectsSection({ projects, onSelectLocality }: CorridorProjectsProps) {
  const [activeCorridorId, setActiveCorridorId] = useState<string>(PUNE_CORRIDORS[0].id);
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeCorridor = useMemo(
    () => PUNE_CORRIDORS.find((c) => c.id === activeCorridorId) || PUNE_CORRIDORS[0],
    [activeCorridorId]
  );

  // All projects belonging to active corridor
  const corridorProjects = useMemo(() => {
    return projects.filter((project) => {
      const projLoc = (project.locality || project.location || '').toLowerCase().trim();
      return activeCorridor.localities.some((loc) => projLoc.includes(loc.toLowerCase().trim()));
    });
  }, [projects, activeCorridor]);

  // Calculate project count for each locality chip
  const localityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: corridorProjects.length,
    };

    activeCorridor.localities.forEach((loc) => {
      const locLower = loc.toLowerCase().trim();
      counts[loc] = projects.filter((p) => {
        const pLoc = (p.locality || p.location || '').toLowerCase().trim();
        return pLoc.includes(locLower);
      }).length;
    });

    return counts;
  }, [projects, activeCorridor, corridorProjects]);

  // Filtered projects according to selected locality
  const filteredProjects = useMemo(() => {
    if (selectedLocality === 'ALL') return corridorProjects;
    return corridorProjects.filter((project) => {
      const projLoc = (project.locality || project.location || '').toLowerCase().trim();
      return projLoc.includes(selectedLocality.toLowerCase().trim());
    });
  }, [corridorProjects, selectedLocality]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleCorridorChange = (corridorId: string) => {
    setActiveCorridorId(corridorId);
    setSelectedLocality('ALL');
  };

  const handleLocalityClick = (loc: string) => {
    setSelectedLocality(loc);
    if (onSelectLocality) {
      onSelectLocality(loc === 'ALL' ? '' : loc);
    }
  };

  return (
    <section className="corridor-section" style={{ background: 'var(--bg-light)', padding: '60px 0' }}>
      <div className="wrap">
        <div className="section-head-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span className="eyebrow">CURATED REGIONAL PORTFOLIO</span>
            <h2>Explore Projects Locality</h2>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleScroll('left')}
              aria-label="Previous Slide"
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
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handleScroll('right')}
              aria-label="Next Slide"
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Corridor Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '16px',
            marginBottom: '24px',
            scrollbarWidth: 'none',
          }}
        >
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

        {/* Locality Chips with Counts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '40px',
            padding: '16px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--line-light)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-gold)', marginRight: '12px' }}>
            Filter Locality:
          </span>
          
          <button
            onClick={() => handleLocalityClick('ALL')}
            style={{
              padding: '6px 14px',
              border: selectedLocality === 'ALL' ? '1px solid var(--accent-gold)' : '1px solid transparent',
              background: selectedLocality === 'ALL' ? 'var(--bg-card)' : 'transparent',
              color: selectedLocality === 'ALL' ? 'var(--text-dark)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            All Localities <span style={{ opacity: 0.7, fontSize: '11px', marginLeft: '2px' }}>({localityCounts['ALL'] || 0})</span>
          </button>

          {activeCorridor.localities.map((loc) => {
            const count = localityCounts[loc] || 0;
            return (
              <button
                key={loc}
                onClick={() => handleLocalityClick(loc)}
                style={{
                  padding: '6px 14px',
                  border: selectedLocality === loc ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  background: selectedLocality === loc ? 'var(--bg-card)' : 'transparent',
                  color: selectedLocality === loc ? 'var(--text-dark)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {loc} <span style={{ opacity: 0.7, fontSize: '11px', marginLeft: '2px' }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Project Cards Carousel */}
        {filteredProjects.length > 0 ? (
          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              gap: '32px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              paddingBottom: '24px',
              scrollbarWidth: 'none',
            }}
          >
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="pcard"
                style={{
                  minWidth: '360px',
                  maxWidth: '380px',
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                }}
              >
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
                      <span className="status ready">
                        {project.constructionStatus.replace('_', ' ')}
                      </span>
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
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              border: '1px solid var(--line-light)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--text-dark)' }}>
              No projects found in this specific locality at present.
            </p>
            <button
              onClick={() => handleLocalityClick('ALL')}
              className="btn btn-solid"
              style={{ marginTop: '16px' }}
            >
              View All Corridor Projects
            </button>
          </div>
        )}
      </div>
    </section>
  );
}