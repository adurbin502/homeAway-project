'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Spots',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          notInPast(value) {
            if (new Date(value) < new Date()) {
              throw new Error('Start date cannot be in the past');
            }
          }
        }
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterStartDate(value) {
            if (new Date(value) <= new Date(this.startDate)) {
              throw new Error('End date must be after start date');
            }
          }
        }
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

    const tableName = process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.Bookings` : 'Bookings';
    
    // Add indexes with proper schema handling
    await queryInterface.addIndex(
        tableName,
        ['spotId'],
        {
          name: 'bookings_spot'
        }
    );
    await queryInterface.addIndex(
        tableName,
        ['userId'],
        {
          name: 'bookings_user'
        }
    );
    await queryInterface.addIndex(
        tableName,
        ['startDate', 'endDate'],
        {
          name: 'bookings_date_range'
        }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    return queryInterface.dropTable('Bookings', options); // Fixed: Pass table name and options separately
  }
};