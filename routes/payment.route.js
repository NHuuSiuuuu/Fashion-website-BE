const express = require("express");
const OrderModel = require("../models/order.model");

const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");
const router = express.Router();

// router.post("/create-payment-vnpay", async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     console.log(orderId);
//     const order = await OrderModel.findOne({ _id: orderId });
//     // console.log(order);
//     if (!order)
//       return res.status(404).json({
//         message: "Giỏ hàng không tồn tại.",
//       });

//     const vnpay = new VNPay({
//       // ⚡ Cấu hình bắt buộc
//       tmnCode: "IXC3X9T7",
//       secureSecret: "W2AUFNXCL9S6JFD001FR42MKSENMHO6K",
//       vnpayHost: "https://sandbox.vnpayment.vn",

//       // 🔧 Cấu hình tùy chọn
//       testMode: true, // Chế độ test
//       hashAlgorithm: "SHA512", // Thuật toán mã hóa
//       // enableLog: true, // Bật/tắt log
//       loggerFn: ignoreLogger, // Custom logger

//       // // 🔧 Custom endpoints
//       // endpoints: {
//       //   paymentEndpoint: "paymentv2/vpcpay.html",
//       //   queryDrRefundEndpoint: "merchant_webapi/api/transaction",
//       //   getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list",
//       // },
//     });
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const vnpayResponse = await vnpay.buildPaymentUrl({
//       vnp_Amount: order.finalPrice, // 100,000 VND
//       vnp_IpAddr: req.ip,
//       vnp_TxnRef: order._id,
//       vnp_OrderInfo: `Thanh toán đơn hàng # ${order._id}`,
//       vnp_ReturnUrl: "http://localhost:3001/api/check-payment-vnpay",
//       vnp_Locale: VnpLocale.VN,
//       vnp_CreateDate: dateFormat(new Date()),
//       vnp_ExpireDate: dateFormat(tomorrow),
//     });

//     return res.status(200).json(vnpayResponse);
//   } catch (e) {
//     throw e;
//   }
// });

router.get("/check-payment-vnpay", async (req, res) => {
  // console.log("co di qua day")
  const vnp_TxnRef = req.query.vnp_TxnRef;
  const vnp_ResponseCode = req.query.vnp_ResponseCode;

  // Kiểm tra lại order
  const order = await OrderModel.findOne({ _id: vnp_TxnRef });
  if (!order)
    return res.status(404).json({
      message: "Giỏ hàng không tồn tại.",
    });

  // Cập nhật lại trạng thái: Đã thanh toán
  if (vnp_ResponseCode === "00") {
    await OrderModel.updateOne(
      { _id: vnp_TxnRef },
      {
        paymentStatus: "paid",
        $push: {
          orderTimeLine: {
            status: "paid",
            message: "Thanh toán VNPay thành công.",
            time: new Date(),
          },
        },
      },
    );
    return res.redirect(`/orders/success/${vnp_TxnRef}`);
  } else if (vnp_ResponseCode === "24") {
    return res.redirect(`/cart`);
  } else {
    await OrderModel.updateOne(
      { _id: vnp_TxnRef },
      {
        paymentStatus: "failed",
        $push: {
          orderTimeLine: {
            status: "failed",
            message: "Thanh toán VNPay không thành công.",
            time: new Date(),
          },
        },
      },
    );
  }

  console.log("req.query", req.query);
});

module.exports = router;
