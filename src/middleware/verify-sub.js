const {
    airportModel,
    destinationModel,
    vendorModel,
    blogModel,
    subDetailsModel,
    subPayDetailsModel,
    cardModel,
    letterModel,
  } = require("../models"),
  { stripeHelper } = require("../helpers");

const verifySub = async (req, res, next) => {
  try {
    var vendor = await vendorModel.findOne({ email: req.vendorEmail }),
      subDetails = await subDetailsModel.find({
        vendorMail: req.vendorEmail,
      });

    (sub = await stripeHelper.retrieveSubscription(
      subDetails[subDetails.length - 1].subId
    )),
      (datee = Date.now());

    const updateSub = await subDetailsModel.findOneAndUpdate(
      { vendorMail: req.vendorEmail, subId: sub.id },
      {
        endDate: sub.current_period_end * 1000,
        startDate: sub.current_period_start * 1000,
      },
      { new: true, runValidators: true }
    );

    console.log({ a: sub.status });
    if (
      sub.status == "canceled" &&
      Math.floor(datee / 1000) > Math.floor(updateSub.endDate / 1000)
    ) {
      var vendor = await vendorModel.findOneAndUpdate(
        { email: req.vendorEmail },
        { subscription: false }
      );
      console.log("inner");
      return res.json({
        status: Boolean(false),
        message: "Please Subscribe",
      });
    } else next();
  } catch (error) {
    res.json({ error });
  }
};

module.exports = verifySub;
