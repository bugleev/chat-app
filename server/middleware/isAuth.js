const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authError = new Error("Server authentification failed!");
  authError.statusCode = 401;

  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw authError;
  }
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw authError;
  }
  if (!decodedToken) {
    throw authError;
  }
  req.userId = decodedToken.userId;
  next();
};
