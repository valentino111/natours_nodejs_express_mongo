const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Favorite = require('../models/favoriteModel');

async function isTourBooked(res, tour) {
  const bookings = await Booking.find({ user: res.locals.user.id });
  const tourIDs = bookings.map((el) => el.tour.id);
  const isBooked = tourIDs.includes(tour.id);
  return isBooked;
}

async function getTourReviews(res, tour) {
  const reviews = await Review.find({
    user: res.locals.user.id,
    tour: tour.id,
  });

  return reviews;
}

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert = 'Your booking was successful!';
  }
  next();
};

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  let tours = await Tour.find();
  console.log(tours);

  // Get favorites data
  if (res.locals.user) {
    tours = await getToursWithFavorites(res, tours);
  }

  // Now the `toursWithFavorites` array contains each tour with `isFavorite` and `favoriteId` properties.

  // 2) Build template

  // 3( Render that template using tour data from 1)
  // console.log('tourWithFavorites: ', toursWithFavorites);
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // 2) Check if the tour is booked
  if (!res.locals.user) {
    return res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  }
  const isBooked = await isTourBooked(res, tour);
  // res.locals.isBooked = isBooked;

  // 3) Check if the tour was reviewed
  const reviews = await getTourReviews(res, tour);
  const isReviewed = reviews.length > 0;

  const favorites = await Favorite.find({ userId: res.locals.user.id });
  const tourIDs = favorites?.map((el) => el.tourId);
  const isFavotite = tourIDs?.includes(tour.id) ?? false;
  const favoriteId = favorites?.filter((el) => el.tourId === tour.id)[0]?.id;

  // 4) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    isBooked,
    isReviewed,
    isFavotite,
    favoriteId,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account',
  });
};

exports.getAddReviewForm = catchAsync(async (req, res) => {
  const tour = await Tour.find({ _id: req.query.tourId });
  const reviews = await getTourReviews(res, tour[0]);
  let reviewId;
  let reviewText;
  let selectedRating;
  if (reviews.length > 0) {
    reviewId = reviews[0].id;
    reviewText = reviews[0].review;
    selectedRating = reviews[0].rating;
  }

  res.status(200).render('review', {
    title: 'Add your review',
    tourName: tour[0].name,
    tourId: tour[0].id,
    reviewId,
    reviewText,
    selectedRating,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find our bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned ids
  const tourIDs = bookings.map((el) => el.tour);
  let tours = await Tour.find({ _id: { $in: tourIDs } });
  tours = await getToursWithFavorites(res, tours);

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getFavorites = catchAsync(async (req, res, next) => {
  // 1) Find our bookings
  const favorites = await Favorite.find({ userId: req.user.id });
  // console.log('favorites: ', favorites);

  // 2) Find tours with the returned ids
  const tourIDs = favorites.map((el) => el.tourId);
  let tours = await Tour.find({ _id: { $in: tourIDs } });
  tours = await getToursWithFavorites(res, tours);

  res.status(200).render('overview', {
    title: 'My Favorites',
    tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  // 1) Find our bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned ids
  const tourIDs = bookings.map((el) => el.tour);
  // console.log('tourIDs: ', tourIDs);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  // console.log('tours: ', tours);
  const reviews = await Review.find({ user: res.locals.user.id });
  // console.log('reviews: ', reviews);
  const tourIdsInReviews = reviews.map((review) => review.tour.toString());
  // console.log('tourIdsInReviews: ', tourIdsInReviews);
  const reviewedTours = tours.filter((tour) =>
    tourIdsInReviews.includes(tour.id)
  );

  // const tourReviews = reviewedTours.map((tour) => {
  // const tourReviewsText = reviews
  //   .filter((review) => review.tour.toString() === tour.id)
  //   .map((review) => review.review);

  //   return {
  //     ...tour,
  //     reviews: tourReviewsText,
  //   };
  // });

  res.status(200).render('myreviews', {
    title: 'My Reviews',
    reviewedTours,
    reviews,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
async function getToursWithFavorites(res, tours) {
  const favorites = await Favorite.find({ userId: res.locals.user.id });
  const tourIDs = favorites?.map((el) => el.tourId);

  const toursWithFavorites = tours.map((tour) => {
    const isFavorite = tourIDs?.includes(tour.id) ?? false;
    const favorite = favorites?.find((el) => el.tourId === tour.id);
    const favoriteId = favorite?.id;

    return {
      ...tour.toObject(),
      isFavorite,
      favoriteId,
    };
  });
  return toursWithFavorites;
}
