const expess = require('express');
const authController = require('../controllers/authController');
const favoriteController = require('../controllers/favoriteController');

const router = expess.Router({ mergeParams: true });

router.use(authController.protect);

// router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(favoriteController.getAllFavorites)
  .post(authController.restrictTo('user'), favoriteController.createFavorite);

router
  .route('/:id')
  .get(favoriteController.getFavorite)
  .patch(favoriteController.updateFavorite)
  .delete(favoriteController.deleteFavorite);

module.exports = router;
