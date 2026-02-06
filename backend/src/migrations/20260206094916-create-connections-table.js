/**
 * Migration: Create CONNECTIONS table
 * Epic 6, Story 6.1: Connection Data Model & API
 * 
 * Creates table for storing visual connections between notes/cards
 * Enables mind-mapping and relationship visualization features
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CONNECTIONS', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      sourceCardId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'NOTES',
          key: 'ID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      targetCardId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'NOTES',
          key: 'ID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      boardId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'BOARDS',
          key: 'ID',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      label: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Optional label for the connection',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Index for faster lookups by board
    await queryInterface.addIndex('CONNECTIONS', ['boardId'], {
      name: 'connections_board_id_idx',
    });

    // Index for faster lookups by source card
    await queryInterface.addIndex('CONNECTIONS', ['sourceCardId'], {
      name: 'connections_source_card_id_idx',
    });

    // Index for faster lookups by target card
    await queryInterface.addIndex('CONNECTIONS', ['targetCardId'], {
      name: 'connections_target_card_id_idx',
    });

    // Unique constraint to prevent duplicate connections
    await queryInterface.addConstraint('CONNECTIONS', {
      fields: ['sourceCardId', 'targetCardId'],
      type: 'unique',
      name: 'connections_unique_source_target',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CONNECTIONS');
  },
};
