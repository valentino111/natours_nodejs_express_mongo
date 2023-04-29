const mongoose = require('mongoose');

// const slugify = require('slugify');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have a content'],

      maxlength: [
        200,
        'A tour name must have less or equal then 200 characters',
      ],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
    },
    slug: String,
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: 1,
      max: 5,
    },
    createsAt: {
      type: Date,
      default: Date.now(),
      select: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// DOCUMENT MIDDLEWARE: runs before .save() and .create()

// QUARY MIDDLEWARE

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '-__v -passwordChangedAt',
  });
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    // select: '-__v -passwordChangedAt',
  });
  next();
});

// AGGREGATION MIDDLEWARE

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
