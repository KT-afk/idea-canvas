'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('NOTES');
    if (!tableInfo.ZINDEX) {
      await queryInterface.addColumn('NOTES', 'ZINDEX', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('NOTES');
    if(tableInfo.ZINDEX){
      await queryInterface.removeColumn('NOTES', 'ZINDEX');
    }
  }
};
