const User = require("../models/user");

exports.postSignup = (req, res, next) => {
  console.log("req:", req.body.email);
  console.log("req:", req.body.name);
  console.log("req:", req.body.password);
  User.findOne({ email: req.body.email })
    .then(userDoc => {
      console.log(userDoc);
      if (userDoc) {
        return res.status(400).json({
          success: false,
          redirectUrl: null,
          message: "user exists"
        });
      } else {
        return res.status(200).json({
          success: true,
          redirectUrl: "/login",
          message: null
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
};
