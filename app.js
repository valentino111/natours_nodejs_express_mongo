const expess = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRouts');
const userRouter = require('./routes/userRouts');

const app = expess();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(expess.json());

app.use(expess.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello form the middleware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

module.exports = app;
