const Attendance = require("../model/Attendance");
const Leave = require("../model/Leave");
const moment = require("moment-timezone");
const Employee = require("../model/Employee");
const cron = require("node-cron");
const { getDistance } = require("geolib");
const { getPreciseDistance } = require("geolib");
const Settings = require("../model/settings");

const formatTime = (workingMinutes) => {
  const hours = Math.floor(workingMinutes / 60); // Get whole hours
  const minutes = Math.floor(workingMinutes % 60); // Get remaining minutes and floor to nearest integer

  // Return formatted time as "Xh Ym"
  return `${hours}h ${minutes}m`;
};


const officeLocation = { latitude:25.363176828849998, longitude:  83.0255244330984}; // Replace with your office coordinates
const radius = 50; 

// ======================= Attendance with location 
// const markAttendance = async (req, res) => {
//   try {
//     const employeeId = req.user.id;
//     const now = moment().tz("Asia/Kolkata");
//     const currentDate = now.format("YYYY-MM-DD");

//     // Extract user's location from request body
//     const { latitude, longitude } = req.body;

//     if (!latitude || !longitude) {
//       return res.status(400).json({ message: "Location data is required." });
//     }

//     // Fetch office location and radius from settings
//     const settings = await Settings.findOne();
//     if (!settings) {
//       return res.status(500).json({ message: "Settings not found." });
//     }

//     const {
//       latitude: officeLat,
//       longitude: officeLon,
//       locationRange: ALLOWED_DISTANCE,
//       locationBasedAttendance,
//     } = settings;

//     if (!locationBasedAttendance) {
//       return res.status(400).json({ message: "Location-based attendance is disabled." });
//     }

//     // Calculate distance from the office
//     const distance = getPreciseDistance(
//       { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
//       { latitude: officeLat, longitude: officeLon }
//     );

//     console.log(`Calculated Distance: ${distance} meters`);

//     if (distance > ALLOWED_DISTANCE) {
//       return res.status(403).json({
//         message: "You are out of the allowed range to mark attendance.",
//         distance,
//       });
//     }

//     // Check if attendance is already marked
//     const existingRecord = await Attendance.findOne({
//       employeeId,
//       date: currentDate,
//     });

//     if (existingRecord) {
//       return res.status(200).json({
//         message: "Attendance already marked successfully for today.",
//         attendance: existingRecord,
//       });
//     }

//     // Check for weekly off days
//     const weekOffDays = settings.weekOffDays.map((day) => moment().day(day).isoWeekday());
//     const isWeeklyOff = weekOffDays.includes(now.isoWeekday());

//     if (isWeeklyOff) {
//       const attendance = new Attendance({
//         employeeId,
//         date: currentDate,
//         status: "weekly-off",
//       });
//       await attendance.save();

//       return res.status(201).json({
//         message: "Attendance marked as weekly-off for today.",
//         attendance,
//       });
//     }

//     // Check for leave
//     const leaveRecord = await Leave.findOne({
//       employeeId,
//       startDate: { $lte: now.toDate() },
//       endDate: { $gte: now.toDate() },
//       status: "approved",
//     });

//     if (leaveRecord) {
//       return res.status(200).json({
//         message: "Employee is on leave today.",
//         status: "on-leave",
//         leaveRecord,
//       });
//     }

//     // Determine attendance status (present, late)
//     const officialStartTime = moment("10:00 AM", "hh:mm A").tz("Asia/Kolkata");
//     const isOnTime = now.isSameOrBefore(officialStartTime);
//     let status = isOnTime ? "present" : "late";

//     // Calculate late time from 10:00 AM
//     const lateTimeInMinutes = isOnTime ? 0 : now.diff(officialStartTime, "minutes");
//     const lateTime = lateTimeInMinutes > 0
//       ? `${Math.floor(lateTimeInMinutes / 60)}h ${lateTimeInMinutes % 60}m`
//       : "0h 0m";

//     // Format check-in time in 12-hour format
//     const checkInTime = now.format("hh:mm A");

//     const attendance = new Attendance({
//       employeeId,
//       date: currentDate,
//       checkInTime,
//       status,
//       lateTime,
//     });

//     await attendance.save();

//     res.status(201).json({
//       message: "Attendance marked successfully.",
//       attendance,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "An error occurred while marking attendance." });
//   }
// };

