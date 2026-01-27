import { CreationAttributes } from "sequelize";
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

// Story 3.1: Create a new board
export const createBoard = async (board: CreationAttributes<Boards>) => {
  try {
    const { name, userId } = board;
    return await withRetry(async () => {
      return await Boards.create({
        name,
        userId: userId || null,
      });
    });
  } catch (error) {
    console.error("❌ Error creating board:", error);
    throw error;
  }
};

// Story 3.2: Update board name
export const updateBoard = async (id: string, name: string) => {
  try {
    return await withRetry(async () => {
      const board = await Boards.findByPk(id);
      if (!board) {
        throw new Error("Board not found");
      }
      board.name = name;
      return await board.save();
    });
  } catch (error) {
    console.error("❌ Error updating board:", error);
    throw error;
  }
};
