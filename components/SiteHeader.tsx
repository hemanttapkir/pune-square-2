'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Home page: glass pill floating over the hero. Other pages: solid white bar.
  const isHome = pathname === '/';

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`site-header ${isHome ? 'site-header--overlay' : ''}`}>
      <div className="wrap">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="logo" onClick={closeMenu}>
            Pune <span className="gold-text">RERA</span>
          </Link>

          {/* Hamburger Toggle Button */}
          <button
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle Navigation"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
          </button>

          {/* Header Navigation */}
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul>
              <li>
                <Link href="/#projects" onClick={closeMenu}>Projects</Link>
              </li>
              <li>
                <Link href="/#developers" onClick={closeMenu}>Developers</Link>
              </li>
              <li>
                <Link href="/#news" onClick={closeMenu}>Markets News</Link>
              </li>
              <li>
                <Link href="/about" onClick={closeMenu}>About us</Link>
              </li>
              {/* Optional pill button on the far right (like "Register" in the reference):
              <li className="push">
                <Link href="/#contact" className="nav-cta" onClick={closeMenu}>Get in touch</Link>
              </li>
              */}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}