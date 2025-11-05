import { z } from 'zod';

export const createGalleryZod = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100),
    image: z.string().optional(),
  }),
});

export const updateGalleryZod = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    image: z.string().optional(),
  }),
});

export default { createGalleryZod, updateGalleryZod };
