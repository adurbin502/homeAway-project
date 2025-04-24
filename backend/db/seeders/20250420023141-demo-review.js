'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const reviews = [
  {
    spotId: 1,
    userId: 2,
    review: 'This place was amazing!',
    stars: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    spotId: 1,
    userId: 3,
    review: 'Nice location but very noisy.',
    stars: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    spotId: 2,
    userId: 1,
    review: 'Would definitely stay again.',
    stars: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    options.tableName = 'Reviews';
    return queryInterface.bulkInsert(options, reviews);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: {
        [Op.in]: [
          'This place was amazing!',
          'Nice location but very noisy.',
          'Would definitely stay again.'
        ]
      }
    });
  }
};