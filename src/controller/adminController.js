const moment = require('moment');
const ExcelJS = require('exceljs');
const Employee = require('../model/Employee'); // Employee schema
const Attendance = require('../model/Attendance'); // Attendance schema
const Leave = require('../model/Leave'); // Leave schema
const Department = require('../model/Department'); // Leave schema

// Get All Users

// const getAllEmployees = async (req, res) => {
//     try {
//       const emp = await Employee.find({}, '-password').populate({
//         path: 'department',
//         select: 'name description managerId',
//       });
  
//       res.status(200).json(emp);
//     } catch (error) {
//       res.status(500).json({ error: "Failed to fetch employees data!" });
//     }
//   };
  
const getAllEmployees = async (req, res) => {
    try {
      const emp = await Employee.find({}, '-password')
        .sort({ firstName: 1 }) // Sort alphabetically by 'firstName' in ascending order
        .populate({
          path: 'department',
          select: 'name description managerId',
        });
  
      res.status(200).json(emp);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees data!" });
    }
  };
  

// Update User Role
// const updateEmployeeRole = async (req, res) => {
//     const { id } = req.params;
//     const { role } = req.body;

//     if (!role) {
//         return res.status(400).json({ error: "Role is required" });
//     }

//     try {
//         const user = await Employee.findById(id);
//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         Employee.role = role;
//         await Employee.save();

//         res.status(200).json({ message: "User role updated successfully", user });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to update user role" });
//     }
// };
const updateEmployeeRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Validate the role in the request body
    if (!role) {
        return res.status(400).json({ error: "Role is required" });
    }

    try {
        // Find the employee by ID
        const user = await Employee.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the role
        user.role = role;
        await user.save(); // Save the updated document

        res.status(200).json({ message: "User role updated successfully", user });
    } catch (error) {
        console.error("Error updating user role:", error); // Log for debugging
        res.status(500).json({ error: "Failed to update user role" });
    }
};




// Delete User
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Employee.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};



