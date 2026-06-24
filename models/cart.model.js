const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cart_id: String,
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        size_id: {
          type: mongoose.Schema.Types.ObjectId,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Cart = mongoose.model("Cart", cartSchema, "cart");

module.exports = Cart;
