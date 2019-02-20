const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const session = require("express-session");
// const MongoDBStore = require("connect-mongodb-session")(session);
// const csrf = require("csurf");
// const flash = require("connect-flash");
require("dotenv").config();

const errorController = require("./controllers/error");
const authRoutes = require("./routes/auth");
const User = require("./models/user");

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

// const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname, "public")));

// app.use(flash());

// app.use((req, res, next) => {
//   res.locals.isAuthenticated = req.session.isLoggedIn;
//   next();
// });

// app.use((req, res, next) => {
//   // throw new Error('Sync Dummy');
//   if (!req.session.user) {
//     return next();
//   }
//   User.findById(req.session.user._id)
//     .then(user => {
//       if (!user) {
//         return next();
//       }
//       req.user = user;
//       next();
//     })
//     .catch(err => {
//       next(new Error(err));
//     });
// });

// app.use(csrfProtection);
// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

app.use(authRoutes);

// app.get("/500", errorController.get500);

// app.use(errorController.get404);

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

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true
  })
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`server started at port ${process.env.PORT}`)
    );
  })
  .catch(err => console.log(err));
