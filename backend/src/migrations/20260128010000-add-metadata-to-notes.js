'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if METADATA column exists
    const tableDescription = await queryInterface.describeTable('NOTES');
    
    if (!tableDescription.METADATA) {
      await queryInterface.addColumn('NOTES', 'METADATA', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
      console.log('✅ Added METADATA column to NOTES table');
    } else {
      console.log('⏭️  METADATA column already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if METADATA column exists before removing
    const tableDescription = await queryInterface.describeTable('NOTES');
    
    if (tableDescription.METADATA) {
      await queryInterface.removeColumn('NOTES', 'METADATA');
      console.log('✅ Removed METADATA column from NOTES table');
    } else {
      console.log('⏭️  METADATA column does not exist, skipping');
    }
  }
};
