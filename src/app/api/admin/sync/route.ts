import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { externalCardFeedSchema } from '@/lib/integrations/external-card-schema';
import { importExternalCards } from '@/lib/integrations/import-external-cards';


export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Apenas administradores podem ver fontes.' }, { status: 403 });
  }

  const [sources, jobs] = await Promise.all([
    prisma.dataSource.findMany({ orderBy: { updatedAt: 'desc' }, take: 10 }),
    prisma.syncJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { source: { select: { name: true } } }
    })
  ]);

  return NextResponse.json({ sources, jobs });
}

async function readFeedFromUrl(url: string, token?: string) {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`Fonte retornou HTTP ${response.status}`);
  }
  return response.json();
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Apenas administradores podem sincronizar fontes.' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const feedUrl = body.feedUrl || process.env.AUTHORIZED_CARDS_FEED_URL;
    const token = body.token || process.env.AUTHORIZED_CARDS_FEED_TOKEN;
    const inlineFeed = body.feed;

    if (!feedUrl && !inlineFeed) {
      return NextResponse.json({
        message: 'Informe feedUrl ou configure AUTHORIZED_CARDS_FEED_URL no .env. A fonte precisa ser autorizada/licenciada.'
      }, { status: 400 });
    }

    const payload = inlineFeed ?? await readFeedFromUrl(feedUrl, token);
    const feed = externalCardFeedSchema.parse(payload);

    if (feed.source && !feed.source.termsAccepted) {
      return NextResponse.json({
        message: 'A fonte informou termsAccepted=false. Confirme permissão de uso/licença antes de importar.'
      }, { status: 400 });
    }

    const result = await importExternalCards(feed.cards, {
      sourceName: feed.source?.name || body.sourceName || process.env.SYNC_SOURCE_NAME || 'Fonte autorizada',
      sourceKind: feed.source?.kind || 'AUTHORIZED_JSON_FEED',
      sourceBaseUrl: feedUrl || null,
      documentationUrl: feed.source?.documentationUrl || null,
      termsAccepted: feed.source?.termsAccepted ?? true
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: 'Falha na sincronização.', error: String(error) }, { status: 400 });
  }
}
