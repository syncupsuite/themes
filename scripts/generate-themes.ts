/**
 * Generate static theme assets (tokens.json, tokens.css, tailwind.css, meta.json)
 * and auto-generate barrel files for themes + foundations.
 *
 * Phase 1 of ADR-007: file-system discovery.
 * Adding a new theme = drop a JSON in packages/foundations/data/, run pnpm generate.
 * Touch points reduced from 6 to 1.
 *
 * Run: pnpm generate (from root) or tsx scripts/generate-themes.ts
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { buildFoundation } from '@syncupsuite/foundations';
import type { FoundationData } from '@syncupsuite/foundations';
import { transformToTailwindV4, transformToCSS } from '@syncupsuite/transformers';
import { validateSchema, validateCompleteness, validateThemeContrast, PERF_BUDGETS } from '@syncupsuite/tokens';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'packages', 'foundations', 'data');
const THEMES_SRC = join(ROOT, 'packages', 'themes', 'src');
const FOUNDATIONS_SRC = join(ROOT, 'packages', 'foundations', 'src');

// Convert 'nihon-traditional' → 'nihonTraditional'
function toCamelCase(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// Validate required fields before passing to buildFoundation
function validateFoundationData(data: unknown, filename: string): asserts data is FoundationData {
  if (!data || typeof data !== 'object') {
    throw new Error(`${filename}: must be a JSON object`);
  }
  const d = data as Record<string, unknown>;
  for (const key of ['$name', '$description', '$extensions', 'seedColors']) {
    if (!(key in d)) {
      throw new Error(`${filename}: missing required field "${key}"`);
    }
  }
  if (!Array.isArray(d.seedColors) || (d.seedColors as unknown[]).length === 0) {
    throw new Error(`${filename}: "seedColors" must be a non-empty array`);
  }
  const ext = d.$extensions as Record<string, unknown>;
  if (!ext?.['syncupsuite.foundation']) {
    throw new Error(`${filename}: missing $extensions['syncupsuite.foundation']`);
  }
}

// Discover all foundation JSON files — stable sort for deterministic output
const foundationFiles = readdirSync(DATA_DIR).filter((f) => f.endsWith('.json')).sort();

let hasErrors = false;
const discovered: { slug: string; camel: string }[] = [];

for (const file of foundationFiles) {
  const slug = basename(file, '.json'); // e.g. 'nihon-traditional'
  const camel = toCamelCase(slug); // e.g. 'nihonTraditional'
  discovered.push({ slug, camel });

  console.log(`\nGenerating: ${slug}`);

  // Load and validate foundation data
  let data: FoundationData;
  try {
    const raw = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8')) as unknown;
    validateFoundationData(raw, file);
    data = raw;
  } catch (err) {
    console.error(`  INVALID: ${(err as Error).message}`);
    hasErrors = true;
    continue;
  }

  // Build token tree
  const { tokens, meta } = buildFoundation(data);

  // Validate
  const schemaResult = validateSchema(tokens as Record<string, unknown>);
  const completenessResult = validateCompleteness(tokens as Record<string, unknown>);
  const contrastResult = validateThemeContrast(tokens as Record<string, unknown>);

  meta.validation = {
    schema: schemaResult.valid,
    contrast: contrastResult.passes,
    completeness: completenessResult.valid,
  };

  if (!schemaResult.valid) {
    console.error(`  Schema errors:`, schemaResult.errors);
    hasErrors = true;
  }
  if (!completenessResult.valid) {
    console.error(`  Completeness errors:`, completenessResult.errors);
    hasErrors = true;
  }
  if (!contrastResult.passes) {
    console.error(`  Contrast failures (${contrastResult.failures.length}):`);
    for (const f of contrastResult.failures) {
      console.error(`    ${f.label}: ${f.fgHex} on ${f.bgHex} = ${f.ratio}:1 (need ${f.required}:1)`);
    }
    // Contrast failures are warnings, not blockers — themes still generate but meta shows false
  }

  // Generate CSS outputs
  const css = transformToCSS(tokens);
  const tailwindCss = transformToTailwindV4(tokens);

  // Enforce performance budgets
  const cssGzipped = gzipSync(Buffer.from(css)).length;
  const propertyCount = (css.match(/^\s*--[\w-]+:/gm) ?? []).length;
  if (cssGzipped > PERF_BUDGETS.maxCssGzipped) {
    console.error(`  BUDGET: tokens.css gzipped ${cssGzipped}B > ${PERF_BUDGETS.maxCssGzipped}B`);
    hasErrors = true;
  }
  if (propertyCount > PERF_BUDGETS.maxProperties) {
    console.error(`  BUDGET: ${propertyCount} properties > ${PERF_BUDGETS.maxProperties}`);
    hasErrors = true;
  }

  // Write static theme assets
  const outDir = join(THEMES_SRC, slug);
  mkdirSync(outDir, { recursive: true });

  writeFileSync(join(outDir, 'tokens.json'), JSON.stringify(tokens, null, 2));
  writeFileSync(join(outDir, 'tokens.css'), css);
  writeFileSync(join(outDir, 'tailwind.css'), tailwindCss);
  writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2));

  // Write embedded CSS module for programmatic access (avoids runtime computation)
  const escapedCss = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const escapedTailwind = tailwindCss
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
  writeFileSync(
    join(outDir, '_css.ts'),
    `// Auto-generated by scripts/generate-themes.ts — do not edit\nexport const css = \`${escapedCss}\`;\nexport const tailwindCss = \`${escapedTailwind}\`;\n`,
  );

  // Write theme index.ts (was touch point 5 — now generated)
  writeFileSync(
    join(outDir, 'index.ts'),
    [
      `// Auto-generated by scripts/generate-themes.ts — do not edit`,
      `import type { BuiltTheme } from '@syncupsuite/tokens';`,
      `import tokens from './tokens.json';`,
      `import meta from './meta.json';`,
      `import { css, tailwindCss } from './_css';`,
      ``,
      `export const ${camel}: BuiltTheme = {`,
      `  tokens: tokens as BuiltTheme['tokens'],`,
      `  css,`,
      `  tailwindCss,`,
      `  meta: meta as BuiltTheme['meta'],`,
      `};`,
      ``,
    ].join('\n'),
  );

  console.log(`  tokens.json: ${JSON.stringify(tokens).length} bytes`);
  console.log(`  tokens.css: ${css.length} bytes raw, ${cssGzipped}B gzipped (budget: ${PERF_BUDGETS.maxCssGzipped}B)`);
  console.log(`  tailwind.css: ${tailwindCss.length} bytes`);
  console.log(`  properties: ${propertyCount} (budget: ${PERF_BUDGETS.maxProperties})`);
  console.log(`  schema: ${schemaResult.valid ? 'PASS' : 'FAIL'}`);
  console.log(`  contrast: ${contrastResult.passes ? 'PASS' : 'FAIL'} (${contrastResult.pairs.length} pairs, ${contrastResult.failures.length} failures)`);
  console.log(`  completeness: ${completenessResult.valid ? 'PASS' : 'FAIL'}`);
}

if (hasErrors) {
  console.error('\nGeneration completed with validation errors. Barrel files not written.');
  process.exit(1);
}

// Only write barrel files if all foundations built successfully
// (prevents a partial failure from producing an inconsistent index)

// packages/themes/src/index.ts (was touch point 6 — now generated)
writeFileSync(
  join(THEMES_SRC, 'index.ts'),
  [
    `// Auto-generated by scripts/generate-themes.ts — do not edit`,
    ...discovered.map(({ slug, camel }) => `export { ${camel} } from './${slug}/index';`),
    ``,
  ].join('\n'),
);

// packages/foundations/src/data.ts (was touch point 2 — now generated)
writeFileSync(
  join(FOUNDATIONS_SRC, 'data.ts'),
  [
    `// Auto-generated by scripts/generate-themes.ts — do not edit`,
    `import type { FoundationData } from './engine';`,
    ``,
    ...discovered.map(({ slug, camel }) => `import ${camel}Data_ from '../data/${slug}.json';`),
    ``,
    ...discovered.map(({ camel }) => `export const ${camel}Data = ${camel}Data_ as unknown as FoundationData;`),
    ``,
    `/** All registered foundations — used by the generator and theme browser (Phase 2/3) */`,
    `export const ALL_FOUNDATIONS: FoundationData[] = [${discovered.map(({ camel }) => `${camel}Data`).join(', ')}];`,
    ``,
  ].join('\n'),
);

console.log(`\nGenerated barrel files for ${discovered.length} foundation(s): ${discovered.map((d) => d.slug).join(', ')}`);
console.log('Done.');
