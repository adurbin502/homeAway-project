'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const spotImages = [
  {
    spotId: 1,
    url: 'https://example.com/spot1-preview.jpg',
    preview: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    spotId: 1,
    url: 'https://example.com/spot1-extra.jpg',
    preview: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    spotId: 2,
    url: 'https://example.com/spot2-preview.jpg',
    preview: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('SpotImage', spotImages, options);  // Changed from options to 'SpotImages' and added options as third argument
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('SpotImage', {  // Changed from options to 'SpotImages'
      url: {
        [Op.in]: [
          'https://example.com/spot1-preview.jpg',
          'https://example.com/spot1-extra.jpg',
          'https://example.com/spot2-preview.jpg'
        ]
      }
    }, options);  // Added options as third argument
  }
};