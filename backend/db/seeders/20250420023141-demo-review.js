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
    return queryInterface.bulkInsert('Reviews', reviews, options);  // Changed from options to 'Reviews' and added options as third argument
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Reviews', {  // Changed from options to 'Reviews'
      review: {
        [Op.in]: [
          'This place was amazing!',
          'Nice location but very noisy.',
          'Would definitely stay again.'
        ]
      }
    }, options);  // Added options as third argument
  }
};