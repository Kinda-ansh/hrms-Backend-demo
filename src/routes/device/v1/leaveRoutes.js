const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const leaveController = require("../../../controller/leaveController");
const router = express.Router();

// Leave Routes
router.get("/leaves", authMiddleware, roleMiddleware(["admin", "hr", 'manager']), leaveController.getAllLeaves); // Get all leaves
router.get("/leaves/mine", authMiddleware, roleMiddleware(["employee",  'hr', 'manager']), leaveController.getMyLeaves); // Get logged-in user's leaves
router.get("/leaves/:id", authMiddleware, roleMiddleware(["admin", "hr", "employee", 'manager']), leaveController.getLeaveById); // Get leave by ID
router.post("/leaves/request", authMiddleware, roleMiddleware(["employee", 'hr', 'manager']), leaveController.requestLeave); // Request leave
router.put("/leaves/status/:id",   leaveController.updateLeaveStatus); // Approve/Reject leave
router.delete("/leaves/:id", authMiddleware, roleMiddleware(["admin", "hr", 'manager']), leaveController.deleteLeave); // Delete leave
router.get('/leaves/status/:id', leaveController.getLeaveStatusById);

module.exports = router;


