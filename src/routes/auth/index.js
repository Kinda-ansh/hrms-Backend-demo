/**
 * index.js
 * @description :: index route file of auth.
 */

const express = require("express");
const router = express.Router();



router.use("/auth/admin", require("./adminAuth"));
router.use("/auth/user", require("./userAuth"));

module.exports = router;