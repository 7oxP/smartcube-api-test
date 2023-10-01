'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.createTable('user_groups', {
      user_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        // allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      role_id: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      device_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        // allowNull: false,
        references: {
          model: 'devices',
          key: 'id'
        }
      },
    })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.dropTable('user_groups')
  }
};
