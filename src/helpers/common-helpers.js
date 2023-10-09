var {
  subDetailsModel,
  vendorModel,
  subPayDetailsModel,
  cardModel,
} = require("../models");

const commonHelpers = {
  somethingWentWrong: (error, res) => {
    console.log(error, "err");
    res.json({
      status: Boolean(false),
      message: "Something went wrong",
      error: error.message ? error.message : error,
    });
  },
  invalidCredentials: (res) =>
    res.json({ status: Boolean(false), message: "Invalid credentials" }),
  subscribeVendor: async (data, res) => {
    try {
      const {
          subId,
          customerId,
          subStatus,
          payStatus,
          planId,
          amount,
          startDate,
          vendorMail,
          payId,
          payIntentId,
          last4,
          clientSecret,
          fingerprint,
          saveCard,
          invoicePdf,
          endDate,
        } = data,
        user = await vendorModel.findOne({ email: vendorMail }),
        newSub = await new subDetailsModel({
          subId,
          customerId,
          vendorMail,
          planId,
          startDate,
          endDate,
          amount,
          subStatus: [subStatus],
          invoicePdf,
        }).save(),
        newPay = await new subPayDetailsModel({
          subId,
          customerId,
          payId,
          payIntentId,
          payStatus,
          vendorMail,
          invoicePdf,
        }).save();
      console.log({ newSub });
      if (saveCard) {
        var cardSaved = await new cardModel({
          customerId,
          payId,
          vendorMail,
          fingerprint,
          last4,
        }).save();
        console.log({ cardSaved });
      }
      const updateVendor = await vendorModel.findOneAndUpdate(
        { email: vendorMail },
        { subscription: payStatus == "succeeded" ? true : false },
        { new: true, runValidators: true }
      );
      if (payStatus == "succeeded") {
        return res.json({
          status: Boolean(true),
          userData: {
            name: updateVendor.name,
            email: updateVendor.email,
            subscription: updateVendor.subscription,
            cardSaved: cardSaved ? Boolean(true) : Boolean(false),
          },
          message: "Payment successful",
        });
      }
      if (payStatus == "requires_action") {
        return res.json({
          status: Boolean(true),
          userData: {
            name: updateVendor.name,
            email: updateVendor.email,
            subscription: updateVendor.subscription,
            cardSaved: cardSaved ? Boolean(true) : Boolean(false),
          },
          sData: {
            clientSecret: clientSecret,
            actionRequired: true,
            id: payIntentId,
          },
          message: "3D Secure required",
        });
      } else
        return res.json({
          status: Boolean(false),
          userData: {
            name: updateVendor.name,
            email: updateVendor.email,
            subscription: updateVendor.subscription,
            cardSaved: cardSaved ? Boolean(true) : Boolean(false),
          },
          message: "Payment Failed",
        });
    } catch (error) {
      return commonHelpers.somethingWentWrong(error, res);
    }
  },
};

module.exports = commonHelpers;
