const Joi = require("joi");

const adminValidation = Joi.object({
  name: Joi.string().optional().min(2).required(),
  email: Joi.string().email().lowercase({ force: true }).trim().required(),
  password: Joi.string().required(),
  role: Joi.string().optional().default("admin"),
});

module.exports = { adminValidation };
