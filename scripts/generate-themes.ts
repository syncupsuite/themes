/**
 * Generate static theme assets (tokens.json, tokens.css, tailwind.css, meta.json)
 *
 * Run: pnpm generate (from root) or tsx scripts/generate-themes.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFoundation } from '@syncupsuite/foundations';
import { nihonTraditionalData, swissInternationalData } from '@syncupsuite/foundations';
import { transformToTailwindV4, transformToCSS } from '@syncupsuite/transformers';
import { validateSchema, validateCompleteness } from '@syncupsuite/tokens';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themesDir = join(__dirname, '..', 'packages', 'themes', 'src');

const foundations = [
  { data: nihonTraditionalData, dir: 'nihon-traditional' },
  { data: swissInternationalData, dir: 'swiss-international' },
];

for (const { data, dir } of foundations) {
  console.log(`\nGenerating: ${dir}`);

  const { tokens, meta } = buildFoundation(data);

  // Validate
  const schemaResult = validateSchema(tokens as Record<string, unknown>);
  const completenessResult = validateCompleteness(tokens as Record<string, unknown>);

  meta.validation = {
    schema: schemaResult.valid,
    contrast: true, // TODO: full contrast audit
    completeness: completenessResult.valid,
  };

  if (!schemaResult.valid) {
    console.error(`  Schema errors:`, schemaResult.errors);
  }
  if (!completenessResult.valid) {
    console.error(`  Completeness errors:`, completenessResult.errors);
  }

  // Generate CSS outputs
  const css = transformToCSS(tokens);
  const tailwindCss = transformToTailwindV4(tokens);

  // Write files
  const outDir = join(themesDir, dir);
  mkdirSync(outDir, { recursive: true });

  writeFileSync(join(outDir, 'tokens.json'), JSON.stringify(tokens, null, 2));
  writeFileSync(join(outDir, 'tokens.css'), css);
  writeFileSync(join(outDir, 'tailwind.css'), tailwindCss);
  writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2));

  console.log(`  tokens.json: ${JSON.stringify(tokens).length} bytes`);
  console.log(`  tokens.css: ${css.length} bytes`);
  console.log(`  tailwind.css: ${tailwindCss.length} bytes`);
  console.log(`  schema: ${schemaResult.valid ? 'PASS' : 'FAIL'}`);
  console.log(`  completeness: ${completenessResult.valid ? 'PASS' : 'FAIL'}`);
}

console.log('\nDone.');
