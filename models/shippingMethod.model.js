const mongoose = require("mongoose");

const ShippingMethodSchema = mongoose.Schema({
  code: String,
  name: String,
  thumbnail: [],
  description: String,
  fee: Number,
  freeThreshold: Number,
  status: String,
  deliveryTime: String,
  isDefault: Boolean,
  deleted: {
    type: Boolean,
    default: false,
  },
});

const ShippingMethod = mongoose.model(
  "ShippingMethod",
  ShippingMethodSchema,
  "ShippingMethod",
);
module.exports = ShippingMethod;
