import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { externalCardFeedSchema } from '@/lib/integrations/external-card-schema';
import { importExternalCards } from '@/lib/integrations/import-external-cards';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const body = await request.json();

    // Aceita dois formatos:
    // 1) { source: {...}, cards: [...] } formato novo e recomendado.
    // 2) { rows: [...] } compatibilidade com o MVP anterior.
    const payload = body.cards ? body : {
      source: { name: body.sourceName || 'Upload do usuário', kind: 'USER_UPLOAD', termsAccepted: true },
      cards: body.rows ?? []
    };

    const feed = externalCardFeedSchema.parse(payload);
    const result = await importExternalCards(feed.cards, {
      sourceName: feed.source?.name || 'Upload do usuário',
      sourceKind: feed.source?.kind || 'USER_UPLOAD',
      documentationUrl: feed.source?.documentationUrl || null,
      termsAccepted: feed.source?.termsAccepted ?? true
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: 'Falha na importação.', error: String(error) }, { status: 400 });
  }
}
