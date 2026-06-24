const express = require("express");

const router = express.Router();

const roleController = require("../controllers/role.controller");
const { checkPermission } = require("../middleware/permission.middleware");

router.get(
  "/index",
  checkPermission("role_view"),

  roleController.index,
);
router.get(
  "/detail/:id",

  roleController.detail,
);
router.post(
  "/create",
  checkPermission("role_create"),

  roleController.create,
);
router.patch(
  "/update/:id",
  checkPermission("role_update"),

  roleController.update,
);
router.delete(
  "/delete/:id",
  checkPermission("role_delete"),

  roleController.delete,
);

router.patch(
  "/permissions",
  checkPermission("role_update"),

  roleController.permissions,
);

module.exports = router;
