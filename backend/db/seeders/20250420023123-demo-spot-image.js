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
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, spotImages);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: {
        [Op.in]: [
          'https://example.com/spot1-preview.jpg',
          'https://example.com/spot1-extra.jpg',
          'https://example.com/spot2-preview.jpg'
        ]
      }
    }, {});
  }
};

