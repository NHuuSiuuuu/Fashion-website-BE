const express = require("express");

const router = express.Router();

const controller = require("./../controllers/auth.controller");

router.post("/login", controller.login);
router.get("/logout", controller.logout);

router.post("/refresh-token", controller.refreshToken);

module.exports = router;
