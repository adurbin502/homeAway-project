'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Spots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);

    const tableName = process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.Spots` : 'Spots';
    
    // Add indexes for better query performance
    await queryInterface.addIndex(
      tableName,
      ['ownerId'],
      {
        name: 'spots_owner_id_idx'
      }
    );
    
    await queryInterface.addIndex(
      tableName,
      ['city', 'state'],
      {
        name: 'spots_location_idx'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const tableName = process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.Spots` : 'Spots';
    
    // Remove indexes first
    await queryInterface.removeIndex(tableName, 'spots_owner_id_idx');
    await queryInterface.removeIndex(tableName, 'spots_location_idx');
    
    options.tableName = 'Spots';
    return queryInterface.dropTable('Spots', options);
  }
};