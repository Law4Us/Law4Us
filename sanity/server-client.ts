import 'server-only';
import { createClient } from 'next-sanity';
import { sanityConfig } from './env';

export const serverClient = createClient({
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
