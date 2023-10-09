const Joi = require("joi");

const registerValidation = Joi.object({
  name: Joi.string().optional().min(2).required(),
  email: Joi.string().email().lowercase({ force: true }).trim().required(),
  password: Joi.string().required(),
  role: Joi.string().optional(),
});

module.exports = { registerValidation };
