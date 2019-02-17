const express = require("express");
const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/isAuth");
const User = require("../models/user");

const router = express.Router();

router.post("/signup", authController.postSignup);

module.exports = router;
