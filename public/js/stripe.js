import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripePublicKey =
    'pk_test_51NMv3PICrCtrlQJ2iuO6Qi3QGNLe5uh3QJpkDtnPuXPaJ2t5aLbE5reHrUGurUygObzF89X7tvfxUQ74BrbKrOf100UnRfrS8b';

  try {
    // 1) Get checkout session from API
    const response = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    const session = response.data.session;

    // 2) Initialize Stripe
    const stripe = await loadStripe(stripePublicKey);

    // 3) Redirect to checkout
    await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
