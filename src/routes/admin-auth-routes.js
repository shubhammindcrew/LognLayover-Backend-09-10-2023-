var express = require("express"),
  router = express.Router({ caseSensitive: true }),
  { adminController } = require("../controllers");
var adminToken = require("../middleware/verify-admintoken");

//blog routes

router.post("/editBlog", adminToken, adminController.editBlog);
router.post("/getBlogs", adminToken, adminController.getBlogs);
router.post("/deleteBlog", adminToken, adminController.deleteBlog);
router.get("/getSingleBlog/:id", adminToken, adminController.getSingleBlog);

router.post("/editDestination", adminToken, adminController.editDestination);
router.post("/getDestinations", adminToken, adminController.getDestinations);
router.get(
  "/getSingleDestination/:id",
  adminToken,
  adminController.getSingleDestination
);
router.post(
  "/deleteDestination",
  adminToken,
  adminController.deleteDestination
);

router.get("/getAllBlog", adminController.getAllBlog);

module.exports = router;
