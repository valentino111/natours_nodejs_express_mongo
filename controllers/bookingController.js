const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

async function getPricesByProductId(productId) {
  const prices = await stripe.prices.list({
    product: productId,
  });

  return prices.data[0];
}

async function getProductByName(name) {
  const products = await stripe.products.list();

  const product = products.data.find((prod) => prod.name === name);

  if (!product) {
    console.log('Product not found');
    return null;
  }

  return product;
}

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  let product = await getProductByName(tour.name);
  if (!product) {
    // Create a product
    product = await stripe.products.create({
      name: tour.name, // Replace with your desired product name
      description: tour.description, // Optional: Replace with your product description
      images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], // Optional: Replace with your product image URL(s)
    });
  }

  let price = await getPricesByProductId(product.id);
  console.log('Price:', price);

  if (!price) {
    // Create a price object
    price = await stripe.prices.create({
      unit_amount: tour.price * 100, // Amount in the smallest currency unit (e.g., cents)
      currency: 'usd',
      product: product.id, // Replace with your actual product ID
      // type: 'one_time',
    });
  }

  // 2) Create checkout session

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price: price.id, // Replace 'your_price_id' with your actual price ID
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) Create session as Response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // Temp solution
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
