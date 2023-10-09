const Joi = require("joi");

const contactUsValidation = Joi.object({
  name: Joi.string().min(2).empty(false).required(),
  email: Joi.string()
    .email()
    .lowercase({ force: true })
    .trim()
    .empty(false)
    .required(),
  comment: Joi.string().empty(false).required(),
  adminEmail: Joi.string().optional(),
});

module.exports = { contactUsValidation };
