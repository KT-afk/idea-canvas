'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Update X column to support larger screen coordinates
    await queryInterface.changeColumn('NOTES', 'X', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    // Update Y column to support larger screen coordinates
    await queryInterface.changeColumn('NOTES', 'Y', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert X column back to original precision
    await queryInterface.changeColumn('NOTES', 'X', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
    });

    // Revert Y column back to original precision
    await queryInterface.changeColumn('NOTES', 'Y', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
    });
  }
};
