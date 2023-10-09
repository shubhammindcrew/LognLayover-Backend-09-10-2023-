require("dotenv").config();
const jwt = require("jsonwebtoken"),
  // { JWT_SECRET_KEY } = require("../config"),

  jwtHelper = {
    sign: async (email, password, date) =>
      new Promise((resolve, reject) =>
        jwt.sign(
          { email, password, date },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "7d" },
          (error, result) => (error ? reject(error) : resolve(result))
        )
      ),

    verify: async (token) =>
      new Promise((resolve, reject) =>
        jwt.verify(token, `${JWT_SrejectECRET_KEY}`, (error, result) =>
          error ? error : resolve(result)
        )
      ),
  };

module.exports = jwtHelper;
