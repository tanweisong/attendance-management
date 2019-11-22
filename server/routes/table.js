const express = require("express");
const mongodb = require("mongodb");
const _ = require("lodash");
const controller = require("../controllers/table");

const router = express.Router();

router.post("/", controller.createTables);

router.put("/", controller.updateTables);

router.put("/:id", controller.updateTable);

router.put("/reset", controller.unsetTableRowCol);

module.exports = router;
