const mongoose = require("mongoose"),
  vendorModel = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        minLength: 2,
        default: null,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        default: null,
      },
      password: {
        type: String,
        required: true,
        default: null,
      },
      subscription: {
        type: Boolean,
        required: false,
        default: false,
      },
      code: {
        type: Number,
        required: false,
        default: null,
      },
      role: {
        type: String,
        required: false,
        enum: ["vendor"],
        default: "vendor",
      },
    },
    { strict: false }
  );

module.exports = mongoose.model("vendor", vendorModel);
