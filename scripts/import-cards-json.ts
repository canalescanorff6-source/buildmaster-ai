import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from './lib/load-env';
import { externalCardFeedSchema } from '../src/lib/integrations/external-card-schema';
import { importExternalCards } from '../src/lib/integrations/import-external-cards';
import { prisma } from '../src/lib/prisma';

loadEnv();

async function main() {
  const fileArg = process.argv[2];

  if (!fileArg) {
    console.error('Uso: npm run import:cards:json -- sample-data/cards-import-template.json');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const feed = externalCardFeedSchema.parse(payload);
  const result = await importExternalCards(feed.cards, {
    sourceName: feed.source?.name || 'Importação JSON local',
    sourceKind: feed.source?.kind || 'USER_UPLOAD',
    documentationUrl: feed.source?.documentationUrl || null,
    termsAccepted: feed.source?.termsAccepted ?? true
  });

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
