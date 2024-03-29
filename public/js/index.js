/* eslint-disable */
import '@babel/polyfill';
import { bookTour } from './stripe';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { signup } from './signup';
import { addReview, updateReview } from './review';
import { createFavorite, deleteFavorite } from './favorites';
import { updateSettings } from './updateSettings';
import { showAlert } from './alerts';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const reviewForm = document.querySelector('.form--review');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const addFavoritesBtn = document.getElementById('add-favotites');
const deleteFavoritesBtn = document.getElementById('remove-favotites');
const heartButtons = document.querySelectorAll('.btn.heart-button');

// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    signup(name, email, password, passwordConfirm);
  });
}

if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const review = document.getElementById('text').value;
    const rating = document.getElementById('rating').value;

    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('tourId');
    const reviewId = document.getElementById('reviewId').value;
    console.log('reviewId: ', reviewId);

    if (!reviewId) await addReview(review, rating, tourId);
    else await updateReview(reviewId, review, rating);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if (addFavoritesBtn) {
  addFavoritesBtn.addEventListener('click', (e) => {
    const { tourId, userId } = e.target.dataset;
    // console.log('addFavoritesBtn:: tourId: ', tourId, 'userId: ', userId);
    createFavorite(userId, tourId);
  });
}

if (deleteFavoritesBtn) {
  deleteFavoritesBtn.addEventListener('click', (e) => {
    const { favoriteId } = e.target.dataset;
    // console.log('favoriteId: ', favoriteId);
    deleteFavorite(favoriteId);
  });
}

if (heartButtons) {
  heartButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const favoriteId = button.dataset.favoriteId;
      if (favoriteId) {
        // console.log('heartButtons:: favoriteId: ', favoriteId);
        deleteFavorite(favoriteId);
      } else {
        const { tourId, userId } = button.dataset;
        // console.log('heartButtons:: tourId: ', tourId, 'userId: ', userId);
        await createFavorite(userId, tourId);
      }
    });
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
