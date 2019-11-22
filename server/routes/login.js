const express = require("express");
const controller = require("../controllers/login");

const router = express.Router();

router.get("/:email", controller.getLoginByEmail);

router.post("/", controller.createLogin);

router.put("/", controller.updateLogin);

module.exports = router;
