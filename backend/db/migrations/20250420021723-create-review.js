'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
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
      review: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          len: [1, 2000]
        }
      },
      stars: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
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

    const tableName = process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.Reviews` : 'Reviews';

    await queryInterface.addIndex(
        tableName,
        ['spotId', 'userId'],
        {
          unique: true,
          name: 'reviews_unique_spot_user'
        }
    );
  },

  async down(queryInterface, Sequelize) {
    const tableName = process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.Reviews` : 'Reviews';

    await queryInterface.removeIndex(
        tableName,
        'reviews_unique_spot_user'
    );
    return queryInterface.dropTable('Reviews', options);
  }
};