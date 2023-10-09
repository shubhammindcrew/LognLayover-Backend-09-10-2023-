let jwt = require("jsonwebtoken");
require("dotenv").config();

let verifyToken = (req, res, next) => {
  let getToken = req.headers.authorization;
  if (!getToken) {
    return res.json({
      status: Boolean(false),
      message: "No token has provided",
    });
  }

  let splitToken = getToken.split(" ");
  if (getToken && splitToken[0] == "Bearer") {
    let token = splitToken[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (error, data) {
      if (data) {
        req.userEmail = data.email;
        next();
      } else {
        if (error.name == "TokenExpiredError") {
          return res.json({
            status: Boolean(false),
            message: error.message ? error.message : "your token has expired",
          });
        } else {
          return res.json({
            status: Boolean(false),
            message: "Invalid token",
          });
        }
      }
    });
  }
};
module.exports = verifyToken;
