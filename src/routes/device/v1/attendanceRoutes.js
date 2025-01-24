const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const attendanceController = require("../../../controller/attendanceController");
const router = express.Router();

// Attendance Routes
router.get("/attendance", authMiddleware, roleMiddleware(["admin", "hr", "manager"]), attendanceController.getAllAttendance); 
router.get("/attendance/mine", authMiddleware, roleMiddleware(["employee", "hr", 'manager']), attendanceController.getMyAttendance); 
router.get("/attendance/calender", authMiddleware, roleMiddleware(["employee", "hr", 'manager']), attendanceController.getAttendanceForCalendar); 
router.get("/attendance/today/all", authMiddleware, roleMiddleware(["admin","hr", 'manager']), attendanceController.getAllEmployeesTodayAttendance); 
router.get("/attendance/today/mine", authMiddleware, roleMiddleware(["employee", "hr", 'manager']), attendanceController.getMyTodayAttendance); 
router.get("/attendance/date/:date", authMiddleware, roleMiddleware(["admin","hr", 'manager']), attendanceController.getAttendanceByDate);
router.get("/attendance/employee/:employeeId", authMiddleware, roleMiddleware(["admin", "hr", 'manager']), attendanceController.getEmployeeAttendance);  
router.delete("/attendance/delete/:id", attendanceController.deleteAttendance);  

// Mark attendance (check-in) - Employees can mark attendance only once per day
router.post("/attendance", authMiddleware, roleMiddleware(["employee", "hr", 'manager']), attendanceController.markAttendance);
router.post("/attendance/with-loaction", authMiddleware, roleMiddleware(["employee", "hr", 'manager']), attendanceController.markAttendanceWithLocation);

// Mark check-out - Employees can mark checkout only once they have checked in
router.put("/attendance/checkout", authMiddleware, roleMiddleware(["employee","hr", 'manager']), attendanceController.markCheckOut);





module.exports = router;
