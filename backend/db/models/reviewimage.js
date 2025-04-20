'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {
      // Each ReviewImage belongs to a Review
      ReviewImage.belongsTo(models.Review, {
        foreignKey: 'reviewId',
        onDelete: 'CASCADE',
        hooks: true
      });
    }
  }

  ReviewImage.init({
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'URL is required'
        },
        isUrl: {
          msg: 'Must be a valid URL'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'ReviewImage',
  });

  return ReviewImage;
};
