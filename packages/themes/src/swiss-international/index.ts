import type { BuiltTheme } from '@syncupsuite/tokens';
import tokens from './tokens.json';
import meta from './meta.json';
import { css, tailwindCss } from './_css';

export const swissInternational: BuiltTheme = {
  tokens: tokens as BuiltTheme['tokens'],
  css,
  tailwindCss,
  meta: meta as BuiltTheme['meta'],
};
