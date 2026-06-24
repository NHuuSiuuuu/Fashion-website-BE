const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const { authMiddleWare } = require("../middleware/auth.middleware");

const router = express.Router();

const multer = require("multer");
// const storageMulter = require("../helpers/storageMulter");
const { checkPermission } = require("../middleware/permission.middleware.js");

const upload = multer();
const cloudinary = require("cloudinary").v2;

const uploadCloud = require("../middleware/uploadCloud.middleware");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const productController = require("../controllers/product.controller");

// Thêm
router.post(
  "/create",
  authMiddleWare,
  checkPermission("product_create"),
  upload.array("thumbnail", 10),
  uploadCloud.uploadFile,
  productController.createProduct,
);

// Sửa
router.patch(
  "/update/:id",
  authMiddleWare,
  checkPermission("product_update"),
  upload.array("thumbnail", 10),
  uploadCloud.uploadFile,
  productController.updateProduct,
);

// Xóa mềm (Chỉ thay đổi trường deleted)
router.patch(
  "/delete/:id",
  authMiddleWare,
  checkPermission("product_delete"),
  productController.deleteProduct,
);

// Chi tiết sản phẩm
router.get("/detail/:param", productController.detailProduct);

// Danh sách sản phẩm
router.get(
  "/products",
  authMiddleWare,

  checkPermission("product_view"),
  productController.products,
);
router.get(
  "/",

  productController.getProducts,
);
router.get("/category/:id", productController.getProductsCategory);

router.get("/related-products/:id", productController.relatedProducts);

router.get("/search/", productController.searchProducts);
module.exports = router;
