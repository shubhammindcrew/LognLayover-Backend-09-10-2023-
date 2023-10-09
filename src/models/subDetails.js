const mongoose = require("mongoose"),
  typo = { type: String, required: true, default: null },
  subDetailsModel = new mongoose.Schema(
    {
      subId: typo,
      customerId: typo,
      subStatus: {
        type: Array,
        default: []
      },
      planId: typo,
      startDate: {
        type: Number, required: true, default: null
      },
      endDate: {
        type: Number, required: true, default: null
      },
      amount: { type: Number, required: true },
      vendorMail: typo,
    },
    { strict: false }
  );

module.exports = mongoose.model("subDetail", subDetailsModel);



