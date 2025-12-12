'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('NOTES');
    if (!tableInfo.COLOR) {
      await queryInterface.addColumn('NOTES', 'TEXTCOLOR', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "black",
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('NOTES');
    if(tableInfo.COLOR){
      await queryInterface.removeColumn('NOTES', 'TEXTCOLOR');
    }
  }
};
