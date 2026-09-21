import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Pune Assets | Property investment advisors in Pune',
  description:
    'Pune Assets advises buyers and investors on Pune residential property: corridor selection, project shortlisting, MahaRERA checks and developer due diligence.',
};

const METRICS = [
  { value: '4', label: 'Growth corridors covered' },
  { value: '100%', label: 'MahaRERA status checked' },
  { value: '50+', label: 'Grade-A developers tracked' },
];

const SERVICES = [
  { title: 'Corridor and project shortlisting',
    body: 'We match your budget, timeline and goals to the right corridor and a short list of projects, instead of a long brochure dump.' },
  { title: 'Due diligence',
    body: 'Every project is checked against its MahaRERA registration, possession schedule and the developer’s delivery record before we recommend it.' },
  { title: 'Investment guidance',
    body: 'Honest advice on pricing, carpet vs built-up area, home loans and paperwork, for both self-use and investment purchases.' },
];

const STEPS = [
  { title: 'Understand your goal', body: 'A short conversation about budget, purpose and timeline.' },
  { title: 'Shortlist', body: 'Projects that fit, with real starting prices and price ranges.' },
  { title: 'Verify', body: 'MahaRERA status, developer history and possession dates.' },
  { title: 'Decide with confidence', body: 'Site visits and a clear comparison, so the decision is yours.' },
];

const AREAS = [
  { name: 'Hinjewadi – Wakad – Mahalunge', range: '₹75L – ₹8.0Cr' },
  { name: 'Kharadi – Wagholi – Mundhwa', range: '₹85L – ₹7.5Cr' },
  { name: 'Balewadi – Baner – Aundh', range: '₹1.0Cr – ₹3.9Cr' },
  { name: 'Kothrud – Bavdhan – Warje', range: '₹95L – ₹20Cr' },
  { name: 'PCMC – Mamurdi – Punawale', range: '₹52L – ₹3.2Cr' },
  { name: 'Koregaon Park – Kalyani Nagar – Viman Nagar', range: '₹99L – ₹45Cr' },
  { name: 'NIBM – Hadapsar – Manjari', range: '₹65L – ₹3.5Cr' },
];

const PRINCIPLES = [
  { title: 'Real prices, no bait',
    body: 'We share real starting prices and verified ranges, never artificially low quotes.' },
  { title: 'Verified first',
    body: 'We only recommend projects whose registration and schedules we have checked.' },
  { title: 'Track record matters',
    body: 'We look at delivery timelines and build quality of builders like Kolte-Patil, Godrej, VTP, VJ and Panchshil.' },
];

export default function AboutPage() {
  return (
    <>
      <main>
        <section className={`${styles.dark} ${styles.hero}`}>
          <div className="wrap">
            <span className="eyebrow">About Pune Assets</span>
            <h1>Property investment advisors for Pune.</h1>
            <p>
              We help buyers and investors choose the right corridor, the right project and the
              right developer, with clear pricing and verified details.
            </p>
            <div className={styles.heroActions}>
              <Link href="/#lead" className={`btn ${styles.btnLight}`}>Get a shortlist</Link>
              <Link href="/#projects" className={`btn ${styles.btnOutline}`}>Browse projects</Link>
            </div>
          </div>
        </section>

        <section className={`${styles.surface} ${styles.statsBorder}`}>
          <div className={`wrap ${styles.stats}`}>
            {METRICS.map((m) => (
              <div key={m.label}>
                <b>{m.value}</b>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className="wrap">
            <div className={styles.head}><h2>How we help</h2></div>
            <div className={styles.cols}>
              {SERVICES.map((s) => (
                <div key={s.title} className={styles.card}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className="wrap">
            <div className={styles.head}><h2>How it works</h2></div>
            <ol className={styles.steps}>
              {STEPS.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <div className="wrap">
            <div className={styles.head}>
              <h2>Where we advise</h2>
              <p>7 corridors across Pune, with the price ranges we currently see.</p>
            </div>
            <ul className={styles.areas}>
              {AREAS.map((a) => (
                <li key={a.name}>
                  <span>{a.name}</span>
                  <span>{a.range}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.surface}`}>
          <div className="wrap">
            <div className={styles.head}><h2>Our principles</h2></div>
            <div className={styles.cols}>
              {PRINCIPLES.map((p) => (
                <div key={p.title} className={styles.plain}>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="wrap">
            <div className={styles.head}><h2>Good to know</h2></div>
            <ul className={styles.notes}>
              <li>Price ranges are observed starting points and change often. Confirm final pricing with the developer.</li>
              <li>Property values can go down as well as up. Our advice is guidance, not a guarantee of returns.</li>
              <li>Always verify a project&apos;s registration on the official MahaRERA website before paying anything.</li>
            </ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark} ${styles.cta}`}>
          <div className="wrap">
            <h2>Talk to an advisor</h2>
            <p>Tell us your budget and goal. We will send a shortlist that fits.</p>
            <div className={styles.ctaRow}>
              <Link href="/#lead" className={`btn ${styles.btnLight}`}>Get a shortlist</Link>
              <Link href="/#projects" className={`btn ${styles.btnOutline}`}>Browse projects</Link>
            </div>
          </div>
        </section>
      </main>

    </>
  );
}