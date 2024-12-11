const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const  employeeController  = require("../../../controller/employeeController");
const  generateFakeData  = require("../../../controller/generateFakeData");
const router = express.Router();

// Example: Employees Routes
router.get("/employees", authMiddleware, roleMiddleware(["admin", "hr"]), employeeController.getAllEmployees);
router.get("/employees/:id", authMiddleware, roleMiddleware(["admin", "hr", "employee"]), employeeController.getEmployeeById);
router.get("/myprofile", authMiddleware, roleMiddleware(["admin", "hr", "employee"]), employeeController.getMyProfile);
router.post("/employees", authMiddleware, roleMiddleware(["admin", "hr"]), employeeController.createEmployee);
router.put("/employees/:id", authMiddleware, roleMiddleware(["admin", "hr"]), employeeController.updateEmployee);
router.delete("/employees/:id", authMiddleware, roleMiddleware(["admin"]), employeeController.deleteEmployee);
router.post("/employees/login",  employeeController.loginEmployee);
router.post("/employees/register",  employeeController.registerEmployee);
// for generating fake data
router.post("/employees/data/feed",  generateFakeData.insertEmployees);
router.post("/employees/leave/feed",  generateFakeData.insertLeaveData);
router.post("/employees/attendance/feed",  generateFakeData.insertAttendanceData);
router.post("/employees/fake-attendance",  generateFakeData.insertFakeAttendanceData);
router.post("/employees/fake-leaves",  generateFakeData.insertFakeLeaveData);
router.post("/employees/fake/attendance/monthly",  generateFakeData.insertNovemberAttendanceData);
router.post("/employees/fake/Leaves/monthly",  generateFakeData.insertLeaveDataForAbsentEmployees);
router.post("/employees/fake/employee",  generateFakeData.insertDummyEmployees);

module.exports = router;
