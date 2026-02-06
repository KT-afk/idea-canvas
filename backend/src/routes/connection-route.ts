/**
 * Connection Routes
 * Epic 6, Story 6.1: Connection Data Model & API
 */

import express from "express";
import { sequelize } from "../config/db";
import {
  createConnection,
  getConnectionsByBoardId,
  getConnectionsByCardId,
  deleteConnectionById,
} from "../services/connection-service";

export const connectionRouter = express.Router();

// Create a connection between two cards
connectionRouter.post("/boards/:boardId/connections", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { boardId } = req.params;
    const { sourceCardId, targetCardId, label } = req.body;

    // Validate required fields
    if (!sourceCardId || !targetCardId) {
      await transaction.rollback();
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Source and target card IDs are required' }
      });
    }

    const result = await createConnection(
      { sourceCardId, targetCardId, boardId, label },
      { transaction }
    );
    
    await transaction.commit();
    res.status(201).json({ data: result });
  } catch (error: any) {
    await transaction.rollback();
    console.error("❌ Error creating connection:", error);
    
    // Handle known validation errors
    if (error.message === 'Cannot connect a card to itself') {
      return res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: error.message } 
      });
    }
    if (error.message === 'One or both cards not found on this board') {
      return res.status(404).json({ 
        error: { code: 'NOT_FOUND', message: error.message } 
      });
    }
    if (error.message === 'Connection already exists') {
      return res.status(409).json({ 
        error: { code: 'CONFLICT', message: error.message } 
      });
    }
    
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create connection' } 
    });
  }
});

// Get all connections for a board
connectionRouter.get("/boards/:boardId/connections", async (req, res) => {
  try {
    const { boardId } = req.params;
    const connections = await getConnectionsByBoardId(boardId);
    res.json({ data: connections });
  } catch (error) {
    console.error("❌ Error fetching connections:", error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch connections' } 
    });
  }
});

// Get all connections for a specific card
connectionRouter.get("/cards/:cardId/connections", async (req, res) => {
  try {
    const { cardId } = req.params;
    const connections = await getConnectionsByCardId(cardId);
    res.json({ data: connections });
  } catch (error) {
    console.error("❌ Error fetching card connections:", error);
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch card connections' } 
    });
  }
});

// Delete a connection
connectionRouter.delete("/connections/:id", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    await deleteConnectionById(id, { transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error: any) {
    await transaction.rollback();
    console.error("❌ Error deleting connection:", error);
    
    if (error.message === 'Connection not found') {
      return res.status(404).json({ 
        error: { code: 'NOT_FOUND', message: error.message } 
      });
    }
    
    res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete connection' } 
    });
  }
});
