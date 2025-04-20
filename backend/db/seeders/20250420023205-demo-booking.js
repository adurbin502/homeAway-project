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
  async up(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    return queryInterface.bulkInsert(options, bookings);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      [Op.or]: bookings.map(booking => ({
        spotId: booking.spotId,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate
      }))
    }, {});
  }
};


