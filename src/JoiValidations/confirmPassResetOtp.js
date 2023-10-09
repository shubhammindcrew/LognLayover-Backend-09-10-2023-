const Joi = require("joi");

const confirmPasswordValidation = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  code: Joi.number().required(),
  password: Joi.string().required(),
});

module.exports = { confirmPasswordValidation };
