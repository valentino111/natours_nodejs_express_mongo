/* eslint-disable */
import axios from 'axios';
import Stripe from 'stripe';

const stripe = Stripe(
  'pk_test_51NMv3PICrCtrlQJ2iuO6Qi3QGNLe5uh3QJpkDtnPuXPaJ2t5aLbE5reHrUGurUygObzF89X7tvfxUQ74BrbKrOf100UnRfrS8b'
);

export const bookTour = async (tourId) => {
  // 1) Get checkout session from API
  console.log('bookTour');
  const session = await axios(
    `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
  );
  console.log(session);

  // 2) Create checkout form + charge credit card
};
