'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      <div className="wrap">
        <div className="nav-inner">
       {/* Logo */}
<Link href="/" className="logo" onClick={closeMenu}>
  Pune <span className="gold-text">Assets</span>
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
                <Link href="#projects" onClick={closeMenu}>
                  Projects
                </Link>
              </li>
              <li>
                <Link href="#developers" onClick={closeMenu}>
                  Developers
                </Link>
              </li>
              <li>
                <Link href="#news" onClick={closeMenu}>
                  Markets News
                </Link>
              </li>
              <li>
                <Link href="/about" onClick={closeMenu}>
                 About us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}