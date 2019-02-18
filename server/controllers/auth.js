const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Registration failed!");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const { email, name, password } = req.body;
    const user = new User({
      email: email,
      username: name,
      password: await bcrypt.hash(password, 12)
    });
    const savedUser = await user.save();
    return res.status(201).json({
      success: true,
      body: { id: savedUser._id.toString() }
    });
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userInDB = await User.findOne({ email });
    const isPassOk = userInDB
      ? await bcrypt.compare(password, userInDB.password)
      : null;
    if (!isPassOk || !userInDB) {
      const error = new Error("Invalid username / password pair");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: userInDB.email,
        userId: userInDB._id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      success: true,
      body: { token, id: userInDB._id.toString() }
    });
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
// exports.getTest = async (req, res, next) => {
//   try {
//     console.log("req.body:", req.userId);
//   } catch (err) {
//     err.statusCode = err.statusCode || 500;
//     next(err);
//   }
// };
