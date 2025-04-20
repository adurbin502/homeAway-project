'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // Each Booking belongs to a Spot
      Booking.belongsTo(models.Spot, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE',
        hooks: true
      });

      // Each Booking belongs to a User
      Booking.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        hooks: true
      });
    }
  }

  Booking.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Start date must be a valid date.'
        }
      }
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'End date must be a valid date.'
        },
        isAfterStartDate(value) {
          if (this.startDate && value <= this.startDate) {
            throw new Error('End date cannot be on or before start date.');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });

  return Booking;
};
