import axios from 'axios';
import type { UserPreferences, UpdatePreferencesPayload } from '../types/preference.types';
import { API_BASE_URL } from '../constants/apiEndpoints';

export const preferencesService = {
  getPreferences: async (userId?: string): Promise<UserPreferences> => {
    const response = await axios.get<{ data: UserPreferences }>(`${API_BASE_URL}/preferences`, {
      params: { userId }
    });
    return response.data.data;
  },

  updatePreferences: async (updates: UpdatePreferencesPayload): Promise<UserPreferences> => {
    const response = await axios.put<{ data: UserPreferences }>(`${API_BASE_URL}/preferences`, updates);
    return response.data.data;
  },

  setDefaultBoard: async (boardId: string, userId?: string): Promise<UserPreferences> => {
    const response = await axios.put<{ data: UserPreferences }>(`${API_BASE_URL}/preferences/default-board`, {
      boardId,
      userId
    });
    return response.data.data;
  }
};
