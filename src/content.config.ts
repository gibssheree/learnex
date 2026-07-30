import { defineCollection, z } from 'astro:content';
import { vaultLoader } from './loaders/vaultLoader';

const noteSchema = z.object({
  title: z.string(),
  domain: z.string(),
  domainSlug: z.string(),
  slug: z.string(),
  isMoc: z.boolean(),
  summary: z.string().optional(),
  links: z.array(z.string()),
  category: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()),
});

const languages = defineCollection({
  loader: vaultLoader({ collection: 'languages' }),
  schema: noteSchema,
});

const terms = defineCollection({
  loader: vaultLoader({ collection: 'terms' }),
  schema: noteSchema,
});

export const collections = { languages, terms };
