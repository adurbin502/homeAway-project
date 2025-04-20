// backend/routes/api/index.js
const express = require('express');
const router = express.Router();

const { restoreUser } = require('../../utils/auth');

// Connect restoreUser middleware to every request
router.use(restoreUser);

// Attach route files
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const reviewsRouter = require('./reviews.js');
const bookingsRouter = require('./bookings.js');
const spotImagesRouter = require('./spot-images.js');
const reviewImagesRouter = require('./review-images.js');

// Mount routers at their paths
router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/spots', spotsRouter);
router.use('/reviews', reviewsRouter);
router.use('/bookings', bookingsRouter);
router.use('/spot-images', spotImagesRouter);
router.use('/review-images', reviewImagesRouter);

// Keep this route for frontend testing in Mod 5
router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;


