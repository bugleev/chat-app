const express = require("express");
const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/isAuth");
const User = require("../models/user");

const router = express.Router();

router.post(
  "/signup",
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
router.post("/login", authController.login);
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("Email not valid")
      .normalizeEmail()
  ],
  authController.sendResetToken
);
router.post(
  "/reset-password",
  [
    body("password")
      .trim()
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
    body("confirmPassword")
      .trim()
      .not()
      .isEmpty()
  ],
  authController.resetPassword
);
router.post("/reset-password/token", authController.verifyToken);
// router.get("/test", isAuth, authController.getTest);

module.exports = router;
