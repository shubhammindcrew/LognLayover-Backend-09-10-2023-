const { adminModel } = require("../models"),
  { verify } = require("../helpers");

adminAuth = async (req, res, next) => {
  try {
    const { email } = req.body.userData,
      token = req.headers.authorization,
      invalidLogin = () =>
        res.json({ status: Boolean(false), message: "Invalid Login" }),
      adminFound = await adminModel.findOne({ email });
    if (adminFound && token.split(" ")[0] == "Bearer")
      return (await verify(token.split(" ")[1], email))
        ? next()
        : invalidLogin();
    else return invalidLogin();
  } catch (error) {
    return res.json({
      status: Boolean(false),
      message: "Something went wrong",
      error: error.message ? error.message : error,
    });
  }
};

module.exports = adminAuth;
