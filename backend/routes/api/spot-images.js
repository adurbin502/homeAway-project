// backend/routes/api/spot-images.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { SpotImage, Spot } = require('../../db/models');

// Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const image = await SpotImage.findByPk(req.params.imageId, {
        include: Spot
    });

    if (!image) {
        return res.status(404).json({ message: "Spot Image couldn't be found" });
    }

    if (image.Spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await image.destroy();
    return res.json({ message: "Successfully deleted" });
});

module.exports = router;