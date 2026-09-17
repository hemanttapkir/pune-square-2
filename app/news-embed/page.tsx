// app/news-embed/page.tsx
export default async function NewsEmbedPage() {
    let articles = [];
  
    try {
      const res = await fetch("https://rss.app/feeds/v1.1/t072TXpNq6GYoIdz.json", { cache: "no-store" });
      const data = await res.json();
      articles = data.items || data.articles || [];
    } catch (err) {
      console.error(err);
    }
  
    return (
      <div style={{ padding: "16px", background: "#ffffff", fontFamily: "sans-serif" }}>
        {articles.length === 0 ? (
          <p>No news items found.</p>
        ) : (
          articles.map((item: any, idx: number) => (
            <article key={idx} style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "16px" }}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#111" }}>
                <h3 style={{ fontSize: "16px", margin: "0 0 6px 0" }}>{item.title}</h3>
              </a>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {item.authors?.[0]?.name ? `By ${item.authors[0].name}` : "Pune News"}
              </span>
            </article>
          ))
        )}
      </div>
    );
  }