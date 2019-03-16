const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const serverPath = require("../util/path");
const appRoutes = require("../routes");
const cleanupJob = require("../util/cleanup");

const app = express();

const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
};

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(appRoutes);

// handle server errors ('next' needs to be in params to work)
// eslint-disable-next-line
app.use((error, req, res, next) => {
  const { statusCode = 500, message = "", data = [] } = error;
  const details = data.length
    ? ` Details: ${data.map(el => el.msg || "").join(" ")}`
    : "";
  res.status(statusCode).json({
    message: `${message}${details}`
  });
});

// check if uploads folder exist
if (!fs.existsSync(path.join(serverPath, process.env.UPLOADS_DIR))) {
  fs.mkdirSync(path.join(serverPath, process.env.UPLOADS_DIR));
}

exports.startServer = done => {
  let connectedSocket;
  mongoose
    .connect(process.env.MONGO_DB, {
      useNewUrlParser: true
    })
    .then(() => {
      const server = app.listen(process.env.PORT, () =>
        console.log(`server started at port ${process.env.PORT}`)
      );
      // this line solves some socketio reconnect bugs
      server.timeout = 10000;

      connectedSocket = require("./socketServer").init(server);
      connectedSocket.watchConnection();
      // start cron job for clearing uploads folder
      cleanupJob.start();
    })
    .catch(err => console.log(err));
  done();
};
