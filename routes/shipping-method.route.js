const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();
const cloudinary = require("cloudinary").v2;
const uploadCloud = require("../middleware/uploadCloud.middleware");

const ShippingMethodController = require("../controllers/ShippingMethod.controller");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

router.post(
  "/create",
  upload.array("thumbnail", 10),
  uploadCloud.uploadFile,
  ShippingMethodController.create,
);
router.get("/index", ShippingMethodController.index);
router.get("/detail/:id", ShippingMethodController.detail);
router.patch(
  "/update/:id",
  upload.array("thumbnail", 10),
  uploadCloud.uploadFile,
  ShippingMethodController.update,
);
router.delete("/delete/:id", ShippingMethodController.delete);

module.exports = router;
