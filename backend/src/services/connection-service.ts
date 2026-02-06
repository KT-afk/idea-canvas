/**
 * Connection Service
 * Epic 6, Story 6.1: Connection Data Model & API
 * 
 * Business logic and database operations for card connections
 */

import { Transaction } from "sequelize";
import Connections from "../models/CONNECTIONS";
import Notes from "../models/NOTES";
import { withRetry } from "../utils/retry";

/**
 * Create a new connection between two cards
 */
export const createConnection = async (
  data: { sourceCardId: string; targetCardId: string; boardId: string; label?: string | null },
  options?: { transaction?: Transaction }
) => {
  // Validation: source and target must be different
  if (data.sourceCardId === data.targetCardId) {
    throw new Error('Cannot connect a card to itself');
  }

  // Validation: both cards must exist and belong to the same board
  const [sourceCard, targetCard] = await Promise.all([
    Notes.findOne({ where: { id: data.sourceCardId, boardId: data.boardId } }),
    Notes.findOne({ where: { id: data.targetCardId, boardId: data.boardId } }),
  ]);

  if (!sourceCard || !targetCard) {
    throw new Error('One or both cards not found on this board');
  }

  // Check for duplicate connection
  const existingConnection = await Connections.findOne({
    where: {
      sourceCardId: data.sourceCardId,
      targetCardId: data.targetCardId,
    },
  });

  if (existingConnection) {
    throw new Error('Connection already exists');
  }

  // Create the connection with retry
  return await withRetry(async () => {
    return await Connections.create({
      sourceCardId: data.sourceCardId,
      targetCardId: data.targetCardId,
      boardId: data.boardId,
      label: data.label || null,
    }, options);
  });
};

/**
 * Get all connections for a board
 */
export const getConnectionsByBoardId = async (boardId: string) => {
  return await withRetry(async () => {
    return await Connections.findAll({
      where: { boardId },
      include: [
        { 
          model: Notes, 
          as: 'sourceCard', 
          attributes: ['id', 'content', 'positionX', 'positionY', 'type'] 
        },
        { 
          model: Notes, 
          as: 'targetCard', 
          attributes: ['id', 'content', 'positionX', 'positionY', 'type'] 
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  });
};

/**
 * Get all connections for a specific card (where card is source or target)
 */
export const getConnectionsByCardId = async (cardId: string) => {
  const { Op } = require('sequelize');
  
  return await withRetry(async () => {
    return await Connections.findAll({
      where: {
        [Op.or]: [
          { sourceCardId: cardId },
          { targetCardId: cardId },
        ],
      },
      include: [
        { 
          model: Notes, 
          as: 'sourceCard', 
          attributes: ['id', 'content', 'positionX', 'positionY', 'type'] 
        },
        { 
          model: Notes, 
          as: 'targetCard', 
          attributes: ['id', 'content', 'positionX', 'positionY', 'type'] 
        },
      ],
    });
  });
};

/**
 * Delete a connection by ID
 */
export const deleteConnectionById = async (id: string, options?: { transaction?: Transaction }) => {
  const connection = await Connections.findByPk(id);
  
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  return await withRetry(async () => {
    return await connection.destroy(options);
  });
};
