const Joi = require("joi");

exports.createCartSchema = Joi.object({
  cart_id: Joi.string().required(),
  product_id: Joi.string().required(),
  size_id: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(), // số nguyên >=1
});
