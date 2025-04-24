'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const spots = [
  {
    ownerId: 1,
    address: '123 Disney Lane',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    name: 'App Academy',
    description: 'Place where web developers are created',
    price: 123,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    ownerId: 2,
    address: '456 Magic Road',
    city: 'Los Angeles',
    state: 'California',
    country: 'United States',
    lat: 34.052235,
    lng: -118.243683,
    name: 'Magic Mansion',
    description: 'A mansion filled with magical vibes',
    price: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Spot', spots, options);  // Changed from options to 'Spots' and added options as third argument
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Spot', {  // Changed from options to 'Spots'
      name: { [Op.in]: ['App Academy', 'Magic Mansion'] }
    }, options);  // Added options as third argument
  }
};