import { apiClient } from '../client';
import type {
  SignupRequest,
  LoginRequest,
  TokenRefreshRequest,
  Token,
  MessageResponse,
} from './types';
import {
  signupRequestSchema,
  loginRequestSchema,
  tokenRefreshRequestSchema,
  tokenInfoSchema,
  messageResponseSchema,
} from './types';

export async function signup(data: SignupRequest): Promise<MessageResponse> {
  try {
    const validatedData = signupRequestSchema.parse(data);
    const response = await apiClient.post<MessageResponse>('/auth/signup', validatedData);
    const validatedResponse = messageResponseSchema.parse(response.data);
    return validatedResponse;
  } catch (error) {
    console.error('API Error (signup):', error);
    throw new Error('Signup failed.');
  }
}

export async function login(data: LoginRequest): Promise<Token> {
  try {
    const validatedData = loginRequestSchema.parse(data);
    const response = await apiClient.post<Token>('/auth/login', validatedData);
    const validatedResponse = tokenInfoSchema.parse(response.data);
    return validatedResponse;
  } catch (error) {
    console.error('API Error (login):', error);
    throw new Error('Login failed.');
  }
}

export async function refreshToken(data: TokenRefreshRequest): Promise<Token> {
  try {
    const validatedData = tokenRefreshRequestSchema.parse(data);
    const response = await apiClient.post<Token>('/auth/refresh', validatedData);
    const validatedResponse = tokenInfoSchema.parse(response.data);
    return validatedResponse;
  } catch (error) {
    console.error('API Error (refreshToken):', error);
    throw new Error('Token refresh failed.');
  }
}

export async function logout(): Promise<MessageResponse> {
  try {
    const response = await apiClient.post<MessageResponse>('/auth/logout');
    const validatedResponse = messageResponseSchema.parse(response.data);
    return validatedResponse;
  } catch (error) {
    console.error('API Error (logout):', error);
    throw new Error('Logout failed.');
  }
}
