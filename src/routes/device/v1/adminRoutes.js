const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const adminController = require("../../../controller/adminController");
const router = express.Router();

// Admin Routes
router.get("/users", authMiddleware, roleMiddleware(["admin"]), adminController.getAllUsers);
router.put("/users/:id", authMiddleware, roleMiddleware(["admin"]), adminController.updateUserRole);
router.delete("/users/:id", authMiddleware, roleMiddleware(["admin"]), adminController.deleteUser);
router.get("/admin/employees/details", authMiddleware, roleMiddleware(["admin"]), adminController.getAllEmployeeDetail);
router.get("/admin/employees/monthly-details", authMiddleware, roleMiddleware(["admin"]), adminController.getMonthlyEmployeeDetails);
router.get('/admin/download-employee-details', authMiddleware, roleMiddleware(["admin", "employee"]), adminController.downloadEmployeeDetails);
router.get('/admin/dashboard', authMiddleware, roleMiddleware(["admin", "hr"]), adminController.getAdminDashboardData);

module.exports = router;
