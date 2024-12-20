const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const attendanceController = require("../../../controller/attendanceController");
const router = express.Router();

// Attendance Routes
router.get("/attendance", authMiddleware, roleMiddleware(["admin", "hr"]), attendanceController.getAllAttendance); 
router.get("/attendance/mine", authMiddleware, roleMiddleware(["employee"]), attendanceController.getMyAttendance); 
router.get("/attendance/calender", authMiddleware, roleMiddleware(["employee"]), attendanceController.getAttendanceForCalendar); 
router.get("/attendance/today/all", authMiddleware, roleMiddleware(["admin", "hr"]), attendanceController.getAllEmployeesTodayAttendance); 
router.get("/attendance/today/mine", authMiddleware, roleMiddleware(["employee"]), attendanceController.getMyTodayAttendance); 
router.get("/attendance/date/:date", authMiddleware, roleMiddleware(["admin", "hr"]), attendanceController.getAttendanceByDate);
router.get("/attendance/employee/:employeeId", authMiddleware, roleMiddleware(["admin", "hr"]), attendanceController.getEmployeeAttendance);  
router.delete("/attendance/delete/:id", attendanceController.deleteAttendance);  

// Mark attendance (check-in) - Employees can mark attendance only once per day
router.post("/attendance", authMiddleware, roleMiddleware(["employee"]), attendanceController.markAttendance);

// Mark check-out - Employees can mark checkout only once they have checked in
router.put("/attendance/checkout", authMiddleware, roleMiddleware(["employee"]), attendanceController.markCheckOut);





module.exports = router;