const markAttendanceWithLocation = async (req, res) => {
  try {
    const employeeId = req.user.id; // Ensure `req.user` contains the authenticated user's info
    const now = moment().tz("Asia/Kolkata"); // Use consistent time zone
    const currentDate = now.format("YYYY-MM-DD");

    // Fetch office location and radius from Settings schema
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(500).json({ error: "Settings configuration not found." });
    }

    const { latitude: officeLat, longitude: officeLong, locationRange, locationBasedAttendance } = settings;

    // Check if attendance already exists for today
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

    // Weekly-off days logic
    const weeklyOffDays = [0, 6]; // Sunday (0) and Saturday (6)
    const isWeeklyOff = weeklyOffDays.includes(now.day());

    // Check if employee is on leave
    const leaveRecord = await Leave.findOne({
      employeeId,
      startDate: { $lte: now.toDate() },
      endDate: { $gte: now.toDate() },
      status: "approved",
    });

    if (leaveRecord) {
      return res.status(200).json({
        message: "Employee is on leave today.",
        status: "on-leave",
        leaveRecord,
      });
    }

    // Handle weekly-off case
    if (isWeeklyOff) {
      const attendance = new Attendance({
        employeeId,
        date: currentDate,
        status: "weekly-off",
      });
      await attendance.save();

      return res.status(201).json({
        message: "Attendance marked as weekly-off for today.",
        attendance,
      });
    }

    // Handle location-based attendance
    if (locationBasedAttendance) {
      const { latitude, longitude } = req.body.location || {};
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Location data is required." });
      }

      const distance = getDistance(
        { latitude, longitude },
        { latitude: officeLat, longitude: officeLong }
      );

      if (distance > locationRange) {
        return res.status(403).json({
          message: "You are not within the office location to mark attendance.",
          distance,
        });
      }
    }

    // Default attendance status
    let status = "absent";
    let lateTimeInMinutes = 0;

    const officialStartTime = now
      .clone()
      .set({ hour: 10, minute: 0, second: 0 });

    // Check attendance timing
    if (now.isSameOrBefore(officialStartTime)) {
      status = "present";
    } else {
      lateTimeInMinutes = now.diff(officialStartTime, "minutes");
      status = lateTimeInMinutes > 0 ? "late" : "present";
    }

    const lateTime = lateTimeInMinutes > 0 ? formatTime(lateTimeInMinutes) : "0h 0m";

    // Create attendance record
    const attendance = new Attendance({
      employeeId,
      date: currentDate,
      checkInTime: now.toDate(),
      status,
      lateTime,
      location: locationBasedAttendance ? { latitude: req.body.location.latitude, longitude: req.body.location.longitude } : undefined,
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




const markAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const now = moment().tz("Asia/Kolkata"); // Use consistent time zone

    // Format date as YYYY-MM-DD for the `date` field
    const currentDate = now.format("YYYY-MM-DD");

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

    // Define weekly-off days (Saturday and Sunday)
    const weeklyOffDays = [0, 6]; // Sunday (0) and Saturday (6)
    const isWeeklyOff = weeklyOffDays.includes(now.day());

    // Check if the employee is on leave
    const leaveRecord = await Leave.findOne({
      employeeId,
      startDate: { $lte: now.toDate() },
      endDate: { $gte: now.toDate() },
      status: "approved",
    });

    if (leaveRecord) {
      return res.status(200).json({
        message: "Employee is on leave today.",
        status: "on-leave",
        leaveRecord,
      });
    }

    // Handle weekly-off case
    if (isWeeklyOff) {
      const attendance = new Attendance({
        employeeId,
        date: currentDate,
        status: "weekly-off",
      });
      await attendance.save();

      return res.status(201).json({
        message: "Attendance marked as weekly-off for today.",
        attendance,
      });
    }

    // Default values for non-weekly-off days
    let status = "absent";
    let lateTimeInMinutes = 0;

    const officialStartTime = now
      .clone()
      .set({ hour: 10, minute: 0, second: 0 });

    // Logic for determining status
    if (now.isSameOrBefore(officialStartTime)) {
      status = "present";
    } else {
      lateTimeInMinutes = now.diff(officialStartTime, "minutes");
      status = lateTimeInMinutes > 0 ? "late" : "present";
    }

    // Format late time
    const lateTime =
      lateTimeInMinutes > 0 ? formatTime(lateTimeInMinutes) : "0h 0m";

    // Create new attendance record
    const attendance = new Attendance({
      employeeId,
      date: currentDate,
      checkInTime: now.toDate(),
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
    res
      .status(500)
      .json({ error: "An error occurred while marking attendance." });
  }
};

// ===========================|| Cron for auto Logout at 11:30PM ||==================

cron.schedule("30 23 * * *", async () => { 
  try {
    const now = moment().tz("Asia/Kolkata");
    const currentDate = now.format("YYYY-MM-DD");

    console.log(`Running auto-logout cron job at: ${now.format("HH:mm:ss")} IST`);

    // Fetch all employees
    const employees = await Employee.find({}); // Adjust query if needed to filter active employees

    for (const employee of employees) {         
      // Check attendance record for the current employee
      const attendanceRecord = await Attendance.findOne({
        date: currentDate,
        employeeId: employee._id,
      });

      if (attendanceRecord) {
        // Auto-checkout if the employee checked in but didn't check out
        if (attendanceRecord.checkInTime && !attendanceRecord.checkOutTime) {
          const checkOutTime = now.toDate();
          const checkInTime = moment(attendanceRecord.checkInTime);

          // Calculate total working time in minutes
          const workingMinutes = moment(checkOutTime).diff(checkInTime, "minutes");

          // Update checkOutTime and totalWorkingTime without modifying status
          await Attendance.findByIdAndUpdate(attendanceRecord._id, {
            checkOutTime,
            totalWorkingTime: formatTime(workingMinutes),
          });

          console.log(`Auto-checked out employee ID: ${employee._id}`);
        } else {
          console.log(
            `Employee ID: ${employee._id} already checked out or has no check-in time.`
          );
        }
      } else {
        console.log(`No attendance record for employee ID: ${employee._id}, skipping.`);
      }
    }

    console.log("Auto-logout process completed.");
  } catch (err) {
    console.error("Error occurred during auto-logout:", err.message);
  }
}, {
  timezone: "Asia/Kolkata", // Force the cron job to run at IST
});



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

    // Calculate total working hours in minutes, then floor them
    const workingMinutes =
      (existingRecord.checkOutTime - existingRecord.checkInTime) / (1000 * 60); // in minutes

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

const getEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;

    // Fetch the employee's approved leave records
    const leaveRecords = await Leave.find({
      employeeId,
      status: "approved",
      startDate: { $lte: new Date() }, // Ensure the leave starts before today
      endDate: { $gte: new Date() }, // Ensure the leave ends after today
    });

    // Fetch the employee's attendance records
    const attendanceRecords = await Attendance.find({ employeeId }).populate(
      "employeeId",
      "employeeId firstName"
    );

    // Loop through the attendance records and check against leave dates
    const updatedAttendance = attendanceRecords.map((record) => {
      // Check if the current attendance date falls within any of the approved leave dates
      const leaveOnThisDay = leaveRecords.some((leave) => {
        let currentDate = new Date(record.date);
        return currentDate >= leave.startDate && currentDate <= leave.endDate;
      });

      if (leaveOnThisDay) {
        // If the employee is on leave, mark the attendance as 'on-leave' and clear check-in/out times
        return {
          ...record.toObject(),
          status: "on-leave",
          checkInTime: null,
          checkOutTime: null,
          totalWorkingHour: null,
          lateTime: null,
        };
      }

      return record;
    });

    res.status(200).json(updatedAttendance);
  } catch (err) {
    console.error("Error fetching employee attendance:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Attendance Records
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate(
      "employeeId",
      "firstName lastName employeeId"
    );
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Logged-In Employee's Attendance
const getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id; // Authenticated employee's ID

    // Get the current date and calculate the start and end of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch attendance records for the current month
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).populate("employeeId", "employeeId firstName leaveBalance");

    // Fetch leave records for the current month
    const leaveRecords = await Leave.find({
      employeeId,
      $or: [
        {
          startDate: { $lte: endOfMonth },
          endDate: { $gte: startOfMonth },
        },
      ],
    });

    const allRecords = [];

    // Process attendance records
    attendanceRecords.forEach((record) => {
      const data = {
        _id: record._id,
        employeeId: record.employeeId,
        date: record.date,
        checkInTime: record.checkInTime,
        lateTime: record.lateTime,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
      allRecords.push(data);
    });

    // Process leave records
    leaveRecords.forEach((leave) => {
      let currentDate = new Date(
        leave.startDate > startOfMonth ? leave.startDate : startOfMonth
      );
      const leaveEndDate = leave.endDate < endOfMonth ? leave.endDate : endOfMonth;

      while (currentDate <= leaveEndDate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        const leaveStatus =
          leave.status === "approved"
            ? "on-leave"
            : leave.status === "pending"
            ? "pending-leave"
            : "rejected-leave";

        allRecords.push({
          _id: leave._id,
          employeeId: {
            _id: leave.employeeId,
            employeeId: req.user.employeeId,
            firstName: req.user.firstName,
            leaveBalance: null,
          },
          date: new Date(dateKey),
          status: leaveStatus,
          checkInTime: null,
          lateTime: null,
          createdAt: leave.createdAt,
          updatedAt: leave.updatedAt,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Sort records by date in ascending order
    allRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json(allRecords);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: err.message });
  }
};


// const getMyAttendance = async (req, res) => {
//   try {
//     const employeeId = req.user.id; // Assuming `req.user` has authenticated user's data

//     // Get the start and end dates of the current month
//     const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // First day of the month
//     const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0); // Last day of the month

//     // Fetch attendance records for the current month sorted by date in descending order
//     const attendance = await Attendance.find({
//       employeeId,
//       date: {
//         $gte: startOfMonth, // Greater than or equal to the start of the month
//         $lte: endOfMonth,  // Less than or equal to the end of the month
//       },
//     })
//       .populate("employeeId", "employeeId firstName")
//       .sort({ date: -1 }); // Sort by date in descending order (-1 for descending)

//     res.status(200).json(attendance);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


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
      date: { $gte: todayStart, $lte: todayEnd }, // Filter attendance within today's date range
    }).populate("employeeId", "employeeId firstName sickLeave casualLeave"); // Populate employee data (optional)

    // Check if attendance is found
    if (attendance.length === 0) {
      return res
        .status(404)
        .json({ message: "No attendance found for today." });
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
    const attendance = await Attendance.findById({ _id: req.params.id });
    console.log(attendance);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    // Delete the attendance record
    await Attendance.findByIdAndDelete(attendance._id);

    res
      .status(200)
      .json({ message: "Attendance record deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============|| Get Employees Attendance For calender || ============================

// const getAttendanceForCalendar = async (req, res) => {
//     try {
//         const employeeId = req.user.id; // Authenticated employee's ID

//         // Fetch attendance records
//         const attendanceRecords = await Attendance.find({ employeeId });

//         // Fetch approved leave records for the employee
//         const leaveRecords = await Leave.find({
//             employeeId,
//             status: 'approved',
//             startDate: { $lte: new Date() }, // Ensure the leave starts before today
//             endDate: { $gte: new Date() }  // Ensure the leave ends after today
//         });

//         // Format data for FullCalendar
//         const events = [];

//         // Process leave records
//         leaveRecords.forEach((leave) => {
//             const leaveDate = leave.startDate;
//             let currentDate = new Date(leaveDate);
//             while (currentDate <= leave.endDate) {
//                 events.push({
//                     title: "ON LEAVE",
//                     date: currentDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
//                     backgroundColor: "#f44336", // Red for "on-leave"
//                     borderColor: "transparent",
//                     textColor: "white",
//                 });
//                 currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
//             }
//         });

//         // Process attendance records
//         attendanceRecords.forEach((record) => {
//             let backgroundColor = "#4caf50"; // Default: Green for "present"
//             if (record.status === "late") {
//                 backgroundColor = "#ff9800"; // Orange for "late"
//             } else if (record.status === "weekly-off") {
//                 backgroundColor = "#9e9e9e"; // Grey for "weekly-off"
//             } else if (record.status === "absent") {
//                 backgroundColor = "#f44336"; // Red for "absent"
//             } else if (record.status === "pending") {
//                 backgroundColor = "#ffeb3b"; // Yellow for "pending"
//             }

//             events.push({
//                 title: record.status.replace(/-/g, " ").toUpperCase(), // Status formatted for display
//                 date: record.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
//                 backgroundColor,
//                 borderColor: "transparent",
//                 textColor: "white",
//             });
//         });

//         res.status(200).json({
//             message: "Attendance data fetched successfully.",
//             events,
//         });
//     } catch (err) {
//         console.error("Error fetching attendance for calendar:", err);
//         res.status(500).json({ error: err.message });
//     }
// };
// ========================


const getAttendanceForCalendar = async (req, res) => {
  try {
    const employeeId = req.user.id; // Authenticated employee's ID

    // Get the current date and calculate the start and end of the current and previous month
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    // Fetch attendance records for the current and previous month
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startOfPreviousMonth, $lte: endOfCurrentMonth },
    });

    // Fetch leave records for the current and previous month
    const leaveRecords = await Leave.find({
      employeeId,
      $or: [
        {
          startDate: { $lte: endOfCurrentMonth },
          endDate: { $gte: startOfPreviousMonth },
        },
      ],
    });

    const events = [];

    // Create a map of attendance records for quick lookup
    const attendanceMap = attendanceRecords.reduce((map, record) => {
      map[record.date.toISOString().split("T")[0]] = record;
      return map;
    }, {});

    // Process leave records
    leaveRecords.forEach((leave) => {
      let currentDate = new Date(
        leave.startDate > startOfPreviousMonth ? leave.startDate : startOfPreviousMonth
      );
      const leaveEndDate =
        leave.endDate < endOfCurrentMonth ? leave.endDate : endOfCurrentMonth;

      while (currentDate <= leaveEndDate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        if (!attendanceMap[dateKey] || leave.status === "approved") {
          let backgroundColor = "#17a2b8"; // Default: Blue for "on-leave"
          let title = "ON LEAVE";

          if (leave.status === "pending") {
            backgroundColor = "#ffeb3b"; // Yellow for pending leave
            title = "PENDING LEAVE";
          } else if (leave.status === "rejected") {
            backgroundColor = "#f29e96"; // Grey for rejected leave
            title = "LEAVE REJECTED";
          }

          events.push({
            title,
            date: dateKey,
            backgroundColor,
            borderColor: "transparent",
            textColor: "white",
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Process attendance records
    attendanceRecords.forEach((record) => {
      let backgroundColor = "#4caf50"; // Default: Green for "present"
      if (record.status === "late") {
        backgroundColor = "#ff9800"; // Orange for "late"
      } else if (record.status === "weekly-off") {
        backgroundColor = "#9e9e9e"; // Grey for "weekly-off"
      } else if (record.status === "absent") {
        backgroundColor = "#f44336"; // Red for "absent"
      } else if (record.status === "pending") {
        backgroundColor = "#ffeb3b"; // Yellow for "pending"
      } else if (record.status === "on-leave") {
        backgroundColor = "#17a2b8"; // Blue for "on-leave"
      }

      events.push({
        title: record.status.replace(/-/g, " ").toUpperCase(), // Status formatted for display
        date: record.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        backgroundColor,
        borderColor: "transparent",
        textColor: "white",
      });
    });

    // Add default weekly-offs for the previous and current month
    const addWeeklyOffs = (start, end) => {
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const normalizedDate = new Date(
          Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
          )
        );
        const day = normalizedDate.getDay(); // 0: Sunday, 6: Saturday
        const dateKey = normalizedDate.toISOString().split("T")[0];

        if ((day === 0 || day === 6) && !attendanceMap[dateKey]) {
          events.push({
            title: "WEEKLY OFF",
            date: dateKey,
            backgroundColor: "#9e9e9e", // Grey for weekly-off
            borderColor: "transparent",
            textColor: "white",
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    };

    addWeeklyOffs(startOfPreviousMonth, endOfPreviousMonth);
    addWeeklyOffs(startOfCurrentMonth, endOfCurrentMonth);

    res.status(200).json({
      message: "Attendance and leave data fetched successfully.",
      events,
    });
  } catch (err) {
    console.error("Error fetching attendance for calendar:", err);
    res.status(500).json({ error: err.message });
  }
};




const getAllEmployeesTodayAttendance = async (req, res) => {
  try {
    // Get the start and end of the current day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set time to 00:00:00
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999); // Set time to 23:59:59

    // Fetch all active employees
    const activeEmployees = await Employee.find({ status: "active" }).select(
      "employeeId firstName lastName"
    );

    // Find attendance records for today, populate employee details
    const attendances = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd },
    }).populate(
      "employeeId",
      "employeeId firstName lastName department designation status"
    );

    // Map attendance records to get the employee IDs who marked attendance
    const markedEmployeeIds = attendances.map(
      (record) => record.employeeId.employeeId
    );

    // Find employees who have not marked attendance
    const notMarkedAttendance = activeEmployees.filter(
      (employee) => !markedEmployeeIds.includes(employee.employeeId)
    );

    // Respond with attendance data and the list of employees who have not marked attendance
    res.status(200).json({
      message: "Attendance data fetched successfully",
      attendanceRecords: attendances,
      notMarkedAttendance,
    });
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
  deleteAttendance,
  getAttendanceForCalendar,
  getAllEmployeesTodayAttendance,
  markAttendanceWithLocation
};
