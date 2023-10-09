let express = require("express");
let router = express.Router();
let { contactUsController } = require("../controllers/index");

router.post("/contactUs", contactUsController);

module.exports = router;
