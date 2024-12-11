const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const departmentController = require("../../../controller/departmentController");
const router = express.Router();

// Department Routes
router.get("/departments", authMiddleware, roleMiddleware(["admin", "hr"]), departmentController.getAllDepartments); // Get all departments
router.get("/departments/:id", authMiddleware, roleMiddleware(["admin", "hr", "employee"]), departmentController.getDepartmentById); // Get department by ID
router.post("/departments", authMiddleware, roleMiddleware(["admin"]), departmentController.addDepartment); // Add a department
router.put("/departments/:id", authMiddleware, roleMiddleware(["admin"]), departmentController.updateDepartment); // Update a department
router.delete("/departments/:id", authMiddleware, roleMiddleware(["admin"]), departmentController.deleteDepartment); // Delete a department

module.exports = router;
