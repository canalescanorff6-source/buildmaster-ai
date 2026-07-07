import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { csvToExternalCards } from '@/lib/integrations/csv-to-external-card';
import { importExternalCards } from '@/lib/integrations/import-external-cards';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  try {
    const contentType = request.headers.get('content-type') ?? '';
    let csv = '';
    let sourceName = 'Upload CSV do usuário';

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      sourceName = String(form.get('sourceName') || sourceName);
      if (!(file instanceof File)) return NextResponse.json({ message: 'Arquivo CSV não enviado.' }, { status: 400 });
      csv = await file.text();
    } else {
      const body = await request.json();
      csv = String(body.csv ?? '');
      sourceName = String(body.sourceName || sourceName);
    }

    const parsed = csvToExternalCards(csv);
    const result = await importExternalCards(parsed.rows, {
      sourceName,
      sourceKind: 'USER_UPLOAD',
      termsAccepted: true
    });

    return NextResponse.json({ ...result, warnings: parsed.warnings });
  } catch (error) {
    return NextResponse.json({ message: 'Falha na importação CSV.', error: String(error) }, { status: 400 });
  }
}
