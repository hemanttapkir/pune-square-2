'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getProjects, Project, PROPERTY_TYPES, PropertyType } from '@/lib/projects';
import { parsePriceToLakh } from '@/lib/price';
import { submitInquiry } from '@/lib/inquiries';

const PROJECTS_PER_PAGE = 6;

function formatPrice(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Price on Request';
  const toLacsOrCr = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(0)} Lac`;
  };
  if (min && max) return `${toLacsOrCr(min)} - ${toLacsOrCr(max)}`;
  return `Starting ${toLacsOrCr(min || max!)}`;
}

// Shared corridor data
const CORRIDORS = [
  {
    node: '01', tag: 'West IT Corridor', title: 'Hinjewadi – Wakad – Mahalunge',
    desc: 'Anchored by Rajiv Gandhi Infotech Park. Highest concentration of new launches in the city.',
    range: '₹75L – ₹8Cr', sub: 'Studio to 5BHK penthouse',
    localities: ['hinjewadi', 'wakad', 'mahalunge', 'sus', 'tathawade'],
  },
  {
    node: '02', tag: 'East IT Corridor', title: 'Kharadi – Wagholi – Mundhwa',
    desc: 'EON IT Park and Magarpatta City drive demand. Fastest-growing rental yields in Pune.',
    range: '₹85L – ₹7.5Cr', sub: '2BHK to 4BHK villas',
    localities: ['kharadi', 'magarpatta', 'vimannagar', 'mundhwa'],
  },
  {
    node: '03', tag: 'Premium Riverside', title: 'Balewadi – Baner – Aundh',
    desc: 'Established residential belt near the Mula-Mutha, close to both IT corridors.',
    range: '₹1.0Cr – ₹3.9Cr', sub: 'Mid to upper-mid segment',
    localities: ['balewadi', 'baner', 'aundh'],
  },
  {
    node: '04', tag: 'West / Central Pune', title: 'Kothrud – Warje – Bavdhan',
    desc: 'Legacy Pune neighbourhoods redeveloping fast, walkable to the old city core.',
    range: '₹95L – ₹20Cr', sub: 'Widest price spread in the city',
    localities: ['kothrud', 'Bavdhan', 'Warje', 'Paud Road', 'Karve Road', 'Bhugaon', 'sinhagad road', 'pune'],
  },
  {
    node: '05', tag: 'North & North West', title: 'PCMC – Mamurdi – Punawale',
    desc: "Pimpri-Chinchwad's industrial base plus new affordable-housing supply.",
    range: '₹52L – ₹3.2Cr', sub: 'Best entry-level value',
    localities: ['pcmc', 'mamurdi', 'punawale'],
  },
  {
    node: '06', tag: 'East Premium', title: 'Koregaon Park – Kalyani Nagar - Viman Nagar',
    desc: "Pune's oldest premium address. Low supply, and it shows in the price ceiling.",
    range: '₹99L – ₹45Cr', sub: "City's ultra-luxury pocket",
    localities: ['koregaon', 'bund garden', 'Kalyani nagar', 'vimannagar'],
  },
  {
    node: '07', tag: 'South Pune', title: 'NIBM – Hadapsar – Manjari',
    desc: 'South Pune is a mix of IT, industrial, and residential. Good value for mid-segment buyers.',
    range: '₹65L – ₹3.5Cr', sub: 'Mid-segment villas and apartments',
    localities: ['nibm', 'hadapsar', 'magarpatta', 'manjari', 'kondhwa'],
  }
];

const BUDGETS = ['Any budget', 'Under ₹80L', '₹80L – ₹1.5Cr', '₹1.5Cr – ₹3Cr', '₹3Cr and above'];

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Tell us your corridor & budget',
    desc: 'Two minutes on the shortlist form below — where in Pune, what budget, and when you need to move.',
  },
  {
    n: '02',
    title: 'We cross-check live inventory',
    desc: 'We match your brief against current launches across all six corridors, not just one builder\u2019s portfolio.',
  },
  {
    n: '03',
    title: 'You get three projects, not thirty',
    desc: 'A short, honest shortlist with RERA status, price-per-sqft context, and possession timelines.',
  },
  {
    n: '04',
    title: 'Site visits, on your schedule',
    desc: 'We coordinate visits directly with developer sales teams — no repeat cold calls from five agencies.',
  },
];

const ICONS = {
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  rupee: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12M6 8h12M6 3c4 0 7 1.5 7 5s-3 5-7 5h-1l8 8" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
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
};

const PROPERTY_ICONS: Record<PropertyType, React.ReactNode> = {
  "1BHK": ICONS.building,
  "2BHK": ICONS.building,
  "3BHK": ICONS.building,
  "4BHK": ICONS.building,
  Villa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v11h14V10" />
      <path d="M10 21v-6h4v6" />
    </svg>
  ),
  Studio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
      <path d="M2 18h20M4 11V7a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v4" />
    </svg>
  ),
  Penthouse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="9" width="14" height="13" rx="1" />
      <path d="M9 9V4h6v5" />
      <path d="M9 22v-5h6v5" />
    </svg>
  ),
  Duplex: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9 12 4l9 5-9 5-9-5z" />
      <path d="M3 9v7l9 5 9-5V9" />
      <path d="M12 14v5" />
    </svg>
  ),
  Commercial: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V9l7-5 7 5v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 12h.01M15 12h.01M9 8h.01M15 8h.01" />
    </svg>
  ),
};

function matchesBudget(lakh: number, bucket: string): boolean {
  switch (bucket) {
    case 'Under ₹80L': return lakh < 80;
    case '₹80L – ₹1.5Cr': return lakh >= 80 && lakh < 150;
    case '₹1.5Cr – ₹3Cr': return lakh >= 150 && lakh < 300;
    case '₹3Cr and above': return lakh >= 300;
    default: return true;
  }
}

type PropertyTypeFilter = PropertyType | 'All types';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [query, setQuery] = useState('');
  const [corridor, setCorridor] = useState('All corridors');
  const [budget, setBudget] = useState('Any budget');
  const [propertyType, setPropertyType] = useState<PropertyTypeFilter>('All types');
  const [searchTab, setSearchTab] = useState<'buy' | 'rent'>('buy');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadProjects() {
      setLoadingProjects(true);
      const data = await getProjects();
      setProjects(data || []);
      setLoadingProjects(false);
    }
    loadProjects();
  }, []);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, corridor, budget, propertyType]);

  const filteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];

    return projects.filter((item: Project) => {
      if (query.trim() && !item.title.toLowerCase().includes(query.trim().toLowerCase())) {
        return false;
      }
      if (corridor !== 'All corridors') {
        const c = CORRIDORS.find((c) => c.title === corridor);
        if (c && !c.localities.some((loc) => item.location?.toLowerCase().includes(loc))) {
          return false;
        }
      }
      if (budget !== 'Any budget') {
        const lakh = item.priceLakh ?? parsePriceToLakh(item.price || '');
        if (lakh !== null && !matchesBudget(lakh, budget)) return false;
      }
      if (propertyType !== 'All types' && item.propertyType !== propertyType) {
        return false;
      }
      return true;
    });
  }, [projects, query, corridor, budget, propertyType]);

  // Paginated Sliced Projects
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const filtersActive =
    query.trim() !== '' || corridor !== 'All corridors' || budget !== 'Any budget' || propertyType !== 'All types';

  function clearFilters() {
    setQuery('');
    setCorridor('All corridors');
    setBudget('Any budget');
    setPropertyType('All types');
    setCurrentPage(1);
  }

  function scrollToProjects() {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    scrollToProjects();
  }

  return (
    <>
      <section className="hero-v2">
        <div className="hero-bg">
          <img src="/hero-photo.jpg" alt="Pune skyline" className="skyline-bg" />
          <div className="hero-overlay" />
        </div>

        <div className="wrap hero-content">
          <p className="eyebrow">Pune, Maharashtra</p>
          <h1 className="hero-title-light">Find your next home in <em>Pune</em>, without the sales pitch.</h1>
          <p className="lede-light">Six growth corridors, hundreds of live launches, and a lot of sales pressure. We map the city by geography and price — not by whoever&apos;s advertising loudest this week.</p>

          <div className="search-card">
            <div className="search-tabs">
              <button type="button" className={`search-tab ${searchTab === 'buy' ? 'active' : ''}`} onClick={() => setSearchTab('buy')}>Buy</button>
              <button type="button" className={`search-tab ${searchTab === 'rent' ? 'active' : ''}`} onClick={() => setSearchTab('rent')}>Rent</button>
            </div>
            {searchTab === 'rent' && (
              <p className="search-note">Rental listings are coming soon — search below still shows current buy inventory.</p>
            )}
            <form className="search-fields" onSubmit={handleHeroSearch}>
              <div className="search-field">
                {ICONS.pin}
                <input
                  type="text"
                  placeholder="Locality, project or corridor"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search by project name or locality"
                />
              </div>
              <div className="search-field">
                {ICONS.building}
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyTypeFilter)}
                  aria-label="Filter by property type"
                >
                  <option value="All types">All types</option>
                  {(PROPERTY_TYPES || []).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="search-field">
                {ICONS.rupee}
                <select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Filter by budget">
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-solid search-submit">Search</button>
            </form>
          </div>

          <div className="hero-trust">
            <span><span className="hero-trust-icon">{ICONS.shield}</span>MahaRERA status shown on every project</span>
            <span><span className="hero-trust-icon">{ICONS.users}</span>No brokerage layer on top of listings</span>
            <span><span className="hero-trust-icon">{ICONS.clock}</span>Shortlist turnaround in under 24 hrs</span>
          </div>
        </div>
      </section>

      <section className="category-section">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Browse by type</p>
            <h2>Find the configuration you&apos;re after</h2>
          </div>
          <div className="category-grid reveal">
            {(PROPERTY_TYPES || []).map((type) => {
              const count = projects.filter((p) => p.propertyType === type).length;
              return (
                <button
                  key={type}
                  type="button"
                  className={`category-tile ${propertyType === type ? 'active' : ''}`}
                  onClick={() => {
                    setPropertyType(type);
                    scrollToProjects();
                  }}
                >
                  <span className="category-icon">{PROPERTY_ICONS[type]}</span>
                  <span className="category-name">{type}</span>
                  <span className="category-count">{count} listing{count === 1 ? '' : 's'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="projects">
        <div className="wrap">
          <div className="section-head section-head-flex">
            <div>
              <p className="eyebrow">Active Inventory</p>
              <h2>Latest Projects</h2>
            </div>
            <Link href="/admin/add-project" className="btn btn-solid">+ Add New Project</Link>
          </div>

          <div className="type-tabs reveal">
            <button
              type="button"
              className={`type-tab ${propertyType === 'All types' ? 'active' : ''}`}
              onClick={() => setPropertyType('All types')}
            >
              All
            </button>
            {(PROPERTY_TYPES || []).map((t) => (
              <button
                key={t}
                type="button"
                className={`type-tab ${propertyType === t ? 'active' : ''}`}
                onClick={() => setPropertyType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="finder">
            <div className="finder-bar">
              <div className="finder-field finder-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by project name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search by project name"
                />
              </div>

              <div className="finder-divider" />

              <select value={corridor} onChange={(e) => setCorridor(e.target.value)} aria-label="Filter by corridor">
                <option>All corridors</option>
                {CORRIDORS.map((c) => (
                  <option key={c.node} value={c.title}>{c.title}</option>
                ))}
              </select>

              <div className="finder-divider" />

              <select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Filter by budget">
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="finder-meta">
              <span>{filteredProjects.length} of {projects.length} projects match</span>
              {filtersActive && (
                <button type="button" className="finder-clear" onClick={clearFilters}>Clear filters</button>
              )}
            </div>
          </div>

          {loadingProjects ? (
            <div className="project-grid" style={{ marginTop: '24px' }}>
              {[0, 1, 2].map((i) => <div className="pcard pcard-skeleton" key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', marginTop: '16px' }}>
              No custom projects added yet. <Link href="/admin/add-project" style={{ color: 'var(--brick)', fontWeight: 600 }}>Add one now →</Link>
            </p>
          ) : filteredProjects.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', marginTop: '16px' }}>
              No projects match your filters. <button type="button" className="finder-clear" onClick={clearFilters} style={{ marginLeft: '4px' }}>Clear filters</button>
            </p>
          ) : (
            <>
              <div className="project-grid" style={{ marginTop: '24px' }}>
                {paginatedProjects.map((item: Project) => {
                  const cardImage = item.featured_image || item.imagesUrl?.[0] || '/placeholder.png';
                  const extraPhotos = (item.imagesUrl?.length || 0) - 1;

                  return (
                    <div className="pcard" key={item.id}>
                      <Link href={`/projects/${item.slug}`} className="pcard-img" aria-label={`View details for ${item.title}`}>
                        <img src={cardImage} alt={item.title} loading="lazy" />
                        {extraPhotos > 0 && (
                          <span className="img-count">
                            <span className="img-count-icon">{ICONS.camera}</span>
                            +{extraPhotos}
                          </span>
                        )}
                      </Link>

                      <div className="pcard-body">
                        <div className="pcard-top">
                          <span className="loc">
                            <span className="loc-icon">{ICONS.pin}</span>
                            {item.locality || item.city}
                          </span>
                          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {item.propertyType && <span className="status ready">{item.propertyType}</span>}
                            <span className="status">
                              {item.rera_id ? 'MahaRERA Verified' : (item.constructionStatus?.replace(/_/g, ' ') || 'New Launch')}
                            </span>
                          </span>
                        </div>

                        <Link href={`/projects/${item.slug}`} className="pcard-title-link">
                          <h3>{item.title}</h3>
                        </Link>

                        {item.possessionDate && (
                          <div className="possession-date" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            Possession: <strong>{new Date(item.possessionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</strong>
                          </div>
                        )}

                        <div className="divider" />

                        <div className="meta">
                          <div className="price">
                            {item.priceRange || item.price || formatPrice(item.min_price, item.max_price)}
                            <small>{item.min_price && item.max_price ? 'Price range' : 'Starting Price'}</small>
                          </div>
                          <Link
                            href={`/projects/${item.slug}`}
                            className="btn btn-solid"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ padding: '8px 16px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage((p) => p - 1);
                        scrollToProjects();
                      }
                    }}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>

                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ padding: '8px 16px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage((p) => p + 1);
                        scrollToProjects();
                      }
                    }}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="process-section" style={{ background: 'var(--basalt)' }}>
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow" style={{ color: 'var(--gold)' }}>How it works</p>
            <h2 style={{ color: 'var(--stone)' }}>From corridor confusion to a shortlist, in four steps</h2>
          </div>
          <div className="process-grid reveal">
            {PROCESS_STEPS.map((step) => (
              <div className="pstep" key={step.n}>
                <span className="pstep-n">{step.n}</span>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Who&apos;s building</p>
            <h2>Developers active in Pune right now</h2>
          </div>
          <div className="builder-row reveal">
            {[
              'Godrej Properties', 'Lodha Group', 'Kolte Patil Developers', 'Shapoorji Pallonji Group',
              'VTP Realty', 'Vilas Javdekar Developers', 'Mahindra Lifespace', 'Gera Developer',
              'Hiranandani Group', 'Puravankara Group', 'Birla Estates', 'Kalpataru Group',
              'Sobha Limited', 'Adani Realty',
            ].map((builder) => (
              <div className="builder-pill" key={builder}>{builder}</div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}