const express = require("express");

const router = express.Router();
const controller = require("../controllers/chat_bot.controller");


router.post("/", controller.chatBot);

module.exports = router;
