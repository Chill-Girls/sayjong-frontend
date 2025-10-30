import { z } from 'zod';

export const signupRequestSchema = z.object({
  loginId: z.string().min(1, 'Login ID is required'),
  userPassword: z.string().min(1, 'Password must be at least 1 characters'),
  nickname: z.string().min(1, 'Nickname is required'),
});

export const loginRequestSchema = z.object({
  loginId: z.string().min(1, 'Login ID is required'),
  userPassword: z.string().min(1, 'Password is required'),
});

export const tokenRefreshRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const tokenInfoSchema = z.object({
  grantType: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const messageResponseSchema = z.object({
  message: z.string(),
});

export const signupResponseSchema = tokenInfoSchema;
export const loginResponseSchema = tokenInfoSchema;
export const tokenRefreshResponseSchema = tokenInfoSchema;

export type SignupRequest = z.infer<typeof signupRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type TokenRefreshRequest = z.infer<typeof tokenRefreshRequestSchema>;
export type Token = z.infer<typeof tokenInfoSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
