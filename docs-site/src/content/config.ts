import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['getting-started', 'api', 'guides', 'architecture', 'deployment']),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  docs: docsCollection,
};
