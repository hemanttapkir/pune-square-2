import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Define shape for the parsed article
export interface NewsArticle {
  title: string;
  link: string;
  sourceName: string;
  pubDate: Date;
  snippet: string;
}

const parser = new Parser();

const RSS_FEEDS: string[] = [
  'https://news.google.com/rss/search?q=%22pune+real+estate%22+OR+%22pune+infrastructure%22+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
  'https://news.google.com/rss/search?q=%22pune+builders%22+OR+%22maharera+pune%22+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
];

export async function GET(request: NextRequest) {
  // 1. Verify Vercel Cron authorization secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const allArticles: NewsArticle[] = [];

    // 2. Fetch and parse feeds
    for (const feedUrl of RSS_FEEDS) {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        if (!item.title || !item.link) continue;

        // Clean publisher name (Google News titles format as "Title - Publisher")
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

    // 3. Save to Database (e.g., Supabase, MongoDB, or Prisma)
    // await connectToDB();
    // for (const article of allArticles) {
    //   await NewsModel.updateOne(
    //     { link: article.link },
    //     { $setOnInsert: article },
    //     { upsert: true }
    //   );
    // }

    return NextResponse.json({
      success: true,
      count: allArticles.length,
      articles: allArticles.slice(0, 5),
    });
  } catch (error: unknown) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}