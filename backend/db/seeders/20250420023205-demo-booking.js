'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const bookings = [
  {
    spotId: 1,
    userId: 2,
    startDate: '2025-05-01',
    endDate: '2025-05-03',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    spotId: 2,
    userId: 3,
    startDate: '2025-06-10',
    endDate: '2025-06-15',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    spotId: 1,
    userId: 3,
    startDate: '2025-07-01',
    endDate: '2025-07-05',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('Booking', bookings, options);  // Changed from options to 'Bookings' and added options as third argument
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Booking', {  // Changed from options to 'Bookings'
      [Op.or]: bookings.map(({ spotId, userId, startDate, endDate }) => ({
        spotId,
        userId,
        startDate,
        endDate
      }))
    }, options);  // Added options as third argument
  }
};