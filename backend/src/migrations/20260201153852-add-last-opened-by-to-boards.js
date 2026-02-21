'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('BOARDS');
    
    if (!tableDescription.LASTOPENEDAT) {
      await queryInterface.addColumn('BOARDS', 'LASTOPENEDAT', {
        type: Sequelize.DATE,
        allowNull: true,
      });
      console.log('✅ Added LASTOPENEDAT column to BOARDS table');
    } else {
      console.log('⏭️ LASTOPENEDAT column already exists, skipping');
    }
  },

  async down (queryInterface, Sequelize) {
    // Check if METADATA column exists before removing
    const tableDescription = await queryInterface.describeTable('BOARDS');
    
    if (tableDescription.LASTOPENEDAT) {
      await queryInterface.removeColumn('BOARDS', 'LASTOPENEDAT');
      console.log('✅ Removed LASTOPENEDAT column from BOARDS table');
    } else {
      console.log('⏭️  LASTOPENEDAT column does not exist, skipping');
    }
  }
};
