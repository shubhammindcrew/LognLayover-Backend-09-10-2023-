const dotenv = require("dotenv");
dotenv.config();
const {
    PORT,
    MONGO_URI,
    EMAIL_USER,
    EMAIL_PASS,
    STRIPE_KEY,
    BASE_URL,
    GOOGLE_KEY,
    IMAGEURL,
  } = process.env,
  config = {
    PORT: PORT ? PORT : 3001,
    MONGO_URI,
    EMAIL_USER,
    EMAIL_PASS,
    STRIPE_KEY,
    BASE_URL,
    GOOGLE_KEY,
    IMAGEURL,
  };

module.exports = config;
