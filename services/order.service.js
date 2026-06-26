const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");
const OrderModel = require("../models/order.model");
const ShippingMethodModel = require("../models/shippingMethod.model");

const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

module.exports.createOrder = async (req) => {
  try {
    const { cart_id, customer } = req.body;
    const orderProducts = [];

    // Kiem tra xem da co cart chua?
    // console.log("req", req.ip);
    let cart = await CartModel.findOne({ cart_id });
    // console.log("cart", customer.paymentMethod);
    let totalPrice = 0;
    let totalQuantity = 0;
    // lấy mảng id sản phẩm
    const productIds = cart.products.map((p) => p.product_id);
    // Lấy ra tất cả sản phẩm cùng 1 lúc - Mảng chứa tất cả sản phẩm
    const productsDB = await ProductModel.find({
      _id: { $in: productIds },
    });

    for (const item of cart.products) {
      const product = productsDB.find(
        (p) => p._id.toString() === item.product_id.toString(),
      );
      const priceAfterDiscount =
        product.price * (1 - Number(product.discountPercentage || 0) / 100);

      totalPrice += priceAfterDiscount * item.quantity;

      totalQuantity += item.quantity;

      orderProducts.push({
        product_id: item.product_id,
        size_id: item.size_id,
        quantity: item.quantity,
        price: priceAfterDiscount,
      });
      // console.log("product:", priceAfterDiscount);
    }
    // console.log(totalQuantity);

    // Phương thức vận chuyển: Đơn hàng mà có giá đạt ngưỡng free shiping
    const shipping = await ShippingMethodModel.findOne({
      code: customer.shippingMethod,
    });
    let shippingFee = shipping.fee;
    if (
      shipping.freeThreshold != null &&
      totalPrice >= shipping.freeThreshold
    ) {
      shippingFee = 0;
    } else {
      shippingFee === shipping.fee;
    }

    const finalPrice = totalPrice + shippingFee;
    // console.log("Shipping", shipping);

    // console.log("shippingMethod", shipping);
    // Tạo order
    const order = await OrderModel.create({
      cart_id: cart_id,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        note: customer.note,
        address: {
          detail: customer.address.detail,
          ward: customer.address.ward,
          district: customer.address.district,
          province: customer.address.province,
        },
      },
      items: orderProducts,
      shippingMethod: shipping._id,

      paymentMethod: customer.paymentMethod,
      totalPrice,

      finalPrice,
      shippingFee,
      totalQuantity,
      paymentStatus: "unpaid",
      orderStatus: "pending",
      orderTimeLine: [
        {
          status: "pending",
          time: new Date(),
        },
      ],
    });

    // // Sau khi tạo thành công order thì trừ số lượng của sản phẩm đã đặt hàng trong database
    // for (const item of cart.products) {
    //   const product = productsDB.find(
    //     (p) => p._id.toString() === item.product_id.toString(),
    //   );

    //   const size = product.sizes.find(
    //     (s) => s._id.toString() === item.size_id.toString(),
    //   );
    //   size.stock = size.stock - item.quantity;
    //   await product.save();
    // }

    // update lại giỏ hàng
    // await CartModel.updateOne({ cart_id }, { products: [] });
    if (customer.paymentMethod === "cod")
      return {
        order,

        message: "Đặt hàng thành công",
      };

    // Thanh toán bằng vpn pay
    const orderId = order._id;
    if (customer.paymentMethod === "vnpay") {
      const order = await OrderModel.findOne({ _id: orderId });
      // console.log(orderId);
      // console.log(order);
      if (!order) {
        throw {
          status: 404,
          message: "Giỏ hàng không tồn tại.",
        };
      }

      const vnpay = new VNPay({
        // ⚡ Cấu hình bắt buộc
        tmnCode: "IXC3X9T7",
        secureSecret: "W2AUFNXCL9S6JFD001FR42MKSENMHO6K",
        vnpayHost: "https://sandbox.vnpayment.vn",

        // 🔧 Cấu hình tùy chọn
        testMode: true, // Chế độ test
        hashAlgorithm: "SHA512", // Thuật toán mã hóa
        // enableLog: true, // Bật/tắt log
        loggerFn: ignoreLogger, // Custom logger

        // // 🔧 Custom endpoints
        // endpoints: {
        //   paymentEndpoint: "paymentv2/vpcpay.html",
        //   queryDrRefundEndpoint: "merchant_webapi/api/transaction",
        //   getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list",
        // },
      });
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: order.finalPrice, // 100,000 VND
        vnp_IpAddr: req.ip,
        vnp_TxnRef: order._id,
        vnp_OrderInfo: `Thanh toán đơn hàng # ${order._id}`,
        vnp_ReturnUrl: `${process.env.SERVER_URL}/api/check-payment-vnpay`,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(tomorrow),
      });

      return {
        payment: "vnpay",
        vnpayResponse,
        orderId: order._id,
      };
    }
  } catch (e) {
    throw e;
  }
};

