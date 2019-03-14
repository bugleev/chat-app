const express = require("express");
const { body } = require("express-validator/check");

const authController = require("../controllers/auth");
const socketController = require("../controllers/socket");
const isAuth = require("../middleware/isAuth");
const User = require("../models/user");

const router = express.Router();

router.post(
  "/auth/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Email not valid")
      .custom(async value =>
        (await User.findOne({ email: value }))
          ? Promise.reject("Email already exists")
          : true
      )
      .normalizeEmail(),
    body("password")
      .trim()
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
    body("name")
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);
router.post("/auth/login", authController.login);
router.post(
  "/auth/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("Email not valid")
      .normalizeEmail()
  ],
  authController.sendResetToken
);
router.post(
  "/auth/reset-password",
  [
    body("password")
      .trim()
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
    body("confirmPassword").custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Passwords don't match!");
      }
    })
  ],
  authController.resetPassword
);
router.post("/auth/reset-password/token", authController.verifyToken);
router.get("/download/:link", isAuth, socketController.downloadFile);

module.exports = router;
