import { apiClient } from '../client';
import type { UserInfo } from './types';
import { userInfoSchema } from './types';

export async function getMe(): Promise<UserInfo> {
  try {
    const response = await apiClient.get<UserInfo>('/users/me');
    const validatedResponse = userInfoSchema.parse(response.data);
    return validatedResponse;
  } catch (error) {
    console.error('API Error (getMe):', error);
    throw new Error('Failed to retrieve user information.');
  }
}
