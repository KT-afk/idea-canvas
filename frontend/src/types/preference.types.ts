export interface UserPreferences {
  id: string;
  userId: string;
  defaultBoardId: string | null;
  resurfaceFrequency: string;
  theme: string;
  canvasColor: string;
  lastZoom: number;
}

export interface UpdatePreferencesPayload {
  userId?: string;
  defaultBoardId?: string;
  resurfaceFrequency?: string;
  theme?: string;
  canvasColor?: string;
  lastZoom?: number;
}
