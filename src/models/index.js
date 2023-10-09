const vendorModel = require("./vendors"),
  blogModel = require("./blogs"),
  destinationModel = require("./destination"),
  adminModel = require("./admin"),
  subPayDetailsModel = require("./subPayDetails"),
  subDetailsModel = require("./subDetails"),
  cardModel = require("./cards"),
  letterModel = require("./weeklyLetter"),
  airportModel = require("./airports"),
  userModel = require("./user"),
  contactUsModel = require("./contactUs");
models = {
  vendorModel,
  blogModel,
  adminModel,
  destinationModel,
  subPayDetailsModel,
  subDetailsModel,
  cardModel,
  letterModel,
  airportModel,
  userModel,
  contactUsModel,
};

module.exports = models;
