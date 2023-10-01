'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'veification_code', {
      type: Sequelize.DataTypes.STRING(6),
      allowNull: true
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'veification_code')
  }
};
