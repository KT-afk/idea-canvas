import { CreationAttributes, Op } from "sequelize";
import Boards from "../models/BOARDS";
import Notes from "../models/NOTES";
import { withRetry } from "../utils/retry";
import { sequelize } from "../config/db";

export const getAllBoards = async () => {
  try {
    return await withRetry(async () => await Boards.findAll({
      where: { deletedAt: null }
    }));
  } catch (error) {
    console.error("❌ Error fetching all boards:", error);
    throw error;
  }
};

export const getBoardById = async (id: string) => {
  try {
    return await withRetry(async () => await Boards.findOne({
      where: { 
        id,
        deletedAt: null 
      }
    }));
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

// Story 3.3: Get count of cards on a board
export const getBoardCardCount = async (boardId: string): Promise<number> => {
  try {
    return await withRetry(async () => {
      return await Notes.count({
        where: { 
          boardId,
          status: { [Op.ne]: 'archived' } // Don't count archived cards
        }
      });
    });
  } catch (error) {
    console.error("❌ Error counting cards on board:", error);
    throw error;
  }
};

// Story 3.3: Get fallback board (first board alphabetically, excluding specified board)
export const getFallbackBoard = async (excludeBoardId: string): Promise<Boards | null> => {
  try {
    return await withRetry(async () => {
      return await Boards.findOne({
        where: {
          id: { [Op.ne]: excludeBoardId },
          deletedAt: null
        },
        order: [['name', 'ASC']]
      });
    });
  } catch (error) {
    console.error("❌ Error finding fallback board:", error);
    throw error;
  }
};

// Story 3.3: Soft delete a board and move all its cards to fallback board
export const softDeleteBoard = async (boardId: string, fallbackBoardId: string): Promise<Boards> => {
  return await withRetry(async () => {
    return await sequelize.transaction(async (transaction) => {
      // Find the board to delete
      const board = await Boards.findByPk(boardId, { transaction });
      if (!board) {
        throw new Error("Board not found");
      }

      // Check if board is already deleted
      if (board.deletedAt) {
        throw new Error("Board is already deleted");
      }

      // Move all cards from this board to the fallback board
      await Notes.update(
        { boardId: fallbackBoardId },
        { 
          where: { boardId },
          transaction 
        }
      );

      // Soft delete the board
      board.deletedAt = new Date();
      await board.save({ transaction });

      return board;
    });
  });
};

// Story 3.3: Restore a soft-deleted board
export const restoreBoard = async (boardId: string): Promise<Boards> => {
  try {
    return await withRetry(async () => {
      return await sequelize.transaction(async (transaction) => {
        const board = await Boards.findByPk(boardId, { transaction });
        if (!board) {
          throw new Error("Board not found");
        }

        if (!board.deletedAt) {
          throw new Error("Board is not deleted");
        }

        // Restore the board
        board.deletedAt = null;
        await board.save({ transaction });

        return board;
      });
    });
  } catch (error) {
    console.error("❌ Error restoring board:", error);
    throw error;
  }
};

// Story 3.3: Permanently delete a board (hard delete)
export const hardDeleteBoard = async (boardId: string): Promise<void> => {
  try {
    await withRetry(async () => {
      return await sequelize.transaction(async (transaction) => {
        // Check if any cards still exist on this board
        const cardCount = await Notes.count({
          where: { boardId },
          transaction
        });

        if (cardCount > 0) {
          throw new Error(`Cannot hard delete board: ${cardCount} cards still exist on this board`);
        }

        // Safe to delete - no cards remain
        const deletedCount = await Boards.destroy({
          where: { id: boardId },
          transaction
        });

        if (deletedCount === 0) {
          throw new Error("Board not found");
        }
      });
    });
  } catch (error) {
    console.error("❌ Error permanently deleting board:", error);
    throw error;
  }
};
