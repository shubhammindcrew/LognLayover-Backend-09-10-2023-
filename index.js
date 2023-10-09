const express = require("express"),
  app = express(),
  { PORT } = require("./src/config"),
  routes = require("./src/routes"),
  { vendorAuth, adminAuth } = require("./src/middleware"),
  cron = require("./cron"),
  cors = require("cors");

// const { contactUsRoutes } = require("./src/routes/contactUs-routes");
const bodyParser = require("body-parser");
const verifyAdminToken = require("./src/middleware/verify-admintoken");

// const fileUpload = require("express-fileupload");

require("./src/db");

app.use(cors());

app.use("/webhook", routes.webhook);
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());

cron.mailLetterCron();

app.use("/user", routes.userRoutes);
app.use("/vendor", routes.vendorRoutes);
app.use("/authVendor", routes.vendorAuthRoutes);
app.use("/admin", routes.adminRoutes);
// app.use("/authAdmin", verifyAdminToken, routes.adminAuthRoutes);
app.use("/authAdmin", routes.adminAuthRoutes);
app.use("/contact", routes.contactUsRoutes);

app.listen(PORT, (err) => {
  if (err) return console.log(`Server started on port :: ${PORT}`);
});
