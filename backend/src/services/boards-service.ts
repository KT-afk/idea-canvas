import Boards from "../models/BOARDS";
import { withRetry } from "../utils/retry";

export const getAllBoards = async () => {
  try {
    return await withRetry(async () => await Boards.findAll());
  } catch (error) {
    console.error("❌ Error fetching all boards:", error);
    throw error;
  }
};

export const getBoardById = async (id: string) => {
  try {
    return await withRetry(async () => await Boards.findByPk(id));
  } catch (error) {
    console.error("❌ Error fetching board by ID:", error);
    throw error;
  }
};
