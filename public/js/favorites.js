/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const createFavorite = async (userId, tourId) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/favorites',
      data: {
        userId,
        tourId,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Tour Added to Favorites!');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteFavorite = async (favoriteId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/favorites/${favoriteId}`,
    });

    if (res.status === 204) {
      showAlert('success', 'Tour Removed from Favorites.');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
