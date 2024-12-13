const Attendance = require("../model/Attendance");
const Leave = require("../model/Leave");

// Helper function to format time in "Xh Ym" format
const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60); // Get the hours
    const mins = minutes % 60; // Get the remaining minutes
    return `${hours}h ${mins}m`; // Return formatted string
};

// Clock In Attendance
const markAttendance = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const now = new Date();

        // Format date as YYYY-MM-DD for the `date` field
        const currentDate = now.toISOString().split("T")[0];

        // Check if attendance already exists for the employee on the same date
        const existingRecord = await Attendance.findOne({
            employeeId,
            date: currentDate,
        });

        if (existingRecord) {
            return res.status(200).json({
                message: "Attendance already marked successfully for today.",
                attendance: existingRecord,
            });
        }

        // Check if the employee is on leave
        const leaveRecord = await Leave.findOne({
            employeeId,
            startDate: { $lte: now },
            endDate: { $gte: now },
            status: "approved",
        });

        if (leaveRecord) {
            return res.status(200).json({
                message: "Employee is on leave today.",
                status: "on-leave",
                leaveRecord,
            });
        }

        // Extract the time from the current date
        const currentHour = now.getHours();
        const officialStartTime = new Date(now);
        officialStartTime.setHours(10, 0, 0); // Set to 10:00 AM

        // Default values
        let status = "absent";
        let lateTimeInMinutes = 0;

        // Define weekly-off days (e.g., Sunday)
        const weeklyOffDays = [0]; // Sunday is 0
        const isWeeklyOff = weeklyOffDays.includes(now.getDay());

        // Logic for determining status
        if (isWeeklyOff) {
            status = "weekly-off";
        } else if (currentHour >= 6 && currentHour < 10) {
            status = "present";
            if (now > officialStartTime) {
                lateTimeInMinutes = Math.floor((now - officialStartTime) / (60 * 1000));
                if (lateTimeInMinutes > 0) {
                    status = "late";
                }
            }
        } else if (currentHour >= 10) {
            status = "late";
            lateTimeInMinutes = Math.floor((now - officialStartTime) / (60 * 1000));
        }

        // Format late time in "Xh Ym" format
        const lateTime = formatTime(lateTimeInMinutes);

        // Create new attendance record
        const attendance = new Attendance({
            employeeId,
            date: currentDate,
            checkInTime: now,
            status,
            lateTime,
        });

        await attendance.save();

        res.status(201).json({
            message: "Attendance marked successfully.",
            attendance,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "An error occurred while marking attendance." });
    }
};


// Clock out Attendance
const markCheckOut = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const now = new Date();

        // Format date as YYYY-MM-DD for the `date` field
        const currentDate = now.toISOString().split("T")[0];

        // Find the attendance record for the employee on this day
        const existingRecord = await Attendance.findOne({
            employeeId,
            date: currentDate,     
        });

        if (!existingRecord) {
            return res.status(404).json({
                message: "No check-in record found for today",
            });
        }

        if (existingRecord.checkOutTime) {
            return res.status(400).json({
                message: "You have already checked out today",
            });
        }

        // Set the check-out time
        existingRecord.checkOutTime = now;

        // Calculate total working hours in minutes
        const workingMinutes = (existingRecord.checkOutTime - existingRecord.checkInTime) / (1000 * 60); // in minutes

        // Format total working hours as "Xh Ym"
        const totalWorkingHour = formatTime(workingMinutes);

        // Save the updated record
        existingRecord.totalWorkingHour = totalWorkingHour;

        await existingRecord.save();

        res.status(200).json({
            message: "Checked out successfully",
            attendance: existingRecord,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// Get Attendance By Date
const getAttendanceByDate = async (req, res) => {
    try {
        const attendance = await Attendance.find({ date: req.params.date });
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Employee Attendance
const getEmployeeAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ employeeId: req.params.employeeId }).populate('employeeId', 'employeeId firstName');
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Attendance Records
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find().populate('employeeId', 'firstName lastName employeeId');
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Logged-In Employee's Attendance
const getMyAttendance = async (req, res) => {
    try {
        const employeeId = req.user.id; // Assuming `req.user` has authenticated user's data
        const attendance = await Attendance.find({ employeeId }).populate('employeeId', 'employeeId firstName');
        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Logged-In Employee's Attendance for Today
const getMyTodayAttendance = async (req, res) => {
    try {
        const employeeId = req.user.id; // Assuming `req.user` has authenticated user's data
        
        // Get the current date (today)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Set time to 00:00:00 for the start of today
        const todayEnd = new Date(todayStart);
        todayEnd.setHours(23, 59, 59, 999); // Set time to 23:59:59 for the end of today

        // Find attendance for the logged-in employee for today
        const attendance = await Attendance.find({
            employeeId,
            date: { $gte: todayStart, $lte: todayEnd } // Filter attendance within today's date range
        }).populate('employeeId', 'employeeId firstName sickLeave casualLeave'); // Populate employee data (optional)

        // Check if attendance is found
        if (attendance.length === 0) {
            return res.status(404).json({ message: "No attendance found for today." });
        }

        res.status(200).json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const deleteAttendance = async (req, res) => {
    try {
       // Get the attendance ID from the URL parameters

        // Check if the attendance record exists
        const attendance = await Attendance.findById({_id : req.params.id});
        console.log(attendance);
        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found." });
        }

        // Delete the attendance record
        await Attendance.findByIdAndDelete(attendance._id);

        res.status(200).json({ message: "Attendance record deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    markAttendance,
    markCheckOut,
    getAttendanceByDate,
    getEmployeeAttendance,
    getAllAttendance,
    getMyAttendance,
    getMyTodayAttendance,
    deleteAttendance
};