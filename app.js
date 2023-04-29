const expess = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const tourRouter = require('./routes/tourRouts');
const userRouter = require('./routes/userRouts');

const app = expess();

// 1) GLOBAL MIDDLEWARES

// Set securityt HHT headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please tryagain in an hour',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(expess.json({ limit: '10kb' }));

// Serving static files
app.use(expess.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  console.log('Hello form the middleware!');
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