module.exports.index = async () => {
  try {
    const orders = await OrderModel.find().populate(
      "items.product_id",
      "title",
    );
    return {
      status: "OK",
      message: "success",
      orders,
    };
  } catch (e) {
    throw e;
  }
};

module.exports.detailOrder = async () => {
  try {
    return {
      status: "OK",
      message: "success",
    };
  } catch (e) {
    throw e;
  }
};

module.exports.successOrder = async (id) => {
  try {
    const order = await OrderModel.findById(id).populate(
      "items.product_id",
      "title thumbnail sizes",
    );
    // console.log(order);

    return {
      status: "OK",
      message: "success",
      order,
    };
  } catch (e) {
    throw e;
  }
};

// Tra cứu đơn hàng
module.exports.tracking = async (phone, orderId) => {
  try {
    if (phone && orderId) {
      const phoneExist = await OrderModel.exists({ "customer.phone": phone });
      if (!phoneExist) {
        throw {
          status: 404,
          message: "Số điện thoại không tồn tại!",
        };
      }
      const orderExist = await OrderModel.findOne({ _id: orderId });

      if (!orderExist) {
        return {
          status: "ERROR",
          message: "Đơn hàng không tồn tại!",
        };
      }
      const order = await OrderModel.find({
        "customer.phone": phone,
        _id: orderId,
      });

      return {
        message: "success",
        order,
      };
    } else if (phone) {
      const order = await OrderModel.find({ "customer.phone": phone });
      if (order.length === 0) {
        throw {
          status: 404,
          message: "Số điện thoại này không tồn tại.",
        };
      }
      return {
        message: "success",
        order,
      };
    } else if (orderId) {
      const order = await OrderModel.find({ _id: orderId });
      if (order.length === 0) {
        throw {
          status: 404,
          message: "Mã đơn hàng không tồn tại.",
        };
      }
      return {
        message: "success",
        order,
      };
    }
  } catch (e) {
    throw e;
  }
};

// Hủy đơn hàng: Chuyển orderStatus sang trạng thái hủy
module.exports.cancelOrder = async (id) => {
  try {
    const orderExist = await OrderModel.findById({ _id: id });
    if (!orderExist) {
      throw {
        status: 404,
        message: "Đơn hàng không tồn tại.",
      };
    }
    if (
      orderExist.orderStatus !== "pending" &&
      orderExist.orderStatus !== "confirmed"
    ) {
      throw {
        status: 404,
        message: "Chỉ có thể hủy đơn khi đang chờ xác nhận.",
      };
    }

    for (const item of orderExist.items) {
      const product = await ProductModel.findById({ _id: item.product_id });
      // console.log(item);
      const size = product.sizes.find(
        (s) => s._id.toString() === item.size_id.toString(),
      );
      if (size) {
        // Cập nhật lại số lượng trong mảng size
        size.stock += item.quantity;
        await product.save();
      }
      console.log(size);
    }
    console.log(orderExist);
    if (orderExist.paymentStatus === "paid") {
      await OrderModel.updateOne(
        { _id: id, orderStatus: { $ne: "cancelled" } },
        {
          paymentStatus: "refund_pending",
          orderStatus: "cancelled",
          $push: {
            orderTimeLine: {
              status: "cancelled",
              message: "Khách hủy đơn - chờ hoàn tiền.",
              time: new Date(),
            },
          },
        },
      );
    }
    await OrderModel.updateOne(
      { _id: id, orderStatus: { $ne: "cancelled" } },
      {
        orderStatus: "cancelled",
        $push: {
          orderTimeLine: {
            status: "cancelled",
            message: "Đơn hàng đã hủy",
            time: new Date(),
          },
        },
      },
    );
  } catch (e) {
    throw e;
  }
};

