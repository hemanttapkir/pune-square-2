'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Projects', href: '/#projects' },
  { label: 'Corridors', href: '/#corridors' },
  { label: 'Price Snapshot', href: '/#markets' },
  { label: 'Guides', href: '/#guides' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={scrolled || !isHome ? 'is-scrolled' : ''}>
      <div className="wrap nav-inner">
        <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
          Pune<span>Square</span>
        </Link>

        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-actions">
          <Link href="/#lead" className="btn btn-solid nav-cta">
            Get a Shortlist
          </Link>
          <button
            type="button"
            className="nav-burger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
