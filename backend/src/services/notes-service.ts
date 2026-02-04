import { CreationAttributes, Transaction } from "sequelize";
import Notes from "../models/NOTES";
import { withRetry } from "../utils/retry";

export const insertNote = async (note: CreationAttributes<Notes>, options?: { transaction?: Transaction }) => {
  try {
    const { title, content, type, status, positionX, positionY, boardId, userId, backgroundColor, textColor, archivedAt } = note;

    const newNote = await withRetry(async () => {
      return await Notes.create({
        title: title || null,
        content,
        type: type || 'note',
        status: status || 'active',
        positionX,
        positionY,
        boardId: boardId || null,
        userId: userId || null,
        backgroundColor: backgroundColor || "yellow",
        textColor: textColor || "black",
        archivedAt: archivedAt || null
      } as Notes, options);
    });

    return newNote;
  } catch (error) {
    console.error("❌ Error inserting a note:", error);
    throw error;
  }
};

export const getNoteById = async (id: string) => {
  try {
    return await withRetry(async () => await Notes.findByPk(id));
  } catch (error) {
    console.error("❌ Error fetching note by ID:", error);
    throw error;
  }
};

export const getAllNotesByBoardId = async (boardId: string) => {
  try {
    return await withRetry(async () => await Notes.findAll({
      where: { boardId: boardId },
    }));
  } catch (error) {
    console.error("❌ Error fetching notes by board ID:", error);
    throw error;
  }
};
export const updateNote = async (
  notesId: string,
  updates: Partial<CreationAttributes<Notes>>,
  options?: { transaction?: Transaction }
) => {
  try {
    const [updatedCount, updatedRows] = await withRetry(async () => {
      return await Notes.update(
        {
          title: updates.title,
          content: updates.content,
          type: updates.type,
          status: updates.status,
          positionX: updates.positionX,
          positionY: updates.positionY,
          boardId: updates.boardId,
          userId: updates.userId,
          backgroundColor: updates.backgroundColor,
          textColor: updates.textColor,
          archivedAt: updates.archivedAt,
        },
        { where: { id: notesId }, returning: true, ...options }
      );
    });

    if (updatedRows === undefined || updatedCount === 0) {
      throw new Error("Note not found or no changes made.");
    }
    console.log("Updated note:", updatedRows[0]);
    return updatedRows[0].toJSON();
  } catch (error) {
    console.error("❌ Error updating a note:", error);
    throw error;
  }
};

export const deleteNote = async (notesId: string, options?: { transaction?: Transaction }) => {
  try {
    const deletedCount = await withRetry(async () => {
      return await Notes.destroy({ where: { id: notesId }, ...options });
    });

    if (deletedCount === 0) {
      throw new Error("Note not found.");
    }
    return deletedCount > 0;
  } catch (error) {
    console.error("❌ Error deleting a note:", error);
    throw error;
  }
};
