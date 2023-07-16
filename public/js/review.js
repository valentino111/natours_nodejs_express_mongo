/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const addReview = async (review, rating, tourId) => {
  try {
    // console.log('addReview');
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tourId}/reviews`,
      data: {
        rating,
        review,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review Submitted successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
