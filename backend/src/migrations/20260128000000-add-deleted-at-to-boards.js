'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const boardsTableInfo = await queryInterface.describeTable('BOARDS');
    
    // Add deletedAt column to BOARDS table for soft delete functionality (if not already present)
    if (!boardsTableInfo.DELETEDAT) {
      await queryInterface.addColumn('BOARDS', 'DELETEDAT', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Add index on deletedAt for efficient querying of non-deleted boards
    const indexes = await queryInterface.showIndex('BOARDS');
    const hasIndex = indexes.some(index => index.name === 'boards_deleted_at_index');
    
    if (!hasIndex) {
      await queryInterface.addIndex('BOARDS', ['DELETEDAT'], {
        name: 'boards_deleted_at_index',
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Check if index exists before removing
    const indexes = await queryInterface.showIndex('BOARDS');
    const hasIndex = indexes.some(index => index.name === 'boards_deleted_at_index');
    
    if (hasIndex) {
      await queryInterface.removeIndex('BOARDS', 'boards_deleted_at_index');
    }
    
    // Check if column exists before removing
    const boardsTableInfo = await queryInterface.describeTable('BOARDS');
    if (boardsTableInfo.DELETEDAT) {
      await queryInterface.removeColumn('BOARDS', 'DELETEDAT');
    }
  }
};
