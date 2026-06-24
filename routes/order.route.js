const express = require("express");

const router = express.Router();
const controller = require("../controllers/order.controller");

router.post("/create", controller.createOrder);

router.get("/index", controller.index);

router.get("/success/:id", controller.successOrder);

router.post("/tracking", controller.tracking);

router.post("/cancel/:id", controller.cancelOrder);

router.post("/admin-cancel", controller.adminCancelOrder);

router.post("/admin-update-order-status", controller.adminUpdateOrderStatus);

router.post("/admin-refund-order", controller.adminRefundOrder);

module.exports = router;
