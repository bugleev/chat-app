const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("../routes/auth");
const cleanupJob = require("../util/cleanup");

const app = express();

const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
};
app.use(allowCrossDomain);

// app.use(express.static(path.join(__dirname, "../../client")));

// app.get("/", (req, res, next) => res.sendFile(__dirname + "./index.html"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use((req, res, next) => {
//   var err = null;
//   try {
//     decodeURIComponent(req.path);
//   } catch (e) {
//     const error = new Error("Invalid URL!");
//     error.statusCode = 400;
//     next(error);
//   }
// });
app.use(authRoutes);
// handle server errors
app.use((error, req, res, next) => {
  const { statusCode = 500, message = "", data = [] } = error;
  const details = data.length
    ? ` Details: ${data.map(el => el.msg || "").join(" ")}`
    : "";
  res.status(statusCode).json({
    message: `${message}${details}`
  });
});

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
      server.timeout = 10000;
      connectedSocket = require("./socketServer").init(server);
      connectedSocket.watchConnection();
      cleanupJob.start();
    })
    .catch(err => console.log(err));
  done();
};

// exports.stopServer = done => {
//   ioServer.close(() => {
//     httpServer.close(() => {
//       done();
//     });
//   });
// };
