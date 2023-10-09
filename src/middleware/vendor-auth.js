const { vendorModel } = require("../models"),
  { verify } = require("../helpers");

vendorAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization,
      invalidLogin = () =>
        res.json({ status: Boolean(false), message: "Invalid Login" });

    if (!token) {
      return invalidLogin();
    } else {
      await verify(token.split(" ")[1]);
      return next();
    }
  } catch (error) {
    return res.json({
      status: Boolean(false),
      message: "Something went wrongg",
      error: error.message ? error.message : error,
    });
  }
};

module.exports = vendorAuth;
