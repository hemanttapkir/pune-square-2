'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getProjects, Project, PROPERTY_TYPES, PropertyType } from '@/lib/projects';

// Shared corridor data
const CORRIDORS = [
  {
    node: '01', tag: 'West IT Corridor', title: 'Hinjewadi – Wakad – Baner',
    desc: 'Anchored by Rajiv Gandhi Infotech Park. Highest concentration of new launches in the city.',
    range: '₹75L – ₹8Cr', sub: 'Studio to 5BHK penthouse',
    localities: ['hinjewadi', 'wakad', 'baner'],
  },
  {
    node: '02', tag: 'East IT Corridor', title: 'Kharadi – Magarpatta – Hadapsar',
    desc: 'EON IT Park and Magarpatta City drive demand. Fastest-growing rental yields in Pune.',
    range: '₹85L – ₹7.5Cr', sub: '2BHK to 4BHK villas',
    localities: ['kharadi', 'magarpatta', 'hadapsar'],
  },
  {
    node: '03', tag: 'Riverside & NW', title: 'Balewadi – Aundh – Bavdhan',
    desc: 'Established residential belt near the Mula-Mutha, close to both IT corridors.',
    range: '₹1.0Cr – ₹3.9Cr', sub: 'Mid to upper-mid segment',
    localities: ['balewadi', 'aundh', 'bavdhan'],
  },
  {
    node: '04', tag: 'SW / Old Pune Fringe', title: 'Kothrud – Warje – NIBM',
    desc: 'Legacy Pune neighbourhoods redeveloping fast, walkable to the old city core.',
    range: '₹95L – ₹13Cr', sub: 'Widest price spread in the city',
    localities: ['kothrud', 'warje', 'nibm'],
  },
  {
    node: '05', tag: 'Affordable & Industrial', title: 'PCMC – Mamurdi – Punawale',
    desc: "Pimpri-Chinchwad's industrial base plus new affordable-housing supply.",
    range: '₹52L – ₹3.2Cr', sub: 'Best entry-level value',
    localities: ['pcmc', 'pimpri', 'chinchwad', 'mamurdi', 'punawale'],
  },
  {
    node: '06', tag: 'Central Premium', title: 'Koregaon Park – Bund Garden',
    desc: "Pune's oldest premium address. Low supply, and it shows in the price ceiling.",
    range: '₹99L – ₹45Cr', sub: "City's ultra-luxury pocket",
    localities: ['koregaon', 'bund garden', 'bund'],
  },
];

const BUDGETS = ['Any budget', 'Under ₹80L', '₹80L – ₹1.5Cr', '₹1.5Cr – ₹3Cr', '₹3Cr and above'];

