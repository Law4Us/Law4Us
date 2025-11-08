import { createClient } from 'next-sanity'
import { sanityConfig } from './env'

export const client = createClient(sanityConfig)
