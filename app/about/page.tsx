'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CorridorDetail {
  node: string;
  tag: string;
  title: string;
  localities: string[];
  keyDrivers: string;
  priceSpread: string;
  color: string;
  x: number;
  y: number;
}

const CORRIDORS: CorridorDetail[] = [
  {
    node: '01',
    tag: 'West IT Corridor',
    title: 'Hinjewadi – Wakad – Mahalunge',
    localities: ['Hinjewadi Phase 1-3', 'Wakad', 'Mahalunge', 'Sus', 'Tathawade'],
    keyDrivers: 'Rajiv Gandhi Infotech Park, Metro Line 3, High-density township launches',
    priceSpread: '₹75L – ₹8.0Cr',
    color: '#3B82F6',
    x: 180,
    y: 190,
  },
  {
    node: '02',
    tag: 'East IT Corridor',
    title: 'Kharadi – Wagholi – Mundhwa',
    localities: ['Kharadi', 'Wagholi', 'Mundhwa', 'Keshav Nagar'],
    keyDrivers: 'EON Free Zone, World Trade Center, Rapidly expanding IT workforce',
    priceSpread: '₹85L – ₹7.5Cr',
    color: '#10B981',
    x: 520,
    y: 220,
  },
  {
    node: '03',
    tag: 'Premium Riverside',
    title: 'Balewadi – Baner – Aundh',
    localities: ['Balewadi High Street', 'Baner', 'Aundh', 'Pimple Nilakh'],
    keyDrivers: 'Commercial high-streets, Mula-Mutha proximity, Upper-mid lifestyle',
    priceSpread: '₹1.0Cr – ₹3.9Cr',
    color: '#F59E0B',
    x: 280,
    y: 230,
  },
  {
    node: '04',
    tag: 'West / Central Legacy',
    title: 'Kothrud – Bavdhan – Warje',
    localities: ['Kothrud', 'Bavdhan', 'Warje', 'Paud Road', 'Karve Nagar'],
    keyDrivers: 'Established educational hubs, metro connectivity, redevelopment boost',
    priceSpread: '₹95L – ₹20Cr',
    color: '#EC4899',
    x: 270,
    y: 330,
  },
  {
    node: '05',
    tag: 'North Industrial & PCMC',
    title: 'PCMC – Mamurdi – Punawale',
    localities: ['Mamurdi', 'Punawale', 'Charholi', 'Ravet', 'Chakan Belt'],
    keyDrivers: 'Automotive & industrial hub, Express Highway entry, entry-level value',
    priceSpread: '₹52L – ₹3.2Cr',
    color: '#8B5CF6',
    x: 310,
    y: 100,
  },
  {
    node: '06',
    tag: 'East Ultra-Luxury Belt',
    title: 'Koregaon Park – Kalyani Nagar – Viman Nagar',
    localities: ['Koregaon Park', 'Kalyani Nagar', 'Viman Nagar', 'Boat Club Road'],
    keyDrivers: 'Historic high-end residential, proximity to Airport & top hospitality',
    priceSpread: '₹99L – ₹45Cr',
    color: '#EF4444',
    x: 450,
    y: 290,
  },
  {
    node: '07',
    tag: 'South Expansion',
    title: 'NIBM – Hadapsar – Manjari',
    localities: ['NIBM Road', 'Hadapsar', 'Manjari', 'Kondhwa', 'Katraj'],
    keyDrivers: 'Magarpatta SEZ proximity, green hillside pockets, balanced mid-segment',
    priceSpread: '₹65L – ₹3.5Cr',
    color: '#06B6D4',
    x: 460,
    y: 380,
  },
];

const METRICS = [
  { value: '7', label: 'Primary Growth Corridors Mapped' },
  { value: '100%', label: 'MahaRERA Status Transparency' },
  { value: '50+', label: 'Grade-A Pune Developers Tracked' },
  { value: '0', label: 'Brokerage Layer Added' },
];

