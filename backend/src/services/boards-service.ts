import { CreationAttributes, Op } from "sequelize";
import { sequelize } from "../config/db";
import Boards from "../models/BOARDS";
import Notes from "../models/NOTES";
import { withRetry } from "../utils/retry";

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

export const updateLastOpenedAt = async (id: string) => {
  try {
    return await withRetry(async () => {
      const board = await Boards.findByPk(id);
      if (!board) {
        throw new Error("Board not found");
      }
      board.lastOpenedAt = new Date();
      return await board.save();
    });
  } catch (error) {
    console.error("❌ Error updating last opened at:", error);
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

// Story 3.3: Get fallback board
// Priority: 1) User's default board (if set and not being deleted)
//           2) First board alphabetically (excluding deleted board)
export const getFallbackBoard = async (excludeBoardId: string, userId: string = "default-user"): Promise<Boards | null> => {
  try {
    return await withRetry(async () => {
      // First, try to get user's default board from preferences
      const { getDefaultBoardId } = await import('./preferences-service');
      const defaultBoardId = await getDefaultBoardId(userId);
      
      // If user has a default board set and it's not the one being deleted, use it
      if (defaultBoardId && defaultBoardId !== excludeBoardId) {
        const defaultBoard = await Boards.findOne({
          where: {
            id: defaultBoardId,
            deletedAt: null
          }
        });
        if (defaultBoard) {
          return defaultBoard;
        }
      }
      
      // Otherwise, fall back to first board alphabetically
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
// Cards are tracked with their original board ID for potential restoration
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

      // Get all cards from this board before moving
      const cardsToMove = await Notes.findAll({
        where: { boardId },
        transaction
      });

      // Store original board ID and move cards to fallback board
      // Note: This stores the deleted board ID in a metadata field for restoration
      for (const card of cardsToMove) {
        await card.update(
          { 
            boardId: fallbackBoardId,
            metadata: {
              ...((card.metadata as any) || {}),
              previousBoardId: boardId, // Track for undo
              movedAt: new Date().toISOString()
            }
          },
          { transaction }
        );
      }

      // Soft delete the board
      board.deletedAt = new Date();
      await board.save({ transaction });

      return board;
    });
  });
};

// Story 3.3: Restore a soft-deleted board and move cards back
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

        // Find all cards that were moved from this board (tracked in metadata)
        const cardsToRestore = await Notes.findAll({
          where: sequelize.where(
            sequelize.cast(sequelize.json('metadata.previousBoardId'), 'text'),
            boardId
          ),
          transaction
        });

        // Move cards back to restored board and clean up metadata
        for (const card of cardsToRestore) {
          const metadata = (card.metadata as any) || {};
          delete metadata.previousBoardId;
          delete metadata.movedAt;
          
          await card.update(
            { 
              boardId: boardId,
              metadata: Object.keys(metadata).length > 0 ? metadata : null
            },
            { transaction }
          );
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
