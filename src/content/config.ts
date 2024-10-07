import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection(
  {
    type: 'content',
    schema: z.object(
      {
        title: z.string(),
        tags: z.array(z.string()).optional(),
        date: z.date(),
      }
    )
  }
);

export const collections = {
  'blog': blogCollection,
}