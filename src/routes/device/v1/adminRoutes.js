const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const adminController = require("../../../controller/adminController");
const router = express.Router();

// Admin Routes
router.get("/admin/employees", authMiddleware, roleMiddleware(["admin"]), adminController.getAllEmployees);
router.put("/admin/employees/:id", authMiddleware, roleMiddleware(["admin"]), adminController.updateEmployeeRole);
router.delete("/users/:id", authMiddleware, roleMiddleware(["admin"]), adminController.deleteUser);
router.get("/admin/employees/details", authMiddleware, roleMiddleware(["admin", "hr"]), adminController.getAllEmployeeDetail);
router.get("/admin/employees/monthly-details", authMiddleware, roleMiddleware(["admin", 'hr']), adminController.getMonthlyEmployeeDetails);
router.get('/admin/download-employee-details', authMiddleware, roleMiddleware(["admin", "employee"]), adminController.downloadEmployeeDetails);
router.get('/admin/dashboard', authMiddleware, roleMiddleware(["admin", "hr"]), adminController.getAdminDashboardData);

module.exports = router;
