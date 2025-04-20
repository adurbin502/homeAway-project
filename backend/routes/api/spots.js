// backend/routes/api/spots.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Spot, SpotImage, Review, User, Booking } = require('../../db/models');
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

// Get all spots (with optional query filters)
router.get('/', async (req, res) => {
    const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
    const pagination = {
        limit: Math.min(size, 20),
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

    res.json({ Spots: spots });
});

// Get current user's spots
router.get('/current', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const spots = await Spot.findAll({ where: { ownerId: userId } });
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
    const sum = reviews.reduce((acc, review) => acc + review.stars, 0);
    const avgStarRating = reviews.length ? sum / reviews.length : null;

    res.json({
        ...spot.toJSON(),
        numReviews: reviews.length,
        avgStarRating
    });
});

// Create a spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
    const spot = await Spot.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json(spot);
});

// Edit a spot
router.put('/:spotId', requireAuth, validateSpot, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);
    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    await spot.update(req.body);
    res.json(spot);
});

// Delete a spot
router.delete('/:spotId', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);
    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    await spot.destroy();
    res.json({ message: 'Successfully deleted' });
});

module.exports = router;
