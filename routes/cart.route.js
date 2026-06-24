const express = require("express");

const router = express.Router();
const controller = require("../controllers/cart.controller");
const validate = require("../middleware/validate.middleware");
const { createCartSchema } = require("../validators/cart.validator");

router.post("/create", validate(createCartSchema), controller.createCart);
router.post("/get", controller.getCart);
router.post("/delete", controller.deleteProductInCart);
router.post("/update", controller.updateProductInCart);

module.exports = router;
