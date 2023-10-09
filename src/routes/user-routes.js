var express = require("express"),
  router = express.Router({
    caseSensitive: true,
  }),
  { userController } = require("../controllers"),
  { verifyUserToken } = require("../middleware/index");

router.get("/chooseAirportUser");
router.post("/getDestinations", userController.getDestinations);
router.get("/getSingleDestination/:id", userController.getSingleDestination);
router.post("/getLatestBlog", userController.getLatestBlogs);
router.post(
  "/popularingDestinationByClick",
  userController.popularingDestinationsByClick
);
router.post("/popularDestination", userController.getAllPopularDestination);
router.post(
  "/subscribeToWeeklyELetter",
  userController.subscribeToWeeklyELetter
);
router.get("/getELetterSubscribers", userController.getELetterSubscribers);
router.post("/getAirportsByUser", userController.getAirports);

router.post("/filterDestinations", userController.filterDestinations);

router.get("/getSingleBlog/:id", userController.getSingleBlog);

router.post(
  "/getPopularDestinationByCategoryAndRadius",
  userController.getAllPopularDestinationByCategoryAndRadius
);

router.post("/userRegistration", userController.userRegistration);
router.post("/userLogin", userController.userLogin);
router.post("/userForgetPassword", userController.userForgetPassword);
router.post("/userConfirmPassword", userController.userConfirmPassword);
router.post("/addBlogsByUser", verifyUserToken, userController.addBlogByUser);
router.post("/allBlogsByUser", verifyUserToken, userController.allBlogsByUser);

router.get("/userProfile", verifyUserToken, userController.userProfile);
router.get(
  "/getSingleBlogOfUser/:id",
  verifyUserToken,
  userController.getSingleBlogOfUser
);

router.delete(
  "/deleteBlogOfUser",
  verifyUserToken,
  userController.deleteBlogOfUser
);

router.post("/editBlogByUser", verifyUserToken, userController.editBlogByUser);

// router.post(
//   "allBlogsByUserAndVendor",
//   verifyUserToken,
//   userController.allBlogsByUserAndVendor
// );

// router.get("/addrole", userController.addrole);

module.exports = router;
