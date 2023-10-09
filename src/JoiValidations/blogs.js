const Joi = require("joi");

const BlogValidation = Joi.object({
  heading: Joi.string().min(2).required(),
  name: Joi.string().required(),
  code: Joi.string().optional(),
  description: Joi.string().required(),
});

module.exports = { BlogValidation };
