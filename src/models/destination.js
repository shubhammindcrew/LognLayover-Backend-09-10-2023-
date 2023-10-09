const mongoose = require("mongoose"),
  destinationModel = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        minLength: 2,
        default: null,
      },
      totalTime: {
        type: String,
        required: true,
        default: null,
      },
      mapLocation: {
        type: String,
        required: true,
        default: null,
      },
      airportName: {
        type: String,
        required: true,
        default: null,
      },
      airportCode: {
        type: String,
        required: false,
        default: null,
      },
      nearBy: {
        type: Array,
        required: false,
        default: null,
      },
      description: {
        type: String,
        required: true,
        default: null,
      },

      waysToReach: {
        required: true,
        type: [{}],
      },

      to: {
        type: String,
        required: true,
        default: null,
      },
      from: {
        type: String,
        required: true,
        default: null,
      },
      //In images we can add multiple images of destination files name is dest_image in postman and cover image is cover_image in postman.
      images: [
        {
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
      ],
      vendorMail: {
        type: String,
        // unique: false,
        required: false,
        lowercase: true,
        trim: true,
        default: null,
        // minLength: 7,
      },

      startTime: {
        type: String,
        required: false,
        default: null,
      },

      endTime: {
        type: String,
        required: false,
        default: null,
      },
      destinationEmail: {
        type: String,
        required: false,
        trim: true,
        default: null,
        // unique: false,
      },

      category: {
        type: String,
        required: true,
        default: null,
      },

      mobileNumber1: {
        type: String,
        required: false,
        default: null,
      },
      mobileNumber2: {
        type: String,
        required: false,
        default: null,
      },

      //background image of destination which we can only add one.
      coverImage: {
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

      additionalInfo: {
        type: String,
        required: false,
        default: null,
      },

      totalReads: {
        type: Number,
        default: 0,
      },
    },
    { strict: false }
  );

module.exports = mongoose.model("destination", destinationModel);
