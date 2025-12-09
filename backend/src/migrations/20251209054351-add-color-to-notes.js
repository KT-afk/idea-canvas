'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('NOTES');
    if (!tableInfo.COLOR) {
      await queryInterface.addColumn('NOTES', 'COLOR', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "YELLOW",
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('NOTES');
    if(tableInfo.COLOR){
      await queryInterface.removeColumn('NOTES', 'COLOR');
    }
  }
};