export default function AboutPage() {
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorDetail>(CORRIDORS[0]);

  return (
    <div style={{ background: 'var(--bg-light)', color: 'var(--ink, #111827)' }}>
      {/* Hero Header */}
      <section style={{ padding: '80px 0 60px', borderBottom: '1px solid var(--line-light, #e5e7eb)' }}>
        <div className="wrap">
          <span className="eyebrow">About PuneSquare</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, margin: '16px 0' }}>
            Unfiltered data across <br />
            <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Pune&apos;s growth corridors.</em>
          </h1>
          <p className="lede-light" style={{ maxWidth: '720px', fontSize: '18px', color: 'var(--ink-soft, #4b5563)' }}>
            PuneSquare was built to replace high-pressure sales calls and opaque marketing with structured geography, direct inventory mapping, and clear pricing across Pune.
          </p>
        </div>
      </section>

      {/* Stats Counter */}
      <section style={{ padding: '40px 0', background: 'var(--bg-surface, #ffffff)', borderBottom: '1px solid var(--line-light, #e5e7eb)' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {METRICS.map((m, idx) => (
            <div key={idx} style={{ padding: '16px' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-dark, #111827)' }}>{m.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-soft, #6b7280)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Pune Corridor Map Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Geographic Framework</span>
            <h2>Pune Divided by 7 Economic Corridors</h2>
            <p className="section-sub">
              Rather than searching by arbitrary locality labels, we divide Pune into 7 structural corridors defined by employment hubs, transit infrastructure, and price brackets.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', marginTop: '40px', alignItems: 'start' }}>
            {/* Interactive SVG Schematic Map */}
            <div
              style={{
                background: '#0F172A',
                borderRadius: '12px',
                padding: '24px',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8' }}>
                  Schematic Map of Pune Metro Area
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Click a corridor node to inspect</span>
              </div>

              <svg viewBox="0 0 700 500" style={{ width: '100%', height: 'auto', display: 'block' }}>
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="700" height="500" fill="url(#grid)" />

                {/* River Schematic (Mula-Mutha) */}
                <path
                  d="M 100 120 Q 250 180 320 250 T 550 280 T 680 260"
                  fill="none"
                  stroke="#1E3A8A"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <text x="560" y="250" fill="#3B82F6" fontSize="10" fontWeight="bold" opacity="0.7">
                  Mula-Mutha River
                </text>

                {/* Outer Ring Road Connection (Dotted) */}
                <ellipse cx="360" cy="250" rx="280" ry="190" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
                <text x="500" y="70" fill="#64748B" fontSize="10">
                  Proposed Ring Road
                </text>

                {/* Connections Lines */}
                {CORRIDORS.map((c) => (
                  <line key={`line-${c.node}`} x1="350" y1="260" x2={c.x} y2={c.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                ))}

                {/* Central Core Marker */}
                <circle cx="350" cy="260" r="10" fill="#475569" stroke="#94A3B8" strokeWidth="2" />
                <text x="350" y="264" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                  CORE
                </text>

                {/* Corridor Nodes */}
                {CORRIDORS.map((c) => {
                  const isSelected = selectedCorridor.node === c.node;
                  return (
                    <g
                      key={c.node}
                      onClick={() => setSelectedCorridor(c)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulse Ring if Selected */}
                      {isSelected && (
                        <circle cx={c.x} cy={c.y} r="26" fill="none" stroke={c.color} strokeWidth="2" opacity="0.6" />
                      )}
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={isSelected ? 18 : 14}
                        fill={c.color}
                        stroke="#0F172A"
                        strokeWidth="3"
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      <text
                        x={c.x}
                        y={c.y + 4}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {c.node}
                      </text>
                      <text
                        x={c.x}
                        y={c.y + 30}
                        fill={isSelected ? '#FFFFFF' : '#94A3B8'}
                        fontSize="11"
                        fontWeight={isSelected ? '700' : '500'}
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {c.tag}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Corridor Information Card */}
            <div
              style={{
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--line-light, #e5e7eb)',
                borderRadius: '12px',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span
                  style={{
                    background: selectedCorridor.color,
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '20px',
                  }}
                >
                  Node {selectedCorridor.node}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft, #6b7280)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {selectedCorridor.tag}
                </span>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>{selectedCorridor.title}</h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft, #6b7280)', marginBottom: '6px' }}>
                  Key Localities
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedCorridor.localities.map((loc) => (
                    <span
                      key={loc}
                      style={{
                        background: 'var(--bg-light, #f3f4f6)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft, #6b7280)', marginBottom: '4px' }}>
                  Primary Economic Drivers
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--ink, #374151)' }}>{selectedCorridor.keyDrivers}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft, #6b7280)', marginBottom: '4px' }}>
                  Observed Price Spread
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark, #111827)' }}>{selectedCorridor.priceSpread}</div>
              </div>

              <Link
                href={`/?corridor=${encodeURIComponent(selectedCorridor.title)}#projects`}
                className="btn btn-solid"
                style={{ width: '100%', textAlign: 'center', display: 'block', padding: '12px 0' }}
              >
                Browse Node {selectedCorridor.node} Projects →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section style={{ padding: '80px 0', background: 'var(--bg-surface, #ffffff)', borderTop: '1px solid var(--line-light, #e5e7eb)' }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Our Methodology</span>
            <h2>How We Evaluate Property Data</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '40px' }}>
            <div style={{ padding: '24px', border: '1px solid var(--line-light, #e5e7eb)', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>1. No Fake Price Traps</div>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft, #4b5563)', lineHeight: 1.6 }}>
                We list real starting prices and verified price spreads. We don&apos;t post artificially depressed quotes just to make your phone ring with broker spam.
              </p>
            </div>

            <div style={{ padding: '24px', border: '1px solid var(--line-light, #e5e7eb)', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>2. MahaRERA Verification</div>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft, #4b5563)', lineHeight: 1.6 }}>
                Every live launch on PuneSquare is mapped against its official MahaRERA registration number and official possession schedules.
              </p>
            </div>

            <div style={{ padding: '24px', border: '1px solid var(--line-light, #e5e7eb)', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>3. Developer Track Records</div>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft, #4b5563)', lineHeight: 1.6 }}>
                We track delivery timelines, construction quality, and project history across established builders in Pune like Kolte-Patil, Godrej, VTP, VJ, and Panchshil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section style={{ padding: '80px 0', textAlign: 'center', background: '#111827', color: '#fff' }}>
        <div className="wrap">
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Explore Pune&apos;s Live Inventory</h2>
          <p style={{ color: '#9CA3AF', maxWidth: '540px', margin: '0 auto 32px', fontSize: '16px' }}>
            Filter by corridors, developers, or configuration without dealing with aggressive sales calls.
          </p>
          <Link href="/" className="btn btn-solid" style={{ background: '#fff', color: '#111827', padding: '14px 32px', fontWeight: 600 }}>
            Go to Inventory Directory →
          </Link>
        </div>
      </section>
    </div>
  );
}