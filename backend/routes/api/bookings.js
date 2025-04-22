const express = require('express');
const { Booking, Spot, SpotImage, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all bookings of the current user
router.get('/current', requireAuth, async (req, res) => {
    const bookings = await Booking.findAll({
        where: { userId: req.user.id },
        include: {
            model: Spot,
            attributes: [
                'id', 'ownerId', 'address', 'city', 'state', 'country',
                'lat', 'lng', 'name', 'price'
            ],
            include: {
                model: SpotImage,
                where: { preview: true },
                required: false,
                attributes: ['url']
            }
        }
    });

    const formattedBookings = bookings.map(booking => {
        const bookingData = booking.toJSON();
        bookingData.Spot.previewImage = bookingData.Spot.SpotImages[0]?.url || null;
        delete bookingData.Spot.SpotImages;
        return bookingData;
    });

    return res.json({ Bookings: formattedBookings });
});

// Edit a booking
router.put('/:bookingId', requireAuth, async (req, res) => {
    const booking = await Booking.findByPk(req.params.bookingId);

    if (!booking) {
        return res.status(404).json({ 
            message: "Booking couldn't be found" 
        });
    }

    if (booking.userId !== req.user.id) {
        return res.status(403).json({ 
            message: "Forbidden" 
        });
    }

    if (new Date(booking.endDate) < new Date()) {
        return res.status(403).json({ 
            message: "Past bookings can't be modified" 
        });
    }

    const { startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Validate dates
    if (end <= start) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                endDate: "endDate cannot be on or before startDate"
            }
        });
    }

    if (start < now) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                startDate: "startDate cannot be in the past"
            }
        });
    }

    // Check for booking conflicts
    const existingBookings = await Booking.findAll({
        where: {
            spotId: booking.spotId,
            id: { [Op.ne]: booking.id },
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
                },
                {
                    [Op.and]: [
                        { startDate: { [Op.lte]: startDate } },
                        { endDate: { [Op.gte]: endDate } }
                    ]
                }
            ]
        }
    });

    if (existingBookings.length) {
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            errors: {
                startDate: "Start date conflicts with an existing booking",
                endDate: "End date conflicts with an existing booking"
            }
        });
    }

    // Update the booking
    await booking.update({
        startDate,
        endDate
    });

    return res.json({
        id: booking.id,
        spotId: booking.spotId,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
    });
});

// Delete a booking
router.delete('/:bookingId', requireAuth, async (req, res) => {
    const booking = await Booking.findByPk(req.params.bookingId, {
        include: {
            model: Spot
        }
    });

    if (!booking) {
        return res.status(404).json({ 
            message: "Booking couldn't be found" 
        });
    }

    // Check if user is either the booking owner or the spot owner
    if (booking.userId !== req.user.id && booking.Spot.ownerId !== req.user.id) {
        return res.status(403).json({ 
            message: "Forbidden" 
        });
    }

    // Check if booking has already started
    if (new Date(booking.startDate) <= new Date()) {
        return res.status(403).json({
            message: "Bookings that have been started can't be deleted"
        });
    }

    await booking.destroy();
    
    return res.json({ 
        message: "Successfully deleted" 
    });
});

module.exports = router;