let Joi = require("joi");
let vendorRegister = (req, res, next) => {
  let vendorRegisterSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  });

  let { error } = vendorRegisterSchema.validate(
    req.body,
    // { abortEarly: false },
    {
      label: "key",
      wrap: { label: false },
    }
  );
  if (error) {
    return res.json({
      status: Boolean(false),
      message: "error in vendor registeration",
      error: error.details[0].message,
    });
  } else {
    next();
  }
};

module.exports = vendorRegister;
