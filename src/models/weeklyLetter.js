const mongoose = require("mongoose"),
  typo = {
    type: String,
    required: true,
    default: null,
  },
  letterModel = new mongoose.Schema(
    {
      email: typo,
      airportName: typo,
      airportCode: typo,
    },
    { strict: false }
  );

module.exports = mongoose.model("letterModel", letterModel);
