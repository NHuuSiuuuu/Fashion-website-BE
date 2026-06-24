const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cart_id: String,

    customer: {
      fullName: String,
      email: String,
      phone: String,
      note: String,

      address: {
        detail: String,
        ward: String,
        district: String,
        province: String,
      },
    },
    // shippingMethod: String,
    shippingMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingMethod",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "vnpay"],
    },

    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        size_id: String,
        quantity: Number,
        price: Number,
      },
    ],

    totalPrice: Number,

    shippingFee: Number,
    finalPrice: Number,
    totalQuantity: Number,

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refund_pending"],
      default: "unpaid",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending", //Chờ xác nhận
        "confirmed", // Đã xác nhận
        "shipping", // Đang giao
        "completed", // Hoàn tất
        "cancelled", // Hủy
      ],
      default: "pending",
    },

    orderTimeLine: [
      {
        status: String,
        message: String,
        time: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema, "Order");

module.exports = Order;
