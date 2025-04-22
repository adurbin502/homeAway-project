// backend/routes/api/spots.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Spot, SpotImage, Review, User, Booking, ReviewImage } = require('../../db/models');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

// Validation middleware
const validateSpot = [
    check('address').exists({ checkFalsy: true }).withMessage('Street address is required'),
    check('city').exists({ checkFalsy: true }).withMessage('City is required'),
    check('state').exists({ checkFalsy: true }).withMessage('State is required'),
    check('country').exists({ checkFalsy: true }).withMessage('Country is required'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
    check('name').isLength({ max: 49 }).withMessage('Name must be less than 50 characters'),
    check('description').exists({ checkFalsy: true }).withMessage('Description is required'),
    check('price').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
    handleValidationErrors
];

const validateReview = [
    check('review').exists({ checkFalsy: true }).withMessage('Review text is required'),
    check('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

const validateBooking = [
    check('startDate').isDate().withMessage('startDate must be a valid date'),
    check('endDate').isDate().withMessage('endDate must be a valid date'),
    handleValidationErrors
];

// Get all spots with query filters
router.get('/', async (req, res) => {
    let { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

    // Validate query parameters
    const errors = {};
    page = parseInt(page);
    size = parseInt(size);

    if (page < 1) errors.page = "Page must be greater than or equal to 1";
    if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
    if (minPrice < 0) errors.minPrice = "Minimum price must be greater than or equal to 0";
    if (maxPrice < 0) errors.maxPrice = "Maximum price must be greater than or equal to 0";

    if (Object.keys(errors).length) {
        return res.status(400).json({
            message: "Bad Request",
            errors
        });
    }

    const pagination = {
        limit: size,
        offset: (page - 1) * size
    };

    const where = {};
    if (minLat) where.lat = { [Op.gte]: parseFloat(minLat) };
    if (maxLat) where.lat = { ...where.lat, [Op.lte]: parseFloat(maxLat) };
    if (minLng) where.lng = { [Op.gte]: parseFloat(minLng) };
    if (maxLng) where.lng = { ...where.lng, [Op.lte]: parseFloat(maxLng) };
    if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

    const spots = await Spot.findAll({ where, ...pagination });

    for (let spot of spots) {
        const reviews = await Review.findAll({ where: { spotId: spot.id } });
        const sum = reviews.reduce((acc, review) => acc + review.stars, 0);
        const avgRating = reviews.length ? sum / reviews.length : null;
        const previewImage = await SpotImage.findOne({ where: { spotId: spot.id, preview: true } });
        spot.dataValues.avgRating = avgRating;
        spot.dataValues.previewImage = previewImage?.url || null;
    }

    res.json({
        Spots: spots,
        page,
        size
    });
});

// Get current user's spots
router.get('/current', requireAuth, async (req, res) => {
    const spots = await Spot.findAll({ where: { ownerId: req.user.id } });

    for (let spot of spots) {
        const reviews = await Review.findAll({ where: { spotId: spot.id } });
        const sum = reviews.reduce((acc, review) => acc + review.stars, 0);
        const avgRating = reviews.length ? sum / reviews.length : null;
        const previewImage = await SpotImage.findOne({ where: { spotId: spot.id, preview: true } });
        spot.dataValues.avgRating = avgRating;
        spot.dataValues.previewImage = previewImage?.url || null;
    }

    res.json({ Spots: spots });
});

// Get spot details by id
router.get('/:spotId', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId, {
        include: [
            { model: SpotImage, attributes: ['id', 'url', 'preview'] },
            { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] }
        ]
    });

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    const reviews = await Review.findAll({ where: { spotId: spot.id } });
    const numReviews = reviews.length;
    const avgStarRating = numReviews
        ? reviews.reduce((acc, review) => acc + review.stars, 0) / numReviews
        : null;

    res.json({
        ...spot.toJSON(),
        numReviews,
        avgStarRating
    });
});

// Create a spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
    const spot = await Spot.create({
        ...req.body,
        ownerId: req.user.id
    });

    res.status(201).json(spot);
});

// Add an image to a spot
router.post('/:spotId/images', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    const image = await SpotImage.create({
        spotId: spot.id,
        url: req.body.url,
        preview: req.body.preview
    });

    res.status(201).json({
        id: image.id,
        url: image.url,
        preview: image.preview
    });
});

// Edit a spot
router.put('/:spotId', requireAuth, validateSpot, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    await spot.update(req.body);
    res.json(spot);
});

// Delete a spot
router.delete('/:spotId', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    await spot.destroy();
    res.json({ message: "Successfully deleted" });
});

// Get all reviews by spot id
router.get('/:spotId/reviews', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    const reviews = await Review.findAll({
        where: { spotId: spot.id },
        include: [
            { model: User, attributes: ['id', 'firstName', 'lastName'] },
            { model: ReviewImage, attributes: ['id', 'url'] }
        ]
    });

    res.json({ Reviews: reviews });
});

// Create a review for a spot
router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    const existingReview = await Review.findOne({
        where: {
            spotId: spot.id,
            userId: req.user.id
        }
    });

    if (existingReview) {
        return res.status(500).json({
            message: "User already has a review for this spot"
        });
    }

    const review = await Review.create({
        userId: req.user.id,
        spotId: spot.id,
        review: req.body.review,
        stars: req.body.stars
    });

    res.status(201).json(review);
});

// Get all bookings for a spot
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    if (spot.ownerId === req.user.id) {
        const bookings = await Booking.findAll({
            where: { spotId: spot.id },
            include: [{ model: User, attributes: ['id', 'firstName', 'lastName'] }]
        });
        return res.json({ Bookings: bookings });
    } else {
        const bookings = await Booking.findAll({
            where: { spotId: spot.id },
            attributes: ['spotId', 'startDate', 'endDate']
        });
        return res.json({ Bookings: bookings });
    }
});

// Create a booking for a spot
router.post('/:spotId/bookings', requireAuth, validateBooking, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId === req.user.id) return res.status(403).json({ message: "Forbidden" });

    const { startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                endDate: "endDate cannot be on or before startDate"
            }
        });
    }

    // Check for booking conflicts
    const conflicts = await Booking.findOne({
        where: {
            spotId: spot.id,
            [Op.or]: [
                {
                    startDate: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                {
                    endDate: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            ]
        }
    });

    if (conflicts) {
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            errors: {
                startDate: "Start date conflicts with an existing booking",
                endDate: "End date conflicts with an existing booking"
            }
        });
    }

    const booking = await Booking.create({
        spotId: spot.id,
        userId: req.user.id,
        startDate,
        endDate
    });

    res.status(201).json(booking);
});

module.exports = router;