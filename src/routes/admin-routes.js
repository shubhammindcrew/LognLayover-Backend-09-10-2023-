var express = require("express"),
  app = express(),
  router = express.Router({
    caseSensitive: true,
  }),
  { adminController } = require("../controllers/index");

router.post("/signUp", adminController.signUp);
router.post("/login", adminController.login);
// router.post("/test", adminController.test);

module.exports = router;
