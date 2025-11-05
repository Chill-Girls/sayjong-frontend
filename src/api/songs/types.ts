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

export const ttsMarkSchema = z.object({
  timeSeconds: z.number(),
  markName: z.string(),
});

export type TtsMark = z.infer<typeof ttsMarkSchema>;

export const lyricLineSchema = z.object({
  lyricLineId: z.number(),
  lineNo: z.number(),
  originalText: z.string(),
  textRomaja: z.string().nullable().optional(),
  textEng: z.string().nullable().optional(),
  nativeAudioUrl: z.string().nullable().optional(),
  startTime: z.number().nullable().optional(),
  syllableTimings: z
    .string()
    .nullable()
    .transform(str => {
      if (!str || str.trim() === '') {
        return [];
      }

      try {
        const parsed = JSON.parse(str);
        return z.array(ttsMarkSchema).parse(parsed);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        console.warn('syllableTimings 파싱 실패, 빈 배열로 대체:', str);
        return [];
      }
    })
    .default([]),
});

export const lyricsArraySchema = z.array(lyricLineSchema);

export const songWithLyricsSchema = z.object({
  songId: z.number(),
  title: z.string(),
  singer: z.string(),
  lyrics: lyricsArraySchema,
});

export type LyricLine = z.infer<typeof lyricLineSchema>;
export type SongWithLyrics = z.infer<typeof songWithLyricsSchema>;
