import { buildFoundation, swissInternationalData } from '@syncupsuite/foundations';
import { transformToTailwindV4, transformToCSS } from '@syncupsuite/transformers';
import type { DTCGRoot, FoundationMeta } from '@syncupsuite/tokens';

const { tokens, meta } = buildFoundation(swissInternationalData);

export const swissInternational: {
  tokens: DTCGRoot;
  css: string;
  tailwindCss: string;
  meta: FoundationMeta;
} = {
  tokens,
  css: transformToCSS(tokens),
  tailwindCss: transformToTailwindV4(tokens),
  meta,
};
