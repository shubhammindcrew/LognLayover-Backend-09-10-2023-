var express = require("express"),
  app = express(),
  router = express.Router({ caseSensitive: true }),
  { upload } = require("../helpers"),
  { vendorController } = require("../controllers");
let { verifyToken, verifySub } = require("../middleware");

router.post("/emilss", vendorController.emilss);

//stripe routes
router.post("/getPlan", verifyToken, vendorController.getPlan);
router.post("/subscribe", verifyToken, vendorController.subscribe);
router.post("/getInvoice", verifyToken, vendorController.getInvoice);
router.post("/createCard", verifyToken, vendorController.createCard);
router.post("/unsubscribe", verifyToken, vendorController.unsubscribe);

//blog routes

router.post("/addBlog", verifyToken, vendorController.addBlog);
router.post("/editBlog", verifyToken, vendorController.editBlog);
router.post("/getBlogs", verifyToken, vendorController.getBlogs);
router.post("/getABlog", verifyToken, vendorController.getABlog);
router.post("/deleteBlog", verifyToken, vendorController.deleteBlog);

//destination routes
router.post("/getADestination", verifyToken, vendorController.getADestination);
router.post("/addDestination", verifyToken, vendorController.addDestination);
router.post("/editDestination", verifyToken, vendorController.editDestination);
router.post("/getDestinations", verifyToken, vendorController.getDestinations);
router.post(
  "/deleteDestination",
  verifyToken,

  vendorController.deleteDestination
);

//vendor profile routes
router.post("/deleteVendor", vendorController.deleteVendor);
router.post("/getVendor", vendorController.getVendor);
router.post("/profile", verifyToken, vendorController.profile);

//others
router.post("/distanceMatrix", vendorController.distanceMatrix);
router.post("/getAirports", vendorController.getAirports);

router.get("/getSubscriptionDetails", vendorController.getSubsription);

module.exports = router;
