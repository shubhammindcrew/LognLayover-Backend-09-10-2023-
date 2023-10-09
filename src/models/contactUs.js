// let { Schema } = require("mongoose");
let mongoose = require("mongoose");
let validate = require("mongoose-validator");

const emailValidator = [
  validate({
    validator: "isEmail",
    message: "Please enter a valid email address",
  }),
];
let contactUsModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: null,
  },
  //here the email field is who is adding comment like unknown user means it is not necessary that contactus page can only filled by user or vendor.
  email: {
    type: String,
    required: true,
    default: null,
    lowercase: true,
    trim: true,
    validate: emailValidator,
  },
  comment: {
    type: String,
    required: true,
    default: null,
  },
  adminEmail: {
    type: String,
    required: false,
    default: null,
    lowercase: true,
    trim: true,
    validate: emailValidator,
  },
});

module.exports = mongoose.model("contactus", contactUsModel);