// Hủy đơn hàng: Chuyển orderStatus sang trạng thái hủy
module.exports.adminCancelOrder = async ({ id }) => {
  try {
    console.log(id);
    const orderExist = await OrderModel.findOne({ _id: id });
    if (!orderExist) {
      throw {
        status: 404,
        message: "Đơn hàng không tồn tại.",
      };
    }
    if (
      orderExist.orderStatus !== "pending" &&
      orderExist.orderStatus !== "confirmed"
    ) {
      throw {
        status: 404,
        message: "Chỉ có thể hủy đơn khi đang chờ xác nhận.",
      };
    }
    console.log(orderExist);

    for (const item of orderExist.items) {
      const product = await ProductModel.findById({ _id: item.product_id });
      // console.log(item);
      const size = product.sizes.find(
        (s) => s._id.toString() === item.size_id.toString(),
      );
      if (size) {
        // Cập nhật lại số lượng trong mảng size
        size.stock += item.quantity;
        await product.save();
      }
      console.log(size);
    }
    console.log(orderExist);
    if (orderExist.paymentStatus === "paid") {
      await OrderModel.updateOne(
        { _id: id, orderStatus: { $ne: "cancelled" } },
        {
          paymentStatus: "refund_pending",
          orderStatus: "cancelled",
          $push: {
            orderTimeLine: {
              status: "cancelled",
              message: "Khách hủy đơn - chờ hoàn tiền.",
              time: new Date(),
            },
          },
        },
      );
    }
    await OrderModel.updateOne(
      { _id: id, orderStatus: { $ne: "cancelled" } },
      {
        orderStatus: "cancelled",
        $push: {
          orderTimeLine: {
            status: "cancelled",
            message: "Đơn hàng đã hủy",
            time: new Date(),
          },
        },
      },
    );
  } catch (e) {
    throw e;
  }
};

// Bảng cho phép chuyển tiếp trạng thái
const allowedTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["completed"],
  completed: [],
  cancelled: [],
};

// Xác nhận đơn hàng
module.exports.adminUpdateOrderStatus = async ({ id, newOrderStatus }) => {
  try {
    console.log(id);
    console.log(newOrderStatus);
    const orderExist = await OrderModel.findById({ _id: id });
    if (!orderExist) {
      throw {
        status: 404,
        message: "Đơn hàng không tồn tại.",
      };
    }
    const currentStatus = orderExist.orderStatus;

    // Trạng thái Cho phép được chuyển sang trạnn thái nào
    const allowed = allowedTransitions[currentStatus];
    if (!allowed.includes(newOrderStatus)) {
      throw {
        status: 400,
        message: `Không thể chuyển từ ${currentStatus} sang ${newOrderStatus}`,
      };
    }

    console.log(allowedTransitions[currentStatus]);

    let updateData = {
      orderStatus: newOrderStatus,
      $push: {
        orderTimeLine: {
          status: newOrderStatus,
          message: `Đơn hàng chuyển sang ${newOrderStatus}`,
          time: new Date(),
        },
      },
    };

    if (newOrderStatus === "cancelled") {
      for (const item of orderExist.items) {
        const product = await ProductModel.findById({ _id: item.product_id });
        // console.log(item);
        const size = product.sizes.find(
          (s) => s._id.toString() === item.size_id.toString(),
        );
        if (size) {
          // Cập nhật lại số lượng trong mảng size
          size.stock += item.quantity;
          await product.save();
        }
        console.log(size);
      }

      if (orderExist.paymentStatus === "paid") {
        updateData.paymentStatus = "refund_pending";
        updateData.$push.orderTimeLine.message =
          "Admin hủy đơn - chờ hoàn tiền";
      }
    }

    // Nếu hoàn thành và là cod thu xác nhận đã thu tiền
    if (orderExist.paymentMethod === "cod" && newOrderStatus === "completed") {
      updateData.paymentStatus = "paid";
    }
    await OrderModel.updateOne({ _id: id }, updateData);
  } catch (e) {
    throw e;
  }
};
// Xác nhận đã hoàn tiền
module.exports.adminRefundOrder = async ({id}) => {
  try {
    // console.log(id);
    const orderExist = await OrderModel.findById({ _id: id });
    console.log(orderExist);
    if (!orderExist) {
      throw {
        status: 404,
        message: "Đơn hàng không tồn tại.",
      };
    }

    if (orderExist.paymentStatus !== "refund_pending") {
      throw {
        status: 400,
        message: "Đơn không ở trạng thái hoàn tiền",
      };
    }

    let updateData = {
      paymentStatus: "refunded",
      $push: {
        orderTimeLine: {
          status: "refunded",
          message: `Admin đã hoàn tiền cho khách`,
          time: new Date(),
        },
      },
    };

    await OrderModel.updateOne({ _id: id }, updateData);
  } catch (e) {
    throw e;
  }
};
