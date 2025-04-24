'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const reviewImages = [
  {
    reviewId: 1,
    url: 'https://example.com/review-image-1.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    reviewId: 2,
    url: 'https://example.com/review-image-2.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    reviewId: 3,
    url: 'https://example.com/review-image-3.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkInsert(options, reviewImages);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: {
        [Op.in]: [
          'https://example.com/review-image-1.jpg',
          'https://example.com/review-image-2.jpg',
          'https://example.com/review-image-3.jpg'
        ]
      }
    });
  }
};