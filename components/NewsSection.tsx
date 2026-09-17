// components/NewsSection.tsx
"use client";

import { useEffect, useState } from "react";
import NewsCarousel, { RssItem } from "./NewsCarousel";

export default function NewsSection() {
  const [items, setItems] = useState<RssItem[]>([]);

  useEffect(() => {
    const feedUrl = encodeURIComponent("https://news.google.com/rss/search?q=pune+real+estate");
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frss.app%2Ffeeds%2FFibB05Aem8jBEp6k.xml`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") setItems(data.items || []);
      })
      .catch((err) => console.error(err));
  }, []);

  return <NewsCarousel items={items} />;
}