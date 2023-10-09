const vendorAuth = require("./vendor-auth"),
  adminAuth = require("./admin-auth"),
  verifyToken = require("./verify-token"),
  verifySub = require("./verify-sub"),
  verifyUserToken = require("./verify-usertoken"),
  verifyAdminToken = require("./verify-admintoken");
auth = {
  vendorAuth,
  adminAuth,
  verifyToken,
  verifySub,
  verifyUserToken,
  verifyAdminToken,
};

module.exports = auth;
