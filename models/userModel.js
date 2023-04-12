const mongoose = require('mongoose');

const slugify = require('slugify');

const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
      maxlength: [40, 'A user name must have less or equal then 40 characters'],
      minlength: [2, 'A user name must have more or equal then 2 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'The tour name must only contain characters',
      // ],
    },
    slug: String,
    email: {
      type: String,
      required: [true, 'A tour must have an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: [8, 'The password must have at least 8 characters.'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'User must have a password confirmation'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
