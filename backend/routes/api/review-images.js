// backend/routes/api/review-images.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { ReviewImage, Review } = require('../../db/models');

// Delete a Review Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const image = await ReviewImage.findByPk(req.params.imageId, {
        include: Review
    });

    if (!image) {
        return res.status(404).json({ message: "Review Image couldn't be found" });
    }

    if (image.Review.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await image.destroy();
    return res.json({ message: "Successfully deleted" });
});

module.exports = router;
