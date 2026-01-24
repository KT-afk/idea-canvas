'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Note: X → POSITIONX, Y → POSITIONY, COLOR → BACKGROUNDCOLOR, TITLE, TYPE, STATUS
    // already applied by sequelize.sync({ alter: true })

    // Step 1: Add missing columns to NOTES table
    await queryInterface.addColumn('NOTES', 'USERID', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn('NOTES', 'ARCHIVEDAT', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Step 2: Remove obsolete columns from NOTES table
    await queryInterface.removeColumn('NOTES', 'WIDTH');
    await queryInterface.removeColumn('NOTES', 'HEIGHT');

    // Step 3: Add userId to BOARDS table
    await queryInterface.addColumn('BOARDS', 'USERID', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Rollback Step 3: Remove userId from BOARDS
    await queryInterface.removeColumn('BOARDS', 'USERID');

    // Rollback Step 2: Add back WIDTH and HEIGHT to NOTES
    await queryInterface.addColumn('NOTES', 'WIDTH', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 192,
    });

    await queryInterface.addColumn('NOTES', 'HEIGHT', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 96,
    });

    // Rollback Step 1: Remove USERID and ARCHIVEDAT from NOTES
    await queryInterface.removeColumn('NOTES', 'ARCHIVEDAT');
    await queryInterface.removeColumn('NOTES', 'USERID');

    // Rollback renamed columns: POSITIONX → X, POSITIONY → Y, BACKGROUNDCOLOR → COLOR
    await queryInterface.renameColumn('NOTES', 'POSITIONX', 'X');
    await queryInterface.renameColumn('NOTES', 'POSITIONY', 'Y');
    await queryInterface.renameColumn('NOTES', 'BACKGROUNDCOLOR', 'COLOR');

    // Rollback new columns: Remove TITLE, TYPE, STATUS
    await queryInterface.removeColumn('NOTES', 'TITLE');
    await queryInterface.removeColumn('NOTES', 'TYPE');
    await queryInterface.removeColumn('NOTES', 'STATUS');
  }
};
