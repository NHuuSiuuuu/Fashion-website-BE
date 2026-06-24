const express = require("express");

const router = express.Router();

const controller = require("../controllers/account.controller");
const { checkPermission } = require("../middleware/permission.middleware");
const { authMiddleWare } = require("../middleware/auth.middleware");

router.post(
  "/create",
  checkPermission("account_create"),
  controller.createAccount,
);

// user
router.post(
  "/createUser",

  controller.createAccountUser,
);

router.get("/index", checkPermission("account_view"), controller.index);

router.get("/detail/:id", controller.detailAccount);

router.patch(
  "/update/:id",

  checkPermission("account_update"),
  controller.updateAccount,
);

router.delete(
  "/delete/:id",
  checkPermission("account_delete"),

  controller.deleteAccount,
);
router.get("/getMe", authMiddleWare, controller.getMe);

module.exports = router;
