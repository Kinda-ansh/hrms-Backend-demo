const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const payrollController = require("../../../controller/payrollController");
const router = express.Router();

// Payroll Routes
router.get("/payroll", authMiddleware, roleMiddleware(["admin", "hr"]), payrollController.getAllPayrolls); // Get all payroll records
router.get("/payroll/mine", authMiddleware, roleMiddleware(["employee"]), payrollController.getMyPayroll); // Get logged-in employee's payroll records
router.get("/payroll/:id", authMiddleware, roleMiddleware(["admin", "hr", "employee"]), payrollController.getPayrollById); // Get payroll by ID
router.post("/payroll", authMiddleware, roleMiddleware(["admin", "hr"]), payrollController.generatePayroll); // Generate payroll
router.put("/payroll/:id", authMiddleware, roleMiddleware(["admin"]), payrollController.updatePayrollStatus); // Update payroll status
router.delete("/payroll/:id", authMiddleware, roleMiddleware(["admin"]), payrollController.deletePayroll); // Delete payroll

module.exports = router;
