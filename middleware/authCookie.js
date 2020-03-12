const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(private, path) {
  return function(req, res, next) {
    
    // Get token from header
    const token = req.cookies.token;

    // Check if token avraible is not null and if the token provided is legit
    if (token && jwt.verify(token, config.get("jwtSecret"))) {
      if (!private) {
        return res.redirect(path);
      }
    } else {
      if (private) {
        return res.redirect(path);
      }
    }

    next();
  };
};