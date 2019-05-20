/* eslint no-console: "off" */
const socketIoPort = 2222;

const express = require('express');

// This is optional. If your server uses socket.io already, pass it to config as `webserver` along with it's port.
const socketio = require('socket.io')(socketIoPort);

const app = express();
const port = process.env.PORT || 3000;

app.use(
  require('../index')({
    path: '/',
    // Use existing socket.io instance.
    // websocket: socketio,

    // Ignore requests which req.path begins with
    // ignoreStartsWith: '/return-status',

    // Pass socket.io instance port down to config.
    // Use only if you're passing your own instance.
    // port: socketIoPort,
    healthChecks: [
      {
        protocol: 'http',
        host: 'localhost',
        port: 3000,
        path: '/admin/health/ex1',
        headers: {},
      },
      {
        protocol: 'http',
        host: 'localhost',
        port: 3000,
        path: '/return-status/200',
        headers: {},
      },
      {
        protocol: 'http',
        host: 'localhost',
        port: 3000,
        path: '/user/create',
        headers: {},
        requestmethod: 'POST',
        requestbody:{user:'test'}
      },
    ],
  }),
);
app.use(require('express-favicon-short-circuit'));

// Example route throwing requested status code
app.get('/return-status/:statusCode', (req, res) =>
  res.sendStatus(req.params.statusCode),
);

// Example POST request
const UserRouter = express.Router();
UserRouter.route('/create').post(function (req, res) {
    console.log(req.query)
    res.json('User added successfully');
});
app.use('/user', UserRouter);


app.listen(port, () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});
