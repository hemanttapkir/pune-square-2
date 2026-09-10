'use client';
const formatPrice = (min?: number, max?: number) => {
  if (!min && !max) return 'Price on Request';
  const toLacsOrCr = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(0)} Lac`;
  };
  if (min && max) return `${toLacsOrCr(min)} - ${toLacsOrCr(max)}`;
  return `Starting ${toLacsOrCr(min || max!)}`;
};
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getProjects, Project, PROPERTY_TYPES, PropertyType } from '@/lib/projects';
import { parsePriceToLakh } from '@/lib/price';
import { submitInquiry } from '@/lib/inquiries';

// Shared corridor data
const CORRIDORS = [
  {
    node: '01', tag: 'West IT Corridor', title: 'Hinjewadi – Wakad – Mahalunge',
    desc: 'Anchored by Rajiv Gandhi Infotech Park. Highest concentration of new launches in the city.',
    range: '₹75L – ₹8Cr', sub: 'Studio to 5BHK penthouse',
    localities: ['hinjewadi', 'wakad', 'mahalunge'],
  },
  {
    node: '02', tag: 'East IT Corridor', title: 'Kharadi – Magarpatta – Hadapsar',
    desc: 'EON IT Park and Magarpatta City drive demand. Fastest-growing rental yields in Pune.',
    range: '₹85L – ₹7.5Cr', sub: '2BHK to 4BHK villas',
    localities: ['kharadi', 'magarpatta', 'hadapsar'],
  },
  {
    node: '03', tag: 'Riverside', title: 'Balewadi – Baner – Aundh',
    desc: 'Established residential belt near the Mula-Mutha, close to both IT corridors.',
    range: '₹1.0Cr – ₹3.9Cr', sub: 'Mid to upper-mid segment',
    localities: ['balewadi', 'baner', 'aundh'],
  },
  {
    node: '04', tag: 'West / Old Pune', title: 'Kothrud – Warje – Bavdhan',
    desc: 'Legacy Pune neighbourhoods redeveloping fast, walkable to the old city core.',
    range: '₹95L – ₹13Cr', sub: 'Widest price spread in the city',
    localities: ['kothrud', 'Bavdhan', 'Warje'],
  },
  {
    node: '05', tag: 'North & North West', title: 'PCMC – Mamurdi – Punawale',
    desc: "Pimpri-Chinchwad's industrial base plus new affordable-housing supply.",
    range: '₹52L – ₹3.2Cr', sub: 'Best entry-level value',
    localities: ['pcmc', 'mamurdi', 'punawale'],
  },
  {
    node: '06', tag: 'Central Premium', title: 'Koregaon Park – Bund Garden - Central Pune',
    desc: "Pune's oldest premium address. Low supply, and it shows in the price ceiling.",
    range: '₹99L – ₹45Cr', sub: "City's ultra-luxury pocket",
    localities: ['koregaon', 'bund garden', 'Central Pune'],
  },
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

const TESTIMONIALS = [
  {
    quote:
      'We were getting calls from six different brokers for the same Kharadi project. Pune Square just gave us the price table and RERA number and let us decide.',
    name: 'Ameya & Shalmali R.',
    detail: 'Bought a 3BHK in Kharadi, 2025',
  },
  {
    quote:
      'The carpet-vs-built-up guide alone saved us from overpaying on a Baner listing that quoted super built-up as if it were carpet area.',
    name: 'Rohit Deshpande',
    detail: 'Bought a 2BHK in Baner, 2025',
  },
  {
    quote:
      'Relocating from Bengaluru, we had zero context on Pune corridors. The corridor map made the Hinjewadi vs Kharadi decision obvious in a day.',
    name: 'Priya Nair',
    detail: 'Relocated for work, bought in Wakad',
  },
];

const FAQS = [
  {
    q: 'Is Pune Square a broker or builder?',
    a: 'Neither — we\u2019re an independent, informational listing and research layer on top of Pune\u2019s residential market. When you request a shortlist, we connect you directly with the relevant developer sales teams; we don\u2019t add a brokerage layer or fee on top.',
  },
  {
    q: 'How current is the pricing shown on each project?',
    a: 'Unit pricing is pulled from what developers currently list per configuration. Prices on under-construction projects move with construction stage, so always confirm the exact quote with the sales team before booking.',
  },
  {
    q: 'What does a MahaRERA number actually guarantee?',
    a: 'It confirms the project is registered with the Maharashtra Real Estate Regulatory Authority — meaning disclosed carpet areas, an escrow-linked payment structure, and a stated possession date. It does not guarantee construction quality or that the date will be met; always verify the number on the MahaRERA portal directly.',
  },
  {
    q: 'Do I pay anything for the shortlist?',
    a: 'No. The shortlist and every guide on this site are free. If you go on to book through a project we\u2019ve introduced, any brokerage is paid by the developer, standard practice across the industry.',
  },
];

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
  quote: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.17 6C4.86 8.11 3.4 10.9 3.4 14.06c0 3.1 2 5.24 4.6 5.24 2.4 0 4.1-1.8 4.1-4.06 0-2.14-1.5-3.7-3.5-3.7-.4 0-.7.05-.9.1.4-2.1 2-3.9 4.1-4.9L10.4 4.3C9.2 4.8 8.1 5.3 7.17 6zm10.3 0c-2.3 2.1-3.77 4.9-3.77 8.06 0 3.1 2 5.24 4.6 5.24 2.4 0 4.1-1.8 4.1-4.06 0-2.14-1.5-3.7-3.5-3.7-.4 0-.7.05-.9.1.4-2.1 2-3.9 4.1-4.9L20.7 4.3c-1.2.5-2.3 1-3.23 1.7z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Lead capture form state
  const [leadForm, setLeadForm] = useState({
    fullName: '', phone: '', email: '', corridor: 'Any corridor', budget: 'Any budget', message: '',
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setLoadingProjects(true);
      const data = await getProjects();
      setProjects(data || []);
      setLoadingProjects(false);
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
        const lakh = item.priceLakh ?? parsePriceToLakh(item.price || '');
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

  function handleLeadChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setLeadForm({ ...leadForm, [e.target.name]: e.target.value });
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLeadError(null);
    setLeadSubmitting(true);
    try {
      const context = [
        leadForm.corridor !== 'Any corridor' ? `Preferred corridor: ${leadForm.corridor}` : null,
        leadForm.budget !== 'Any budget' ? `Budget: ${leadForm.budget}` : null,
        leadForm.message.trim() ? `Message: ${leadForm.message.trim()}` : null,
      ].filter(Boolean).join(' | ');

      await submitInquiry({
        fullName: leadForm.fullName.trim(),
        phone: leadForm.phone.trim(),
        email: leadForm.email.trim() || undefined,
        message: context || undefined,
        propertyId: null,
      });

      setLeadSubmitted(true);
      setLeadForm({ fullName: '', phone: '', email: '', corridor: 'Any corridor', budget: 'Any budget', message: '' });
    } catch (err: any) {
      console.error(err);
      setLeadError('Something went wrong submitting your details. Please try again, or call us directly.');
    } finally {
      setLeadSubmitting(false);
    }
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
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
            <div className="project-grid" style={{ marginTop: '24px' }}>
              {filteredProjects.map((item: Project) => {
                const cardImage = item.imagesUrl?.[0] || '/placeholder.svg';
                const extraPhotos = (item.imagesUrl?.length || 0) - 1;

                return (
                  <div className="pcard" key={item.id}>
                    <Link href={`/projects/${item.slug}`} className="pcard-img" aria-label={`View details for ${item.title}`}>
                      {/* 1. FEATURED IMAGE */}
                      <img src={item.featured_image || cardImage} alt={item.title} loading="lazy" />
                      {extraPhotos > 0 && (
                        <span className="img-count">
                          <span className="img-count-icon">{ICONS.camera}</span>
                          +{extraPhotos}
                        </span>
                      )}
                    </Link>
                
                    <div className="pcard-body">
                      <div className="pcard-top">
                        {/* 2. LOCALITY */}
                        <span className="loc">
                          <span className="loc-icon">{ICONS.pin}</span>
                          {item.locality || item.city}
                        </span>
                        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {item.property_type && <span className="status ready">{item.property_type}</span>}
                          {/* RERA VERIFIED OR CONSTRUCTION STATUS */}
                          <span className="status">
                            {item.rera_id ? 'MahaRERA Verified' : (item.construction_status?.replace(/_/g, ' ') || 'New Launch')}
                          </span>
                        </span>
                      </div>
                
                      <Link href={`/projects/${item.slug}`} className="pcard-title-link">
                        <h3>{item.title}</h3>
                      </Link>
                
                      {/* 3. POSSESSION DATE */}
                      {item.possession_date && (
                        <div className="possession-date" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Possession: <strong>{new Date(item.possession_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</strong>
                        </div>
                      )}
                
                      <div className="divider" />
                
                      <div className="meta">
                        {/* 4. PRICING */}
                        <div className="price">
                          {formatPrice(item.min_price, item.max_price)}
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

      <section className="testimonial-section" style={{ background: 'var(--stone-2)' }}>
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Recent buyers</p>
            <h2>What it&apos;s actually like to buy this way</h2>
          </div>
          <div className="testimonial-grid reveal">
            {TESTIMONIALS.map((t) => (
              <div className="tcard" key={t.name}>
                <span className="tcard-quote-icon">{ICONS.quote}</span>
                <p className="tcard-text">{t.quote}</p>
                <div className="tcard-foot">
                  <span className="tcard-name">{t.name}</span>
                  <span className="tcard-detail">{t.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="guides">
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

      <section className="faq-section" style={{ background: 'var(--stone-2)' }}>
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Questions</p>
            <h2>Frequently asked</h2>
          </div>
          <div className="faq-list reveal">
            {FAQS.map((item, i) => (
              <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={item.q}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <span className="faq-toggle">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="lead" className="lead-section">
        <div className="wrap lead-wrap">
          <div className="lead-copy reveal">
            <p className="eyebrow" style={{ color: 'var(--gold)' }}>Get matched, free</p>
            <h2 style={{ color: 'var(--stone)' }}>Talk to someone who isn&apos;t on commission from a single builder.</h2>
            <p style={{ color: '#d9d2c2' }}>Tell us your corridor, budget and timeline — we&apos;ll shortlist three projects worth an actual site visit, and connect you directly with the developer sales teams. No spam, no repeat cold calls.</p>
            <ul className="lead-points">
              <li><span className="lead-point-icon">{ICONS.check}</span>Personalised shortlist within 24 hours</li>
              <li><span className="lead-point-icon">{ICONS.check}</span>MahaRERA status checked on every suggestion</li>
              <li><span className="lead-point-icon">{ICONS.check}</span>Zero brokerage fee to you</li>
            </ul>
          </div>

          <div className="lead-form-card reveal">
            {leadSubmitted ? (
              <div className="lead-success">
                <span className="lead-success-icon">{ICONS.check}</span>
                <h3>Thanks — we&apos;ve got it.</h3>
                <p>A member of the team will reach out within 24 hours with your shortlist.</p>
                <button type="button" className="btn" onClick={() => setLeadSubmitted(false)}>Submit another enquiry</button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="lead-form">
                <div className="lead-form-row">
                  <label>
                    Full name *
                    <input name="fullName" required value={leadForm.fullName} onChange={handleLeadChange} placeholder="Your name" />
                  </label>
                  <label>
                    Phone number *
                    <input name="phone" required type="tel" value={leadForm.phone} onChange={handleLeadChange} placeholder="+91 98xxxxxxxx" />
                  </label>
                </div>
                <label>
                  Email
                  <input name="email" type="email" value={leadForm.email} onChange={handleLeadChange} placeholder="you@email.com" />
                </label>
                <div className="lead-form-row">
                  <label>
                    Preferred corridor
                    <select name="corridor" value={leadForm.corridor} onChange={handleLeadChange}>
                      <option>Any corridor</option>
                      {CORRIDORS.map((c) => <option key={c.node} value={c.title}>{c.title}</option>)}
                    </select>
                  </label>
                  <label>
                    Budget
                    <select name="budget" value={leadForm.budget} onChange={handleLeadChange}>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>
                </div>
                <label>
                  Anything else we should know?
                  <textarea name="message" rows={3} value={leadForm.message} onChange={handleLeadChange} placeholder="Timeline, must-have amenities, family size…" />
                </label>

                {leadError && <p className="lead-error">{leadError}</p>}

                <button type="submit" disabled={leadSubmitting} className="btn btn-solid lead-submit">
                  {leadSubmitting ? 'Submitting…' : 'Get my shortlist →'}
                </button>
                <p className="lead-disclaimer">By submitting, you agree to be contacted about matching projects. We don&apos;t sell your data.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
