const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");

const { checkPermission } = require("../middleware/permission.middleware.js");

const upload = multer();
const cloudinary = require("cloudinary").v2;
const uploadCloud = require("../middleware/uploadCloud.middleware");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const ProductCategoryController = require("../controllers/product-category.controller.js");

router.get("/tree", ProductCategoryController.getTree);

router.post(
  "/create",
  checkPermission("product_category_create"),

  upload.array("thumbnail", 2),
  uploadCloud.uploadFile,
  ProductCategoryController.create,
);

router.patch(
  "/update/:id",
  checkPermission("product_category_update"),

  upload.array("thumbnail", 2),
  uploadCloud.uploadFile,
  ProductCategoryController.update,
);

router.patch(
  "/delete/:id",
  checkPermission("product_category_delete"),

  ProductCategoryController.delete,
);

router.post("/detail/:id", ProductCategoryController.detail);

router.post(
  "/productCategories",

  checkPermission("product_category_view"),
  ProductCategoryController.productCategories,
);

module.exports = router;
