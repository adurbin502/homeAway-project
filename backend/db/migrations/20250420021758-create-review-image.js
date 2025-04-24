'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    let options = {};
    if (process.env.NODE_ENV === 'production') {
      options.schema = process.env.SCHEMA;  // define your schema in options object
    }

    await queryInterface.createSchema(options.schema);
    await queryInterface.createTable('ReviewImage', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reviewId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Review',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      url: {
        type: Sequelize.STRING(2000), // Added max length for URLs
        allowNull: false,
        validate: {
          isUrl: true // Optional: URL format validation
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

    // Optional: Add an index on reviewId for faster lookups
    await queryInterface.addIndex('ReviewImage', ['reviewId']);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImage';
    return queryInterface.dropTable('ReviewImage', options); // Fixed: Pass table name and options separately
  }
};