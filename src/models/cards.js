const mongoose = require("mongoose"),
  typo = { type: String, required: true, default: null },
  cardModel = new mongoose.Schema(
    {
      customerId: typo,
      payId: typo,
      vendorMail: typo,
      fingerprint: typo,
    },
    { strict: false }
  );

module.exports = mongoose.model("card", cardModel);
