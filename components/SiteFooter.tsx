import React from 'react';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="logo">
              Pune<span>Square</span>
            </div>
            <p className="about">
              An independent, informational guide to Pune&apos;s residential real estate —
              corridors, current launches, and the paperwork that matters. Not a brokerage.
            </p>
            <div className="foot-contact">
              <a href="tel:+912012345678">📞 +91 20 1234 5678</a>
              <a href="mailto:hello@punesquare.in">✉️ hello@punesquare.in</a>
            </div>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><Link href="/#corridors">Corridor map</Link></li>
              <li><Link href="/#projects">Featured projects</Link></li>
              <li><Link href="/#markets">Price snapshot</Link></li>
              <li><Link href="/#lead">Get a shortlist</Link></li>
            </ul>
          </div>
          <div>
            <h5>Corridors</h5>
            <ul>
              <li><Link href="/#corridors">Hinjewadi–Wakad–Baner</Link></li>
              <li><Link href="/#corridors">Kharadi–Magarpatta</Link></li>
              <li><Link href="/#corridors">Kothrud–NIBM</Link></li>
            </ul>
          </div>
          <div>
            <h5>Guides</h5>
            <ul>
              <li><Link href="/#guides">MahaRERA basics</Link></li>
              <li><Link href="/#guides">Carpet vs built-up area</Link></li>
              <li><Link href="/#guides">Home loan basics</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Pune Square. Informational content only — verify project and pricing details directly with the developer.</span>
          <span className="foot-bottom-right">
            <span>Pune, Maharashtra</span>
            <Link href="/admin" className="foot-admin-link">Admin</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
