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
    return queryInterface.bulkInsert('ReviewImages', reviewImages, options);  // Changed from options to 'ReviewImages' and added options as third argument
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('ReviewImages', {  // Changed from options to 'ReviewImages'
      url: {
        [Op.in]: [
          'https://example.com/review-image-1.jpg',
          'https://example.com/review-image-2.jpg',
          'https://example.com/review-image-3.jpg'
        ]
      }
    }, options);  // Added options as third argument
  }
};