const mongoose = require("mongoose"),
  blogModel = new mongoose.Schema(
    {
      heading: {
        type: String,
        required: true,
        minLength: 2,
        default: null,
      },
      nearbyLocation: {
        //here name and code is airport name and airport code
        name: {
          type: String,
          required: true,
          default: null,
        },
        code: {
          type: String,
          required: false,
          default: null,
        },
      },
      description: {
        type: String,
        required: true,
        default: null,
      },
      blogImage: {
        name: {
          type: String,
          required: true,
          default: null,
        },
        imageURL: {
          type: String,
          required: true,
          default: null,
        },
      },
      vendorMail: {
        type: String,
        // unique: true,
        unique: false,
        required: false,
        lowercase: true,
        trim: true,
        minLength: 7,
        default: null,
      },
      totalReads: {
        type: Number,
        default: 0,
      },
      datePosted: {
        type: String,
        requied: true,
        default: null,
      },
      userEmail: {
        type: String,
        required: false,
        lowercase: true,
        // unique: true,
        unique: false,
        trim: true,
        default: null,
      },
    },
    {
      strict: false,
      timestamps: true,
    }
  );

module.exports = mongoose.model("blog", blogModel);
