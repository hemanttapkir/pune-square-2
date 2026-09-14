import { getLatestNews } from '@/lib/getNews';

export default async function NewsSection() {
  const newsItems = await getLatestNews(6);

  if (!newsItems || newsItems.length === 0) return null;

  return (
    <section className="news-section">
      <div className="news-container">
        <div className="news-header">
          <p className="news-eyebrow">Market Updates</p>
          <h2 className="news-title">Latest Pune Real Estate & Developer News</h2>
        </div>

        <div className="news-grid">
          {newsItems.map((article, idx) => (
            <article key={idx} className="news-card">
              <div>
                <div className="news-meta">
                  <span className="news-source">{article.sourceName}</span>
                  <span>
                    {new Date(article.pubDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <h3 className="news-card-title">{article.title}</h3>
              </div>

              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-link"
              >
                Read Source Article →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}