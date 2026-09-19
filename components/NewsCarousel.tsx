"use client";

import { useRef } from "react";

export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  author?: string;
  thumbnail?: string;
  enclosure?: { link?: string };
  description?: string;
}

export default function NewsCarousel({ items }: { items: RssItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Helper to extract image thumbnail if available
  const getThumbnail = (item: RssItem) => {
    if (item.thumbnail && item.thumbnail.startsWith("http")) return item.thumbnail;
    if (item.enclosure?.link) return item.enclosure.link;
    const match = item.description?.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  if (!items || items.length === 0) return null;

  return (
    
    <section id="news" style={{ padding: "60px 0", borderBottom: "1px solid var(--line-light)" }}>
  <div className="wrap">
        {/* Header and Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <span className="eyebrow">Market Intelligence</span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)" }}>Latest Pune Real Estate News</h2>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => scroll("left")}
              className="btn"
              style={{ width: "44px", height: "44px", padding: 0, borderRadius: "50%" }}
              aria-label="Previous"
            >
              ←
            </button>
            <button
              onClick={() => scroll("right")}
              className="btn"
              style={{ width: "44px", height: "44px", padding: 0, borderRadius: "50%" }}
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "24px",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            paddingBottom: "16px",
          }}
        >
          {items.map((item, idx) => {
            const image = getThumbnail(item);
            return (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="pcard"
                style={{
                  flex: "0 0 min(360px, 80vw)",
                  scrollSnapAlign: "start",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {image && (
                  <div className="pcard-img">
                    <img src={image} alt={item.title} />
                  </div>
                )}

                <div
                  className="pcard-body"
                  style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <span className="eyebrow" style={{ fontSize: "10px", marginBottom: "8px" }}>
                      {item.pubDate
                        ? new Date(item.pubDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Market News"}
                    </span>
                    <h3 style={{ fontSize: "20px", lineHeight: "1.3" }}>{item.title}</h3>
                  </div>

                  <div>
                    <div className="divider" />
                    <div className="meta">
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {item.author || "Pune Real Estate Feed"}
                      </span>
                      <span className="btn" style={{ padding: "8px 14px", fontSize: "10px" }}>
                        Read →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}