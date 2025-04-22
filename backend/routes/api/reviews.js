const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Review, User, Spot, ReviewImage, SpotImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    check('stars')
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

// Get all reviews of the current user
router.get('/current', requireAuth, async (req, res) => {
    const reviews = await Review.findAll({
        where: { userId: req.user.id },
        include: [
            { 
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Spot,
                attributes: [
                    'id', 'ownerId', 'address', 'city', 'state', 
                    'country', 'lat', 'lng', 'name', 'price'
                ],
                include: [
                    { 
                        model: SpotImage,
                        where: { preview: true },
                        required: false,
                        attributes: ['url']
                    }
                ]
            },
            { 
                model: ReviewImage,
                attributes: ['id', 'url']
            }
        ]
    });

    const formattedReviews = reviews.map(review => {
        const reviewData = review.toJSON();
        reviewData.Spot.previewImage = reviewData.Spot.SpotImages?.[0]?.url || null;
        delete reviewData.Spot.SpotImages;
        return reviewData;
    });

    res.json({ Reviews: formattedReviews });
});

// Add an image to a review
router.post('/:reviewId/images', requireAuth, async (req, res) => {
    const review = await Review.findByPk(req.params.reviewId);
    
    if (!review) {
        return res.status(404).json({ message: "Review couldn't be found" });
    }
    
    if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const imageCount = await ReviewImage.count({ 
        where: { reviewId: review.id } 
    });
    
    if (imageCount >= 10) {
        return res.status(403).json({ 
            message: "Maximum number of images for this resource was reached" 
        });
    }

    const newImage = await ReviewImage.create({
        reviewId: review.id,
        url: req.body.url
    });

    return res.status(201).json({
        id: newImage.id,
        url: newImage.url
    });
});

// Edit a review
router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
    const review = await Review.findByPk(req.params.reviewId);
    
    if (!review) {
        return res.status(404).json({ message: "Review couldn't be found" });
    }
    
    if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const { stars, review: reviewText } = req.body;
    await review.update({
        stars,
        review: reviewText
    });

    return res.json({
        id: review.id,
        userId: review.userId,
        spotId: review.spotId,
        review: review.review,
        stars: review.stars,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
    });
});

// Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
    const review = await Review.findByPk(req.params.reviewId);
    
    if (!review) {
        return res.status(404).json({ message: "Review couldn't be found" });
    }
    
    if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await review.destroy();
    return res.json({ message: "Successfully deleted" });
});

module.exports = router;