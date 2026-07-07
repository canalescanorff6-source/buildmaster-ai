import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from './lib/load-env';
import { csvToExternalCards } from '../src/lib/integrations/csv-to-external-card';
import { importExternalCards } from '../src/lib/integrations/import-external-cards';
import { prisma } from '../src/lib/prisma';

loadEnv();

async function main() {
  const fileArg = process.argv[2];
  const sourceName = process.argv[3] || 'Importação CSV local';

  if (!fileArg) {
    console.error('Uso: npm run import:cards:csv -- sample-data/cards-import-template.csv "Minha Base"');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  const csv = fs.readFileSync(filePath, 'utf8');
  const parsed = csvToExternalCards(csv);
  const result = await importExternalCards(parsed.rows, {
    sourceName,
    sourceKind: 'USER_UPLOAD',
    termsAccepted: true
  });

  console.log(JSON.stringify({ ...result, warnings: parsed.warnings }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
