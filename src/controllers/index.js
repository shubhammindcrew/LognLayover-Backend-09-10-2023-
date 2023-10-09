const userController = require("./user-controller"),
  vendorController = require("./vendor-controller"),
  adminController = require("./admin-controller"),
  webhookController = require("./webhook-controller"),
  contactUsController = require("./contactUs-controller"),
  controller = {
    userController,
    adminController,
    vendorController,
    webhookController,
    contactUsController,
  };

module.exports = controller;
