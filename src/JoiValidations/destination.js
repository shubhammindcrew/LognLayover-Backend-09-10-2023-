const Joi = require("joi");

const destinationValidation = Joi.object({
  destData: Joi.object({
    name: Joi.string().min(2).required(),
    totalTime: Joi.string().required(),
    mapLocation: Joi.string().required(),
    airportName: Joi.string().required(),
    airportCode: Joi.string().required(),
    nearBy: Joi.array().optional(),
    description: Joi.string().required(),
    waysToReach: Joi.array()
      .items({
        data: Joi.array().required(),
        mode: Joi.string().required(),
      })
      .required(),
    to: Joi.string().required(),
    from: Joi.string().required(),
    startTime: Joi.string().optional().allow(""),
    endTime: Joi.string().optional().allow(""),
    destinationEmail: Joi.string().email().lowercase().optional().allow(""),
    category: Joi.string().required(),
    mobileNumber1: Joi.string().optional().allow(""),
    mobileNumber2: Joi.string().optional().allow(""),
    additionalInfo: Joi.string().optional().allow(""),
  }),
});

module.exports = { destinationValidation };
