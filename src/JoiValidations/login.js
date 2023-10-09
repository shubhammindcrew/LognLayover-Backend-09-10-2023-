const Joi = require("joi");

const loginValidation = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

module.exports = { loginValidation };
