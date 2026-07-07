import { NextResponse } from 'next/server';
import { externalCardFeedSchema } from '@/lib/integrations/external-card-schema';
import { importExternalCards } from '@/lib/integrations/import-external-cards';

async function readFeedFromUrl(url: string, token?: string) {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Fonte retornou HTTP ${response.status}`);
  return response.json();
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;
  if (!expected || authHeader !== expected) {
    return NextResponse.json({ message: 'Cron não autorizado.' }, { status: 401 });
  }

  try {
    const feedUrl = process.env.AUTHORIZED_CARDS_FEED_URL;
    if (!feedUrl) {
      return NextResponse.json({ message: 'Configure AUTHORIZED_CARDS_FEED_URL no .env.' }, { status: 400 });
    }

    const payload = await readFeedFromUrl(feedUrl, process.env.AUTHORIZED_CARDS_FEED_TOKEN);
    const feed = externalCardFeedSchema.parse(payload);
    if (feed.source && !feed.source.termsAccepted) {
      return NextResponse.json({ message: 'Fonte sem confirmação de termos/licença.' }, { status: 400 });
    }

    const result = await importExternalCards(feed.cards, {
      sourceName: feed.source?.name || process.env.SYNC_SOURCE_NAME || 'Fonte autorizada automática',
      sourceKind: feed.source?.kind || 'AUTHORIZED_JSON_FEED',
      sourceBaseUrl: feedUrl,
      documentationUrl: feed.source?.documentationUrl || null,
      termsAccepted: feed.source?.termsAccepted ?? true
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: 'Falha no cron de cartas.', error: String(error) }, { status: 400 });
  }
}
