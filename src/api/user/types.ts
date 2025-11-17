import { z } from 'zod';

export const userInfoSchema = z.object({
  userId: z.number().int(),
  loginId: z.string(),
  nickname: z.string(),
});

export const getMeResponseSchema = userInfoSchema;
export type UserInfo = z.infer<typeof userInfoSchema>;
