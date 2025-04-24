'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ReviewImages', {
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
          model: 'Reviews',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      url: {
        type: Sequelize.STRING(2000),
        allowNull: false,
        validate: {
          isUrl: true
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

    const tableName = process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.ReviewImages` : 'ReviewImages';
    
    // Add index with proper schema handling
    await queryInterface.addIndex(
        tableName,
        ['reviewId'],
        {
          name: 'review_images_review_id_idx'
        }
    );
  },

  async down(queryInterface, Sequelize) {
    const tableName = process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.ReviewImages` : 'ReviewImages';
    
    // Remove index first
    await queryInterface.removeIndex(
        tableName,
        'review_images_review_id_idx'
    );
    
    options.tableName = 'ReviewImages';
    return queryInterface.dropTable('ReviewImages', options);
  }
};