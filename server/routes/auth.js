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
      .isLength({ min: 6 }),
    body("name")
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);
router.post("/login", authController.login);
// router.get("/test", isAuth, authController.getTest);

module.exports = router;