// Small inline icon set
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
  ruler: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h18v8H3z" />
      <path d="M7 8v3M11 8v3M15 8v3M19 8v3" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M4 21V10M20 21V10M2 10l10-6 10 6" />
      <path d="M7 21v-6M12 21v-6M17 21v-6" />
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
  Apartment: ICONS.building,
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
  Plot: (
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

function parsePriceToLakh(price: string): number | null {
  if (!price) return null;
  const match = price.match(/([\d.]+)\s*(L|Cr)/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return match[2].toLowerCase() === 'cr' ? value * 100 : value;
}

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
  const [query, setQuery] = useState('');
  const [corridor, setCorridor] = useState('All corridors');
  const [budget, setBudget] = useState('Any budget');
  const [propertyType, setPropertyType] = useState<PropertyTypeFilter>('All types');
  const [searchTab, setSearchTab] = useState<'buy' | 'rent'>('buy');

  // Properly awaiting async getProjects call
  useEffect(() => {
    async function loadProjects() {
      const data = await getProjects();
      setProjects(data || []);
    }
    loadProjects();
  }, []);

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
        const lakh = parsePriceToLakh(item.price || '');
        if (lakh !== null && !matchesBudget(lakh, budget)) return false;
      }
      if (propertyType !== 'All types' && item.propertyType !== propertyType) {
        return false;
      }
      return true;
    });
  }, [projects, query, corridor, budget, propertyType]);

  const filtersActive =
    query.trim() !== '' || corridor !== 'All corridors' || budget !== 'Any budget' || propertyType !== 'All types';

  function clearFilters() {
    setQuery('');
    setCorridor('All corridors');
    setBudget('Any budget');
    setPropertyType('All types');
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
      <header>
        <div className="wrap nav-inner">
          <div className="logo">
            Pune<span>Square</span>
          </div>
          <nav>
            <ul>
              <li><a href="#corridors">Corridors</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#markets">Price Snapshot</a></li>
              <li><a href="#guides">Guides</a></li>
            </ul>
          </nav>
          <a href="#projects" className="btn btn-solid nav-cta">Browse Projects</a>
        </div>
      </header>

      <section className="hero-v2">
        <div className="hero-bg">
          <img
            src="/hero-photo.jpg"
            alt="Pune skyline"
            className="skyline-bg"
          />
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  aria-label="Search by project name or locality"
                />
              </div>
              <div className="search-field">
                {ICONS.building}
                <select value={propertyType} 
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

      <div className="stat-strip">
        <div className="wrap stat-grid">
          <div className="stat">
            <span className="stat-icon">{ICONS.building}</span>
            <div><b>1,300+</b><span>active projects tracked across Pune MMR</span></div>
          </div>
          <div className="stat">
            <span className="stat-icon">{ICONS.layers}</span>
            <div><b>6</b><span>distinct growth corridors, each with its own price logic</span></div>
          </div>
          <div className="stat">
            <span className="stat-icon">{ICONS.rupee}</span>
            <div><b>₹45L–₹45Cr</b><span>range of live listings, from PCMC studios to Bund Garden penthouses</span></div>
          </div>
          <div className="stat">
            <span className="stat-icon">{ICONS.users}</span>
            <div><b>25+</b><span>developers with current Pune launches</span></div>
          </div>
        </div>
      </div>

      <section id="corridors" className="corridor-section">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">The corridor map</p>
            <h2>Pune doesn&apos;t have one market. It has six.</h2>
            <p>Price in this city follows infrastructure, not just distance from Shivajinagar. Scroll along the line — each stop is a corridor with its own IT anchor, price band, and buyer profile.</p>
          </div>
        </div>
        <div className="corridor-rail">
          <div className="corridor-track">
            {CORRIDORS.map((s) => (
              <div className="stop reveal" key={s.node}>
                <div className="node">{s.node}</div>
                <span className="tag"><span className="tag-icon">{ICONS.pin}</span>{s.tag}</span>
                <h4>{s.title}</h4>
                <p className="locs">{s.desc}</p>
                <p className="range">{s.range}<small>{s.sub}</small></p>
              </div>
            ))}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
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

          {projects.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', marginTop: '16px' }}>
              No custom projects added yet. <Link href="/admin/add-project" style={{ color: 'var(--brick)', fontWeight: 600 }}>Add one now →</Link>
            </p>
          ) : filteredProjects.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', marginTop: '16px' }}>
              No projects match your filters. <button type="button" className="finder-clear" onClick={clearFilters} style={{ marginLeft: '4px' }}>Clear filters</button>
            </p>
          ) : (
            <div className="project-grid" style={{ marginTop: '24px' }}>
              {filteredProjects.map((item: Project) => {
                const cardImage = item.imagesUrl?.[0] || '/placeholder.svg';
                const extraPhotos = (item.imagesUrl?.length || 0) - 1;

                return (
                  <div className="pcard" key={item.id}>
                    <Link href={`/projects/${item.slug}`} className="pcard-img" aria-label={`View details for ${item.title}`}>
                      <img
                        src={cardImage}
                        alt={item.title}
                        loading="lazy"
                      />
                      {extraPhotos > 0 && (
                        <span className="img-count">
                          <span className="img-count-icon">{ICONS.camera}</span>
                          +{extraPhotos}
                        </span>
                      )}
                    </Link>

                    <div className="pcard-body">
                      <div className="pcard-top">
                        <span className="loc"><span className="loc-icon">{ICONS.pin}</span>{item.location}</span>
                        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {item.propertyType && <span className="status ready">{item.propertyType}</span>}
                          <span className="status">{item.rera ? 'MahaRERA Verified' : 'New Launch'}</span>
                        </span>
                      </div>

                      <Link href={`/projects/${item.slug}`} className="pcard-title-link">
                        <h3>{item.title}</h3>
                      </Link>
                      <div className="divider" />

                      <div className="meta">
                        <div className="price">
                          {item.price || 'Price on Request'}
                          <small>Starting Price</small>
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
          )}
        </div>
      </section>

      <section id="markets" style={{ background: 'var(--stone-2)' }}>
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Price snapshot</p>
            <h2>What each corridor costs, at a glance</h2>
            <p>Ranges pulled from current live listings in each corridor — useful for a first gut-check before you shortlist.</p>
          </div>

          <div className="table-wrap reveal">
            <table>
              <thead>
                <tr><th>Corridor</th><th>Anchor locality</th><th>Price range</th><th>Typical config mix</th></tr>
              </thead>
              <tbody>
                <tr data-label="West IT Corridor"><td className="loc-name" data-th="Corridor">West IT Corridor</td><td data-th="Anchor locality">Hinjewadi, Wakad, Baner</td><td className="price-cell" data-th="Price range">₹75L – ₹8Cr</td><td data-th="Config mix">2–4 BHK</td></tr>
                <tr data-label="East IT Corridor"><td className="loc-name" data-th="Corridor">East IT Corridor</td><td data-th="Anchor locality">Kharadi, Magarpatta</td><td className="price-cell" data-th="Price range">₹85L – ₹7.5Cr</td><td data-th="Config mix">2–4 BHK</td></tr>
                <tr data-label="Riverside & NW"><td className="loc-name" data-th="Corridor">Riverside &amp; NW</td><td data-th="Anchor locality">Balewadi, Bavdhan</td><td className="price-cell" data-th="Price range">₹1.0Cr – ₹3.9Cr</td><td data-th="Config mix">2–3 BHK</td></tr>
                <tr data-label="SW / Old Pune Fringe"><td className="loc-name" data-th="Corridor">SW / Old Pune Fringe</td><td data-th="Anchor locality">Kothrud, NIBM</td><td className="price-cell" data-th="Price range">₹95L – ₹13Cr</td><td data-th="Config mix">2–4.5 BHK</td></tr>
                <tr data-label="Affordable & Industrial"><td className="loc-name" data-th="Corridor">Affordable &amp; Industrial</td><td data-th="Anchor locality">Pimpri, Mamurdi, Punawale</td><td className="price-cell" data-th="Price range">₹52L – ₹3.2Cr</td><td data-th="Config mix">1–3 BHK</td></tr>
                <tr data-label="Central Premium"><td className="loc-name" data-th="Corridor">Central Premium</td><td data-th="Anchor locality">Koregaon Park, Bund Garden</td><td className="price-cell" data-th="Price range">₹99L – ₹45Cr</td><td data-th="Config mix">3–6 BHK</td></tr>
              </tbody>
            </table>
          </div>
          <p className="table-note">Ranges reflect listed unit prices across current projects in each corridor and will shift as new phases launch.</p>
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
            ].map((name) => (
              <span className="chip" key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="guides" style={{ background: 'var(--stone-2)' }}>
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Before you sign anything</p>
            <h2>Guides for first-time Pune buyers</h2>
            <p>The paperwork and math that site-visit sales teams tend to gloss over.</p>
          </div>

          <div className="guide-grid reveal">
            <div className="gcard">
              <span className="num"><span className="num-icon">{ICONS.shield}</span>01 · Legal</span>
              <h3>MahaRERA registration, and what it actually protects</h3>
              <p>Every project on this page should carry a MahaRERA number — here&apos;s how to verify one, and what it does and doesn&apos;t guarantee about delivery timelines.</p>
              <span className="read">Read the guide →</span>
            </div>
            <div className="gcard">
              <span className="num"><span className="num-icon">{ICONS.ruler}</span>02 · Measurement</span>
              <h3>Carpet area vs built-up vs super built-up</h3>
              <p>Why the sqft figure on the brochure isn&apos;t the sqft figure you&apos;ll actually live in, and how the loading percentage changes the real price per square foot.</p>
              <span className="read">Read the guide →</span>
            </div>
            <div className="gcard">
              <span className="num"><span className="num-icon">{ICONS.bank}</span>03 · Financing</span>
              <h3>Home loans: LTV, pre-EMI, and the fine print</h3>
              <p>How loan-to-value ratios work for under-construction property, what pre-EMI actually costs you, and the documents banks ask for in Pune specifically.</p>
              <span className="read">Read the guide →</span>
            </div>
            <div className="gcard">
              <span className="num"><span className="num-icon">{ICONS.clock}</span>04 · Timing</span>
              <h3>Ready-to-move vs under-construction, honestly compared</h3>
              <p>The GST difference, the possession-delay risk, and why the &quot;price gap&quot; between the two is usually smaller than it first looks.</p>
              <span className="read">Read the guide →</span>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-band">
        <div className="wrap">
          <h2>Talk to someone who isn&apos;t on commission from a single builder.</h2>
          <p>Tell us your corridor, budget and timeline — we&apos;ll shortlist three projects worth an actual site visit.</p>
          <a href="#" className="btn">Get a shortlist</a>
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="logo">Pune<span>Square</span></div>
              <p className="about">An independent, informational guide to Pune&apos;s residential real estate — corridors, current launches, and the paperwork that matters. Not a brokerage.</p>
            </div>
            <div>
              <h5>Explore</h5>
              <ul>
                <li><a href="#corridors">Corridor map</a></li>
                <li><a href="#projects">Featured projects</a></li>
                <li><a href="#markets">Price snapshot</a></li>
              </ul>
            </div>
            <div>
              <h5>Corridors</h5>
              <ul>
                <li><a href="#corridors">Hinjewadi–Wakad–Baner</a></li>
                <li><a href="#corridors">Kharadi–Magarpatta</a></li>
                <li><a href="#corridors">Kothrud–NIBM</a></li>
              </ul>
            </div>
            <div>
              <h5>Guides</h5>
              <ul>
                <li><a href="#guides">MahaRERA basics</a></li>
                <li><a href="#guides">Carpet vs built-up area</a></li>
                <li><a href="#guides">Home loan basics</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Pune Square. Informational content only — verify project and pricing details directly with the developer.</span>
            <span>Pune, Maharashtra</span>
          </div>
        </div>
      </footer>
    </>
  );
}
