const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
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

  // console.log('Products: ', products);

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
      images: [
        `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
      ], // Optional: Replace with your product image URL(s)
    });
  }

  let price = await getPricesByProductId(product.id);
  // console.log('Price on getPricesByProductId: ', price);

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
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
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

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // Temp solution
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  console.log('Incide createBookingCheckout!, session: ', session);
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  // const priceObj = await stripe.prices.retrieve(session.line_items[0].price);
  // console.log('line_items: ', session.line_items[0]);
  // console.log('priceObj: ', priceObj);
  // const price = priceObj.unit_amount / 100;
  const price = session.amount_total / 100;
  // console.log('Price on createBookingCheckout: ', price);
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    console.log(event.data.object);
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
