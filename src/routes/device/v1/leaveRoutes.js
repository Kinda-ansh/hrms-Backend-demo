const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const leaveController = require("../../../controller/leaveController");
const router = express.Router();

// Leave Routes
router.get("/leaves", authMiddleware, roleMiddleware(["admin", "hr"]), leaveController.getAllLeaves); // Get all leaves
router.get("/leaves/mine", authMiddleware, roleMiddleware(["employee"]), leaveController.getMyLeaves); // Get logged-in user's leaves
router.get("/leaves/:id", authMiddleware, roleMiddleware(["admin", "hr", "employee"]), leaveController.getLeaveById); // Get leave by ID
router.post("/leaves/request", authMiddleware, roleMiddleware(["employee"]), leaveController.requestLeave); // Request leave
router.put("/leaves/status/:id", authMiddleware, roleMiddleware(["admin", "hr"]), leaveController.updateLeaveStatus); // Approve/Reject leave
router.delete("/leaves/:id", authMiddleware, roleMiddleware(["admin", "hr"]), leaveController.deleteLeave); // Delete leave
router.get('/leaves/status/:id', leaveController.getLeaveStatusById);

module.exports = router;