const getAllEmployeeDetail = async (req, res) => {
    try {
        const userRole = req.user.role; // Assuming `role` is available in `req.user`

        // Only admin or HR can access this API
        if (!['admin', 'hr'].includes(userRole)) {
            return res.status(403).json({ message: "Access denied. Only admin and HR can access this data." });
        }

        // Extract startDate and endDate from the request body
        let { startDate, endDate } = req.body;

        // Default to current month's range if no dates are provided
        if (!startDate || !endDate) {
            const currentMonth = moment().month(); // Current month (0-based index)
            const currentYear = moment().year(); // Current year
            startDate = moment().year(currentYear).month(currentMonth).startOf('month').toDate();
            endDate = moment().year(currentYear).month(currentMonth).endOf('month').toDate();
        } else {
            // Parse and validate custom dates
            startDate = moment(startDate, 'YYYY-MM-DD').toDate();
            endDate = moment(endDate, 'YYYY-MM-DD').toDate();

            if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
                return res.status(400).json({ message: "Invalid date format. Use 'YYYY-MM-DD' for startDate and endDate." });
            }
        }

        // Fetch all employees with `role: "employee"`
        const employees = await Employee.find({ role: 'employee' }).populate('department', 'name');

        // Calculate leave and attendance details for each employee
        const employeeDetails = await Promise.all(
            employees.map(async (employee) => {
                const employeeId = employee._id;

                // Calculate total leaves taken within the date range
                const leaves = await Leave.find({
                    employeeId,
                    status: 'approved',
                    startDate: { $gte: startDate },
                    endDate: { $lte: endDate },
                });

                const totalLeaveTaken = leaves.reduce((total, leave) => {
                    const leaveDays =
                        moment(leave.endDate).diff(moment(leave.startDate), 'days') + 1;
                    return total + leaveDays;
                }, 0);

                // Calculate attendance (days present in the office)
                const totalWorkingDaysInRange = moment(endDate).diff(moment(startDate), 'days') + 1;
                const attendanceRecords = await Attendance.find({
                    employeeId,
                    date: { $gte: startDate, $lte: endDate },
                    status: 'present',
                });

                const daysPresent = attendanceRecords.length;

                // Calculate absent days
                const daysAbsent = totalWorkingDaysInRange - (totalLeaveTaken + daysPresent);

                // Additional fields in response
                return {
                    employeeId: employee.employeeId,
                    name: `${employee.firstName} ${employee.lastName}`,
                    email: employee.email,
                    department: employee.department,
                    designation: employee.designation,
                    totalLeaveTaken,
                    daysPresent,
                    daysAbsent: daysAbsent < 0 ? 0 : daysAbsent, // Handle edge cases
                    totalWorkingDays: totalWorkingDaysInRange,
                    leaveBalance: employee.leaveBalance, // Calculated from the schema
                    status: employee.status,
                };
            })
        );

        res.status(200).json({
            employees: employeeDetails,
            dateRange: { startDate, endDate },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching employee data." });
    }
};





// const getMonthlyEmployeeDetails = async (req, res) => {
//     try {
//         const userRole = req.user.role; // Assuming `role` is available in `req.user`

//         // Only admin or HR can access this API
//         if (!['admin', 'hr'].includes(userRole)) {
//             return res.status(403).json({ message: "Access denied. Only admin and HR can access this data." });
//         }

//         // Get month and year from the request query or use the current month and year
//         let { month, year } = req.query;

//         if (!month || !year) {
//             const currentDate = moment(); // Current date
//             month = currentDate.format('MM'); // Current month in two-digit format
//             year = currentDate.format('YYYY'); // Current year
//         }

//         // Parse the start and end dates for the given month and year
//         const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('month').toDate();
//         const endDate = moment(startDate).endOf('month').toDate();

//         // Fetch attendance records within the month
//         const attendanceRecords = await Attendance.find({
//             date: { $gte: startDate, $lte: endDate },
//         }).distinct('employeeId');

//         if (attendanceRecords.length === 0) {
//             return res.status(404).json({ message: "No attendance records found for the given month." });
//         }

//         // Fetch employee details for the above attendance records
//         const employees = await Employee.find({
//             _id: { $in: attendanceRecords },
//             role: 'employee', // Only include employees with role 'employee'
//         }).populate('department', 'name');

//         if (employees.length === 0) {
//             return res.status(404).json({ message: "No employees with role 'employee' found for the given month." });
//         }

//         // Calculate leave and attendance details for each employee
//         const employeeDetails = await Promise.all(
//             employees.map(async (employee) => {
//                 const employeeId = employee._id;

//                 // Fetch all leaves overlapping with the given date range
//                 const leaves = await Leave.find({
//                     employeeId,
//                     status: 'approved',
//                     $or: [
//                         { startDate: { $gte: startDate, $lte: endDate } },
//                         { endDate: { $gte: startDate, $lte: endDate } },
//                         { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
//                     ],
//                 });

//                 // Separate sick and casual leaves and calculate total leave days
//                 const totalSickLeaveInMonth = leaves
//                     .filter((leave) => leave.type === 'sickLeave')
//                     .reduce((total, leave) => {
//                         const overlapStart = moment.max(moment(startDate), moment(leave.startDate));
//                         const overlapEnd = moment.min(moment(endDate), moment(leave.endDate));
//                         return total + overlapEnd.diff(overlapStart, 'days') + 1;
//                     }, 0);

//                 const totalCasualLeaveInMonth = leaves
//                     .filter((leave) => leave.type === 'casualLeave')
//                     .reduce((total, leave) => {
//                         const overlapStart = moment.max(moment(startDate), moment(leave.startDate));
//                         const overlapEnd = moment.min(moment(endDate), moment(leave.endDate));
//                         return total + overlapEnd.diff(overlapStart, 'days') + 1;
//                     }, 0);

//                 const totalLeaveTakenInMonth = totalSickLeaveInMonth + totalCasualLeaveInMonth;

//                 // Fetch attendance records for the given month
//                 const attendanceRecords = await Attendance.find({
//                     employeeId,
//                     date: { $gte: startDate, $lte: endDate },
//                 });

//                 const daysPresent = attendanceRecords.length;

//                 // Calculate total paid days
//                 const totalPaidDays = totalCasualLeaveInMonth + totalSickLeaveInMonth + daysPresent;

//                 // Populate employee details
//                 return {
//                     employeeId: employee.employeeId,
//                     name: `${employee.firstName} ${employee.lastName}`,
//                     email: employee.email,
//                     department: employee.department?.name || 'N/A',
//                     designation: employee.designation,
//                     totalSickLeaveInMonth,
//                     totalCasualLeaveInMonth,
//                     totalLeaveTakenInMonth,
//                     daysPresent,
//                     totalPaidDays,
//                     leaveBalance: employee.leaveBalance, // Assuming leave balance is stored in the employee schema
//                     status: employee.status,
//                 };
//             })
//         );

//         res.status(200).json({
//             employees: employeeDetails,
//             month,
//             year,
//         });
//     } catch (error) {
//         console.error('Error fetching monthly employee details:', error);
//         res.status(500).json({ message: "An error occurred while fetching employee data.", error });
//     }
// };



// const getMonthlyEmployeeDetails = async (req, res) => {
//     try {
//         const userRole = req.user.role; // Assuming `role` is available in `req.user`

//         // Only admin or HR can access this API
//         if (!['admin', 'hr'].includes(userRole)) {
//             return res.status(403).json({ message: "Access denied. Only admin and HR can access this data." });
//         }

//         // Get month and year from the request query or use the current month and year
//         let { month, year } = req.query;

//         if (!month || !year) {
//             const currentDate = moment(); // Current date
//             month = currentDate.format('MM'); // Current month in two-digit format
//             year = currentDate.format('YYYY'); // Current year
//         }

//         // Parse the start and end dates for the given month and year
//         const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('month').toDate();
//         const endDate = moment(startDate).endOf('month').toDate();

//         // Fetch all employees with role "employee"
//         const employees = await Employee.find({ role: 'employee' }).populate('department', 'name');

//         if (employees.length === 0) {
//             return res.status(404).json({ message: "No employees found for the given month." });
//         }

//         // Calculate leave and attendance details for each employee
//         const employeeDetails = await Promise.all(
//             employees.map(async (employee) => {
//                 const employeeId = employee._id;

//                 // Fetch all approved leaves overlapping with the given date range
//                 const leaves = await Leave.find({
//                     employeeId,
//                     status: 'approved',
//                     $or: [
//                         { startDate: { $gte: startDate, $lte: endDate } },
//                         { endDate: { $gte: startDate, $lte: endDate } },
//                         { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
//                     ],
//                 });

//                 // Calculate total leave days in the month
//                 const totalLeaveDaysInMonth = leaves.reduce((total, leave) => {
//                     // Calculate the actual number of leave days in the given month
//                     const overlapStart = moment.max(moment(startDate), moment(leave.startDate));
//                     const overlapEnd = moment.min(moment(endDate), moment(leave.endDate));
//                     const leaveDaysInMonth = overlapEnd.diff(overlapStart, 'days') + 1;
//                     return total + Math.max(0, leaveDaysInMonth); // Ensure non-negative values
//                 }, 0);

//                 // Fetch attendance records for the given month (marked as present)
//                 const attendanceRecords = await Attendance.find({
//                     employeeId,
//                     date: { $gte: startDate, $lte: endDate },
//                     status: 'present', // Only count days marked as present
//                 });

//                 // Calculate daysPresent from attendance records
//                 const daysPresent = attendanceRecords.length;

//                 // Total days in the month
//                 const totalDaysInMonth = moment(endDate).diff(moment(startDate), 'days') + 1;

//                 // Calculate total absent days
//                 const daysAbsent = totalDaysInMonth - daysPresent;

//                 // Total paid days is equivalent to days present
//                 const totalPaidDays = daysPresent;

//                 // Leave balance: Subtract used leaves from the employee's total leave balance
//                 const leaveBalance = employee.leaveBalance - totalLeaveDaysInMonth;

//                 return {
//                     employeeId: employee.employeeId,
//                     name: `${employee.firstName} ${employee.lastName}`,
//                     email: employee.email,
//                     department: employee.department?.name || 'N/A',
//                     designation: employee.designation,
//                     totalLeaveDaysInMonth,
//                     daysPresent,
//                     totalAbsentDays: daysAbsent, // Total Absent Days
//                     totalPaidDays,
//                     leaveBalance: leaveBalance < 0 ? 0 : leaveBalance, // Ensure leave balance doesn't go negative
//                     status: employee.status,
//                 };
//             })
//         );

//         res.status(200).json({
//             employees: employeeDetails,
//             month,
//             year,
//         });
//     } catch (error) {
//         console.error('Error fetching monthly employee details:', error);
//         res.status(500).json({ message: "An error occurred while fetching employee data.", error });
//     }
// };

const getMonthlyEmployeeDetails = async (req, res) => {
    try {
        const userRole = req.user.role;

        if (!['admin', 'hr'].includes(userRole)) {
            return res.status(403).json({ message: "Access denied. Only admin and HR can access this data." });
        }

        let { month, year } = req.query;

        if (!month || !year) {
            const currentDate = moment();
            month = currentDate.format('MM');
            year = currentDate.format('YYYY');
        }

        const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('month').toDate();
        const endDate = moment(startDate).endOf('month').toDate();

        const employees = await Employee.find({ role: 'employee' }).populate('department', 'name');

        if (employees.length === 0) {
            return res.status(404).json({ message: "No employees found for the given month." });
        }

        const employeeDetails = await Promise.all(
            employees.map(async (employee) => {
                const employeeId = employee._id;

                // Fetch approved leaves within the given date range
                const leaves = await Leave.find({
                    employeeId,
                    status: 'approved',
                    $or: [
                        { startDate: { $gte: startDate, $lte: endDate } },
                        { endDate: { $gte: startDate, $lte: endDate } },
                        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
                    ],
                });

                let totalLeaveDaysInMonth = 0;
                let adjustedPaidDays = 0;
                const leaveTypesTaken = {
                    LWP: 0,
                    casualLeave: 0,
                    sickLeave: 0
                };

                leaves.forEach((leave) => {
                    const overlapStart = moment.max(moment(startDate), moment(leave.startDate));
                    const overlapEnd = moment.min(moment(endDate), moment(leave.endDate));
                    const leaveDaysInMonth = overlapEnd.diff(overlapStart, 'days') + 1;

                    if (leave.leaveType === 'LWP') {
                        leaveTypesTaken.LWP += leaveDaysInMonth; // LWP does not add to paid days
                    } else if (leave.leaveType === 'casualLeave' && employee.casualLeave > 0) {
                        const adjustedCasualDays = Math.min(employee.casualLeave, leaveDaysInMonth);
                        employee.casualLeave -= adjustedCasualDays;
                        adjustedPaidDays += adjustedCasualDays; // Adds to paid days
                        leaveTypesTaken.casualLeave += adjustedCasualDays;
                    } else if (leave.leaveType === 'sickLeave' && employee.sickLeave > 0) {
                        const adjustedSickDays = Math.min(employee.sickLeave, leaveDaysInMonth);
                        employee.sickLeave -= adjustedSickDays;
                        adjustedPaidDays += adjustedSickDays; // Adds to paid days
                        leaveTypesTaken.sickLeave += adjustedSickDays;
                    }

                    totalLeaveDaysInMonth += leaveDaysInMonth;
                });

                // Fetch attendance records for the month
                const attendanceRecords = await Attendance.find({
                    employeeId,
                    date: { $gte: startDate, $lte: endDate },
                });

                const daysPresent = attendanceRecords.filter(record => record.status === 'present').length;
                const totalDaysInMonth = moment(endDate).diff(moment(startDate), 'days') + 1;

                const daysAbsent = Math.max(0, totalDaysInMonth - (daysPresent + totalLeaveDaysInMonth));
                const totalPaidDays = daysPresent + adjustedPaidDays; // Include only present days and paid leaves

                const leaveBalance = {
                    sickLeave: employee.sickLeave,
                    casualLeave: employee.casualLeave,
                };

                return {
                    employeeId: employee.employeeId,
                    name: `${employee.firstName} ${employee.lastName}`,
                    email: employee.email,
                    department: employee.department?.name || 'N/A',
                    designation: employee.designation,
                    totalLeaveDaysInMonth,
                    daysPresent,
                    totalAbsentDays: daysAbsent,
                    totalPaidDays,
                    leaveBalance,
                    leaveTypesTaken,
                    status: employee.status,
                };
            })
        );

        res.status(200).json({
            employees: employeeDetails,
            month,
            year,
        });
    } catch (error) {
        console.error('Error fetching monthly employee details:', error);
        res.status(500).json({ message: "An error occurred while fetching employee data.", error });
    }
};



const downloadEmployeeDetails = async (req, res) => {
    try {
        req.query.export = true;

        let employees, dateRange;
        try {
            ({ employees, dateRange } = await getAllEmployeeDetail(req, res));
        } catch (err) {
            console.error("Error fetching employee details:", err);
            return res.status(500).json({ message: "Failed to fetch employee details." });
        }

        if (!employees || !dateRange) {
            console.error("No data returned from getAllEmployeeDetail");
            return res.status(404).json({ message: "No data found for the given date range." });
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Employee Details');

        worksheet.columns = [
            { header: 'Employee ID', key: 'employeeId', width: 15 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Designation', key: 'designation', width: 20 },
            { header: 'Total Leave Taken', key: 'totalLeaveTaken', width: 20 },
            { header: 'Days Present', key: 'daysPresent', width: 15 },
            { header: 'Days Absent', key: 'daysAbsent', width: 15 },
            { header: 'Total Working Days', key: 'totalWorkingDays', width: 20 },
            { header: 'Leave Balance', key: 'leaveBalance', width: 15 },
            { header: 'Status', key: 'status', width: 10 },
        ];

        employees.forEach((employee) => worksheet.addRow(employee));

        worksheet.addRow([]);
        worksheet.addRow(['Generated Date Range:', `${moment(dateRange.startDate).format('YYYY-MM-DD')} - ${moment(dateRange.endDate).format('YYYY-MM-DD')}`]);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="EmployeeDetails.xlsx"');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error generating Excel file:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "An error occurred while generating the Excel file." });
        }
    }
};



// const getAdminDashboardData = async (req, res) => {
//     try {
//         const userRole = req.user.role; // Assuming `role` is available in `req.user`

//         // Only admin can access this API
//         if (userRole !== 'admin') {
//             return res.status(403).json({ message: "Access denied. Only admin can access this data." });
//         }

//         const today = new Date();
//         const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//         const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//         // 1. Total employee count department-wise
//         const employeeCountByDepartment = await Employee.aggregate([
//             {
//                 $group: {
//                     _id: "$department", // Group by department ID
//                     totalEmployees: { $sum: 1 },
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "departments", // Assuming the collection is named 'departments'
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "departmentDetails",
//                 },
//             },
//             {
//                 $unwind: "$departmentDetails",
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     departmentName: "$departmentDetails.name",
//                     totalEmployees: 1,
//                 },
//             },
//         ]);

//         // 2. Total count of present employees today in each department
//         const presentEmployeesByDepartment = await Attendance.aggregate([
//             {
//                 $match: {
//                     date: { $gte: startOfDay, $lte: endOfDay },
//                     status: "present",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "employees",
//                     localField: "employeeId",
//                     foreignField: "_id",
//                     as: "employeeDetails",
//                 },
//             },
//             {
//                 $unwind: "$employeeDetails",
//             },
//             {
//                 $group: {
//                     _id: "$employeeDetails.department",
//                     totalPresent: { $sum: 1 },
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "departments",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "departmentDetails",
//                 },
//             },
//             {
//                 $unwind: "$departmentDetails",
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     departmentName: "$departmentDetails.name",
//                     totalPresent: 1,
//                 },
//             },
//         ]);

//         // 3. Total leave request count of today with status 'pending'
//         const pendingLeaveRequestsToday = await Leave.countDocuments({
//             status: "pending",
//             startDate: { $lte: endOfDay },
//             endDate: { $gte: startOfDay },
//         });

//         // 4. Total count of departments
//         const totalDepartments = await Department.countDocuments();

//         res.status(200).json({
//             totalDepartments,
//             employeeCountByDepartment,
//             presentEmployeesByDepartment,
//             pendingLeaveRequestsToday,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "An error occurred while fetching dashboard data." });
//     }
// };


const getAdminDashboardData = async (req, res) => {
    try {
        const userRole = req.user.role; // Assuming `role` is available in `req.user`

        // Only admin can access this API
        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Access denied. Only admin can access this data." });
        }

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // 1. Total employee count department-wise, including departments with 0 employees
        const employeeCountByDepartment = await Department.aggregate([
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "department",
                    as: "employeeDetails",
                },
            },
            {
                $project: {
                    departmentName: "$name",
                    totalEmployees: { $size: "$employeeDetails" }, // Count number of employees
                },
            },
        ]);

        // 2. Total count of present employees today in each department
        const presentEmployeesByDepartment = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startOfDay, $lte: endOfDay },
                    // status: "present",
                },
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employeeId",
                    foreignField: "_id",
                    as: "employeeDetails",
                },
            },
            {
                $unwind: "$employeeDetails",
            },
            {
                $group: {
                    _id: "$employeeDetails.department",
                    totalPresent: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "_id",
                    foreignField: "_id",
                    as: "departmentDetails",
                },
            },
            {
                $unwind: "$departmentDetails",
            },
            {
                $project: {
                    _id: 0,
                    departmentName: "$departmentDetails.name",
                    totalPresent: 1,
                },
            },
        ]);

        // 3. Total leave request count of today with status 'pending'
        const pendingLeaveRequestsToday = await Leave.countDocuments({
            status: "pending",
            // $or: [
            //     { startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } }, // Overlaps today
            //     { startDate: { $gte: startOfDay, $lte: endOfDay } },              // Starts today
            // ],
        });

        // 4. Total count of departments
        const totalDepartments = await Department.countDocuments();

        res.status(200).json({
            totalDepartments,
            employeeCountByDepartment,
            presentEmployeesByDepartment,
            pendingLeaveRequestsToday,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching dashboard data." });
    }
};



module.exports = {

    updateEmployeeRole,
    deleteUser,
    getAllEmployeeDetail,
    getMonthlyEmployeeDetails,
    downloadEmployeeDetails,
    getAdminDashboardData,
    getAllEmployees
};
