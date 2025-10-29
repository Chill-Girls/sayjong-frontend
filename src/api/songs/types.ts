import { z } from 'zod';

export const songResponseSchema = z.object({
  songId: z.number().int(),
  title: z.string(),
  singer: z.string(),
  trackId: z.string(),
  coverUrl: z.string().url().nullable(),
  titleEng: z.string(),
});

export const songListResponseSchema = z.array(songResponseSchema);

export type Song = z.infer<typeof songResponseSchema>;
export type SongList = z.infer<typeof songListResponseSchema>;
