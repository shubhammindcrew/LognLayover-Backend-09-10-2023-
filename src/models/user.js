const { string } = require("joi");

const mongoose = require("mongoose"),
  userModel = new mongoose.Schema(
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
      code: {
        type: Number,
        required: false,
        default: null,
      },
      //here role is specify whether the person is vendor or user
      role: {
        type: String,
        required: false,
        enum: ["user"],
        default: "user",
      },
    },
    { strict: false }
  );

module.exports = mongoose.model("user", userModel);
