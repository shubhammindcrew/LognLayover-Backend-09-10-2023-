const userRoutes = require("./user-routes"),
  vendorRoutes = require("./vendor-routes"),
  vendorAuthRoutes = require("./vendor-auth-routes"),
  adminRoutes = require("./admin-routes"),
  adminAuthRoutes = require("./admin-auth-routes"),
  webhook = require("./webhook"),
  contactUsRoutes = require("./contactUs-routes");

routes = {
  userRoutes,
  adminRoutes,
  adminAuthRoutes,
  vendorRoutes,
  vendorAuthRoutes,
  webhook,
  contactUsRoutes,
};

module.exports = routes;
