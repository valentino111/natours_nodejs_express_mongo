const expess = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = expess.Router({ mergeParams: true });

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
