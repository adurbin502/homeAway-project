// backend/routes/api/bookings.js
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
            attributes: {
                exclude: ['description', 'createdAt', 'updatedAt']
            },
            include: {
                model: SpotImage,
                where: { preview: true },
                required: false,
                attributes: ['url']
            }
        }
    });

    const formatted = bookings.map(booking => {
        const bookingJson = booking.toJSON();
        bookingJson.Spot.previewImage = bookingJson.Spot.SpotImages[0]?.url || null;
        delete bookingJson.Spot.SpotImages;
        return bookingJson;
    });

    res.json({ Bookings: formatted });
});

// Edit a booking
router.put('/:bookingId', requireAuth, async (req, res, next) => {
    const { bookingId } = req.params;
    const { startDate, endDate } = req.body;
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
    }
    if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }
    if (new Date(endDate) <= new Date(startDate)) {
        return res.status(400).json({
            message: 'Bad Request',
            errors: { endDate: 'endDate cannot be on or before startDate' }
        });
    }
    if (new Date(startDate) < new Date()) {
        return res.status(400).json({
            message: 'Bad Request',
            errors: { startDate: 'startDate cannot be in the past' }
        });
    }

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

    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();
    res.json(booking);
});

// Delete a booking
router.delete('/:bookingId', requireAuth, async (req, res) => {
    const booking = await Booking.findByPk(req.params.bookingId, {
        include: Spot
    });

    if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
    }
    if (
        booking.userId !== req.user.id &&
        booking.Spot.ownerId !== req.user.id
    ) {
        return res.status(403).json({ message: "Forbidden" });
    }

    if (new Date(booking.startDate) <= new Date()) {
        return res.status(403).json({
            message: "Bookings that have been started can't be deleted"
        });
    }

    await booking.destroy();
    res.json({ message: 'Successfully deleted' });
});

module.exports = router;