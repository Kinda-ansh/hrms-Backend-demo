const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const { createHoliday, getHolidays, deleteHoliday } = require("../../../controller/HolyDayController");
const router = express.Router();

// Leave Routes
router.post("/create-holydays", createHoliday); // Get all leaves
router.get("/get-holydays", getHolidays); 
router.delete("/delete-holydays/:id", deleteHoliday); 

module.exports = router;


