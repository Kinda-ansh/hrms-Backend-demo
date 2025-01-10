const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const ticketController = require("../../../controller/ticketController");
const router = express.Router();

// Performance Routes
router.get("/ticket/all", authMiddleware, roleMiddleware(["admin", "hr",  "manager", "employee"]), ticketController.getAllTickets);
router.post("/ticket/raise", authMiddleware, roleMiddleware(["admin", "hr", "manager", "employee"]), ticketController.raiseTicket);

module.exports = router;
