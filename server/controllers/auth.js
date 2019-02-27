const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const User = require("../models/user");
const io = require("../socketServer");

// NOTE: all errors are forwarded by next() callback, to handle them all in the root(server.js)

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  // io.getServer().emit
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
exports.sendResetToken = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userInDB = await User.findOne({ email });
    if (!userInDB) {
      const error = new Error("No account with that email exists");
      error.statusCode = 400;
      throw error;
    }
    userInDB.resetToken = crypto.randomBytes(20).toString("hex");
    userInDB.resetTokenExpires = Date.now() + 3600000;
    await userInDB.save();
    const resetURL = `http://${req.headers.host}/reset/${userInDB.resetToken}`;
    await sgMail.send({
      to: email,
      from: "da-chat@dataart.com",
      subject: "Password reset request",
      html: `<h1>Follow the link to reset your password</h1> <a href=${resetURL}>Reset password</a>`,
      text: "test example"
    });
    return res.status(200).json({
      success: true,
      body: { message: `Check your email!` }
    });
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
exports.verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userInDB = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
    if (!userInDB) {
      const error = new Error("Password reset token is invalid or has expired");
      error.statusCode = 400;
      throw error;
    }
    return res.status(200).json({
      success: true,
      body: { message: `You can reset your password!`, id: userInDB._id }
    });
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    const { password, userId } = req.body;
    const userInDB = await User.findById(userId);
    if (!userInDB) {
      const error = new Error("No user found!");
      error.statusCode = 400;
      throw error;
    }
    userInDB.password = await bcrypt.hash(password, 12);
    userInDB.resetToken = undefined;
    userInDB.resetTokenExpires = undefined;
    await userInDB.save();
    return res.status(200).json({
      success: true,
      body: { message: `Your password was reset!` }
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
