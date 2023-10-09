const mongoose = require("mongoose"),
  adminModel = new mongoose.Schema(
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
      role: {
        type: String,
        required: false,
        default: "admin",
      },
    },
    { strict: false }
  );

module.exports = mongoose.model("admin", adminModel);
