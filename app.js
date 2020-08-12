const fs = require('fs');
const path = require('path');

const Cabin = require('cabin');
const Email = require('email-templates');
const bodyParser = require('body-parser');
const cryptoRandomString = require('crypto-random-string');
const dayjs = require('dayjs');
const express = require('express');
const isSANB = require('is-string-and-not-blank');
const requestId = require('express-request-id');
const requestReceived = require('request-received');
const responseTime = require('response-time');
const { Signale } = require('signale');
const { isEmail } = require('validator');

// create persistent email queue file if it doesn't already exist
// note you could swap out this for MongoDB (e.g. Mongoose), SQL, Redis, etc
// as Bree will read and update this file every few seconds to flush teh queue
const queueFile = path.join(__dirname, 'queue.json');
if (!fs.existsSync(queueFile)) fs.writeFileSync(queueFile, JSON.stringify([]));

// initialize email-templates
const email = new Email({
  message: {
    from: 'from@example.com'
  },
  transport: {
    jsonTransport: true
  }
});

// initialize cabin
const cabin = new Cabin({
  axe: {
    logger: new Signale()
  }
});

// initialize express
const app = express();

// adds request received hrtime and date symbols to request object
// (which is used by Cabin internally to add `request.timestamp` to logs
app.use(requestReceived);

// adds `X-Response-Time` header to responses
app.use(responseTime());

// adds or re-uses `X-Request-Id` header
app.use(requestId());

// use the cabin middleware (adds request-based logging and helpers)
app.use(cabin.middleware);

// support parsing of url encoded data
app.use(bodyParser.urlencoded({ extended: false }));

// support parsing of application/json data
app.use(bodyParser.json());

// test endpoint
app.get('/test', (req, res) => {
  res.sendStatus(200);
});

// send email test endpoint
app.post('/send-email', async (req, res, next) => {
  try {
    // validate email
    if (!isSANB(req.body.email) || !isEmail(req.body.email))
      throw new Error('Email was invalid');

    // send email
    await email.send({
      message: {
        to: req.body.email,
        subject: 'Hello, World!',
        html: '<p>Hello, World!</p>'
      }
    });

    // send response
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

// ticket booking endpoint
app.post('/book-ticket', async (req, res, next) => {
  try {
    // validate email
    if (!isSANB(req.body.email) || !isEmail(req.body.email))
      throw new Error('Email was invalid');

    const movieTime = isSANB(req.body.start_time)
      ? dayjs(req.body.start_time, 'M/D/YY h:mm A')
      : false;

    if (!movieTime || !movieTime.isValid())
      throw new Error('Movie time is invalid (must be M/D/YY h:mm A) format');

    // add an email to the queue for this ticket we booked (subtract 10 mins from start time)
    let queue = [];
    try {
      queue = require(queueFile);
    } catch (err) {
      cabin.debug(err);
    }

    queue.push({
      id: cryptoRandomString({ length: 10 }),
      email: req.body.email,
      send_at: movieTime.subtract(10, 'minutes').toDate()
    });
    await fs.promises.writeFile(queueFile, JSON.stringify(queue));

    // send email
    await email.send({
      message: {
        to: req.body.email,
        subject: 'Booking Confirmed',
        html: '<p>Your booking is confirmed!</p>'
      }
    });

    // send response
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

app.listen(8080, () => {
  cabin.info('App started: http://localhost:8080');
});
