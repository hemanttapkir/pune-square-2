import Parser from 'rss-parser';
import { NewsArticle } from '@/app/api/cron/fetch-news/route';

const parser = new Parser({
  timeout: 3000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
});

const RSS_FEEDS: string[] = [
  'https://news.google.com/rss/search?q=%22pune+real+estate%22+OR+%22pune+infrastructure%22+when:7d&hl=en-IN&gl=IN&ceid=IN:en',
  'https://news.google.com/rss/search?q=%22pune+builders%22+OR+%22maharera+pune%22+when:7d&hl=en-IN&gl=IN&ceid=IN:en',
];

export async function getLatestNews(limit = 6): Promise<NewsArticle[]> {
  try {
    const feedPromises = RSS_FEEDS.map((url) => parser.parseURL(url));
    const results = await Promise.allSettled(feedPromises);

    const allArticles: NewsArticle[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const item of result.value.items) {
          if (!item.title || !item.link) continue;

          const parts = item.title.split(' - ');
          const sourceName = parts.length > 1 ? parts.pop()! : 'News';
          const cleanTitle = parts.join(' - ');

          allArticles.push({
            title: cleanTitle,
            link: item.link,
            sourceName,
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            snippet: item.contentSnippet || item.content || '',
          });
        }
      }
    }

    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return allArticles.slice(0, limit);
  } catch (error) {
    console.error('Error fetching RSS news:', error);
    return [];
  }
}