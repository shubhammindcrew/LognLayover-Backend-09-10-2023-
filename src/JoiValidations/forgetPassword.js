const Joi = require("joi");

const forgetPasswordValidation = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

module.exports = { forgetPasswordValidation };
