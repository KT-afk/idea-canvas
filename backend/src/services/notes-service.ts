import { CreationAttributes } from "sequelize";
import Notes from "../models/NOTES";

export const insertNote = async (note: CreationAttributes<Notes>) => {
  try {
    const { content, x, y, width, height, boardId } = note;
    const newNote = await Notes.create({
      content,
      x,
      y,
      width: width || 192,
      height: height || 96,
      boardId: boardId || null,
    } as Notes);
    return newNote;
  } catch (error) {
    console.error("❌ Error inserting a note:", error);
    throw error;
  }
};
export const getAllNotes = async () => {
  try {
    return await Notes.findAll();
  } catch (error) {
    console.error("❌ Error fetching all notes:", error);
    throw error;
  }
};
export const getAllNotesByBoardId = async (boardId: string) => {
  try {
    return await Notes.findAll({
      where: { boardId: boardId },
    });
  } catch (error) {
    console.error("❌ Error fetching notes by board ID:", error);
    throw error;
  }
};
export const updateNote = async (
  notesId: string,
  updates: Partial<CreationAttributes<Notes>>
) => {
  try {
    const [updatedCount, updatedRows] = await Notes.update(
      {
        content: updates.content,
        boardId: updates.boardId,
        x: updates.x,
        y: updates.y,
        width: updates.width,
        height: updates.height,
      },
      { where: { id: notesId }, returning: true }
    );
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
export const deleteNote = async (notesId: string) => {
  try {
    const deletedCount = await Notes.destroy({ where: { id: notesId } });
    if (deletedCount === 0) {
      throw new Error("Note not found.");
    }
    return deletedCount > 0;
  } catch (error) {
    console.error("❌ Error deleting a note:", error);
    throw error;
  }
};
