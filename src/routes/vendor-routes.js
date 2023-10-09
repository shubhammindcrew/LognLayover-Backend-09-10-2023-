var express = require("express"),
  app = express(),
  router = express.Router({
    caseSensitive: true,
  }),
  { vendorController } = require("../controllers");

router.post("/signUp", vendorController.signUp);
router.post("/login", vendorController.login);
router.post("/test", vendorController.test);

router.post("/forgotPassword", vendorController.forgotPassword);
router.post("/confirmPassResetOTP", vendorController.confirmPassResetOTP);

module.exports = router;
