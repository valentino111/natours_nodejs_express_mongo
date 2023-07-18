const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'Favorite must belong to a User!'],
  },
  tourId: {
    type: String,
    required: [true, 'Favorite must belong to a Tour!'],
  },
});

// favoriteSchema.pre(/^find/, function (next) {
//   this.populate('user').populate({
//     path: 'tour',
//     select: 'name',
//   });
//   next();
// });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
