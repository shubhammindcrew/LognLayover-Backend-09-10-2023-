const mongoose = require("mongoose"),
  typo = { type: String, required: true, default: null },
  subPayDetailsModel = new mongoose.Schema(
    {
      subId: typo,
      customerId: typo,
      payId: typo,
      payIntentId: typo,
      payStatus: typo,
      vendorMail: typo,
      invoicePdf: typo,
    },
    { strict: false }
  );

module.exports = mongoose.model("subPayDetail", subPayDetailsModel);
