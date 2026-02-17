import { buildFoundation, nihonTraditionalData } from '@syncupsuite/foundations';
import { transformToTailwindV4, transformToCSS } from '@syncupsuite/transformers';
import type { DTCGRoot, FoundationMeta } from '@syncupsuite/tokens';

const { tokens, meta } = buildFoundation(nihonTraditionalData);

export const nihonTraditional: {
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
