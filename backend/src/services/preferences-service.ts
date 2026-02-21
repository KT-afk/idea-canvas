import UserPreferences from "../models/USER_PREFERENCES";
import BOARDS from "../models/BOARDS";

// Helper to get the single user ID (MVP constant)
const DEFAULT_USER_ID = "default-user";

export async function getPreferences(userId: string = DEFAULT_USER_ID) {
  let prefs = await UserPreferences.findOne({ where: { userId } });
  
  if (!prefs) {
    // Create default preferences if they don't exist
    prefs = await UserPreferences.create({ userId });
  }
  
  return prefs;
}

export async function updatePreferences(userId: string = DEFAULT_USER_ID, updates: Partial<UserPreferences>) {
  const prefs = await getPreferences(userId);
  return await prefs.update(updates);
}

export async function setDefaultBoard(boardId: string, userId: string = DEFAULT_USER_ID) {
  // Validate board exists
  const board = await BOARDS.findByPk(boardId);
  if (!board) {
    throw new Error("Board not found");
  }

  const prefs = await getPreferences(userId);
  return await prefs.update({ defaultBoardId: boardId });
}

export async function getDefaultBoardId(userId: string = DEFAULT_USER_ID) {
  const prefs = await getPreferences(userId);
  return prefs.defaultBoardId;
}
