const moment = require('moment');
const Leave = require('../model/Leave')
const Employee = require('../model/Employee');
const { default: mongoose } = require('mongoose');

// Get All Leaves
// const getAllLeaves = async (req, res) => {
//     try {
//         const leaves = await Leave.find()
//             .populate('employeeId', 'employeeId firstName lastName department')
//             // .populate('approvedBy', 'employeeId firstName lastName department role')
//             .sort({ createdAt: -1 });
        
//         res.status(200).json(leaves);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('employeeId', 'employeeId firstName lastName department')
            .populate('level1ReportingManager', 'employeeId firstName lastName department')
            .populate('level2ReportingManager', 'employeeId firstName lastName department')
            .sort({ createdAt: -1 });

        res.status(200).json(leaves);
    } catch (err) {
        console.error("Error fetching leave data:", err);
        res.status(500).json({ error: err.message });
    }
};


// Get Leave By ID
const getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('employeeId', 'employeeId firstName lastName department')  .populate('level1ReportingManager', 'employeeId firstName lastName department')
        .populate('level2ReportingManager', 'employeeId firstName lastName department') .sort({createdAt: -1})
        if (!leave) return res.status(404).json({ message: "Leave not found" });
        res.status(200).json(leave);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Get My Leaves
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employeeId: req.user.id }).populate('employeeId', 'employeeId firstName lastName department totalLeaveTaken sickLeave casualLeave').sort({ createdAt: -1 });;
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

 

// const requestLeave = async (req, res) => {
//     try {
//         const { leaveType, startDate, endDate, reason } = req.body;
//         const employeeId = req.user.id; 

//         // Validate input fields
//         if (!leaveType || !startDate || !endDate) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         // Validate leave type
//         if (!['sickLeave', 'casualLeave', 'LWP'].includes(leaveType)) {
//             return res.status(400).json({ message: "Invalid leave type" });
//         }

//         // Validate date range
//         const start = moment(startDate);
//         const end = moment(endDate);
//         const leaveDays = end.diff(start, "days") + 1; // Include the end day

//         if (leaveDays <= 0) {
//             return res.status(400).json({ message: "Invalid leave duration" });
//         }

//         // Fetch employee data
//         const employee = await Employee.findById(employeeId);
//         if (!employee) {
//             return res.status(404).json({ message: "Employee not found" });
//         }

//         // Check leave balance
//         const leaveBalance = employee[leaveType];
//         if (leaveBalance < leaveDays) {
//             return res.status(400).json({
//                 message: `Insufficient ${leaveType} balance. Available: ${leaveBalance} days`,
//             });
//         }

//         // Check monthly leave cap
//         const leavesThisMonth = await Leave.find({
//             employeeId,
//             status: { $ne: "rejected" }, // Only consider non-rejected leaves
//             startDate: { $gte: start.startOf("month").toDate() },
//             endDate: { $lte: end.endOf("month").toDate() },
//         });

//         const leavesTakenThisMonth = leavesThisMonth.reduce((total, leave) => {
//             return total + (moment(leave.endDate).diff(moment(leave.startDate), "days") + 1);
//         }, 0);

//         if (leavesTakenThisMonth + leaveDays > 4) {
//             return res.status(400).json({
//                 message: "You can only take a maximum of 4 leaves in a month",
//             });
//         }

//         // Create a leave request
//         const leaveRequest = new Leave({
//             employeeId,
//             leaveType,
//             startDate,
//             endDate,
//             reason,
//             status: "pending",
//         });

//         await leaveRequest.save();

//         res.status(201).json({
//             message: "Leave requested successfully, pending approval",
//             leaveRequest,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "An error occurred while processing the request" });
//     }
// };

const requestLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        const employeeId = req.user.id; 

        // Validate input fields
        if (!leaveType || !startDate || !endDate) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate leave type
        if (!['sickLeave', 'casualLeave', 'LWP'].includes(leaveType)) {
            return res.status(400).json({ message: "Invalid leave type" });
        }

        // Validate date range
        const start = moment(startDate);
        const end = moment(endDate);
        const leaveDays = end.diff(start, "days") + 1; // Include the end day

        if (leaveDays <= 0) {
            return res.status(400).json({ message: "Invalid leave duration" });
        }

        // Fetch employee data along with reporting managers
        const employee = await Employee.findById(employeeId).select('level1ReportingManager level2ReportingManager sickLeave casualLeave LWP');
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Check leave balance
        const leaveBalance = employee[leaveType];
        if (leaveBalance < leaveDays) {
            return res.status(400).json({
                message: `Insufficient ${leaveType} balance. Available: ${leaveBalance} days`,
            });
        }

        // Check monthly leave cap
        const leavesThisMonth = await Leave.find({
            employeeId,
            status: { $ne: "rejected" },
            startDate: { $gte: start.startOf("month").toDate() },
            endDate: { $lte: end.endOf("month").toDate() },
        });

        const leavesTakenThisMonth = leavesThisMonth.reduce((total, leave) => {
            return total + (moment(leave.endDate).diff(moment(leave.startDate), "days") + 1);
        }, 0);

        if (leavesTakenThisMonth + leaveDays > 4) {
            return res.status(400).json({
                message: "You can only take a maximum of 4 leaves in a month",
            });
        }

        // Create a leave request with managers included
        const leaveRequest = new Leave({
            employeeId,
            leaveType,
            startDate,
            endDate,
            reason,
            status: "pending",
            level1ReportingManager: employee.level1ReportingManager, // Assign manager
            level2ReportingManager: employee.level2ReportingManager // Assign manager
        });

        await leaveRequest.save();

        res.status(201).json({
            message: "Leave requested successfully, pending approval",
            leaveRequest,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing the request" });
    }
};





const updateLeaveStatus = async (req, res) => {
    try {
        const { status, rejectionReason, approverId } = req.body;
        const leave = await Leave.findById(req.params.id).populate(
            "employeeId",
            "employeeId firstName lastName sickLeave casualLeave totalLeaveTaken level1ReportingManager level2ReportingManager"
        );

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        const employee = leave.employeeId;

        // Log to debug the approverId and manager IDs
        console.log("Approver ID:", approverId);
        console.log("Level 1 Manager ID:", String(employee.level1ReportingManager));
        console.log("Level 2 Manager ID:", String(employee.level2ReportingManager));

        // Check if approver is Level 1 or Level 2 reporting manager
        if (approverId === String(employee.level1ReportingManager)) {
            if (leave.level1Approval !== "pending") {
                return res.status(400).json({ message: "Level 1 manager has already reviewed this leave request" });
            }

            if (status === "rejected" && !rejectionReason) {
                return res.status(400).json({ message: "Rejection reason is required" });
            }

            leave.level1Approval = status;

            if (status === "rejected") {
                leave.status = "rejected";
                leave.rejectionReason = rejectionReason;
            } else if (status === "approved") {
                if (String(employee.level1ReportingManager) === String(employee.level2ReportingManager)) {
                    leave.level2Approval = "approved";

                    if (leave.leaveType === "sickLeave" && employee.sickLeave <= 0) {
                        return res.status(400).json({ message: "Insufficient sick leave balance to approve the leave" });
                    }
                    if (leave.leaveType === "casualLeave" && employee.casualLeave <= 0) {
                        return res.status(400).json({ message: "Insufficient casual leave balance to approve the leave" });
                    }

                    if (leave.leaveType === "sickLeave") {
                        employee.sickLeave -= 1;
                    } else if (leave.leaveType === "casualLeave") {
                        employee.casualLeave -= 1;
                    }

                    employee.totalLeaveTaken += 1;
                    await employee.save();

                    leave.status = "approved";
                } else {
                    leave.status = "pending";
                }
            }
        } else if (approverId === String(employee.level2ReportingManager)) {
            if (leave.level1Approval !== "approved") {
                return res.status(400).json({ message: "Leave must be approved by Level 1 manager first" });
            }

            if (leave.level2Approval !== "pending") {
                return res.status(400).json({ message: "Level 2 manager has already reviewed this leave request" });
            }

            if (status === "rejected" && !rejectionReason) {
                return res.status(400).json({ message: "Rejection reason is required" });
            }

            if (status === "approved") {
                if (leave.leaveType === "sickLeave" && employee.sickLeave <= 0) {
                    return res.status(400).json({ message: "Insufficient sick leave balance to approve the leave" });
                }
                if (leave.leaveType === "casualLeave" && employee.casualLeave <= 0) {
                    return res.status(400).json({ message: "Insufficient casual leave balance to approve the leave" });
                }

                if (leave.leaveType === "sickLeave") {
                    employee.sickLeave -= 1;
                } else if (leave.leaveType === "casualLeave") {
                    employee.casualLeave -= 1;
                }

                employee.totalLeaveTaken += 1;
                await employee.save();

                leave.status = "approved";
            } else if (status === "rejected") {
                leave.status = "rejected";
                leave.rejectionReason = rejectionReason;
            }

            leave.level2Approval = status;
        } else {
            return res.status(403).json({ message: "You are not authorized to approve/reject this leave request" });
        }

        await leave.save();

        res.status(200).json({
            message: `Leave ${status} successfully by approver`,
            leave,
        });
    } catch (error) {
        console.error(error.message); // Log the error for debugging
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// ||==================
// ====================================================
// const updateLeaveStatus = async (req, res) => {
//     try {
//         const { status, role, rejectionReason } = req.body; // Expecting rejectionReason if status is 'rejected'
//         const leave = await Leave.findById(req.params.id).populate(
//             'employeeId',
//             'employeeId firstName lastName sickLeave casualLeave totalLeaveTaken role'
//         );

//         if (!leave) {
//             return res.status(404).json({ message: "Leave request not found" });
//         }

//         const employee = leave.employeeId;

//         // Role-based approval/rejection
//         if (role === 'manager') {
//             if (leave.managerApproval !== 'pending') {
//                 return res.status(400).json({ message: "Manager has already reviewed this leave request" });
//             }

//             if (status === 'rejected' && !rejectionReason) {
//                 return res.status(400).json({ message: "Rejection reason is required" });
//             }

//             leave.managerApproval = status;

//             if (status === 'rejected') {
//                 leave.status = 'rejected';
//                 leave.rejectionReason = rejectionReason; // Save rejection reason
//             }

//         } else if (role === 'hr') {
//             if (leave.managerApproval !== 'approved') {
//                 return res.status(400).json({ message: "Leave must be approved by the manager first" });
//             }

//             if (leave.hrApproval !== 'pending') {
//                 return res.status(400).json({ message: "HR has already reviewed this leave request" });
//             }

//             if (status === 'rejected' && !rejectionReason) {
//                 return res.status(400).json({ message: "Rejection reason is required" });
//             }

//             if (status === 'approved') {
//                 if (leave.leaveType === 'sickLeave' && employee.sickLeave <= 0) {
//                     return res.status(400).json({ message: "Insufficient sick leave balance to approve the leave" });
//                 }
//                 if (leave.leaveType === 'casualLeave' && employee.casualLeave <= 0) {
//                     return res.status(400).json({ message: "Insufficient casual leave balance to approve the leave" });
//                 }

//                 const currentYear = leave.startDate.getFullYear();
//                 const currentMonth = leave.startDate.getMonth();
//                 const startOfMonth = new Date(currentYear, currentMonth, 1);
//                 const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

//                 const monthLeaves = await Leave.countDocuments({
//                     employeeId: employee._id,
//                     status: 'approved',
//                     startDate: { $gte: startOfMonth, $lt: startOfNextMonth }
//                 });

//                 if (monthLeaves >= 4) {
//                     return res.status(400).json({ message: "Maximum leave limit for this month exceeded (4 leaves)" });
//                 }

//                 if (leave.leaveType === 'sickLeave') {
//                     employee.sickLeave -= 1;
//                 } else if (leave.leaveType === 'casualLeave') {
//                     employee.casualLeave -= 1;
//                 }

//                 employee.totalLeaveTaken += 1;
//                 await employee.save();

//                 leave.status = 'approved';
//             } else if (status === 'rejected') {
//                 leave.status = 'rejected';
//                 leave.rejectionReason = rejectionReason; // Save rejection reason
//             }

//             leave.hrApproval = status;
//         } else {
//             return res.status(400).json({ message: "Invalid role" });
//         }

//         await leave.save();

//         res.status(200).json({
//             message: `Leave ${status} successfully by ${role}`,
//             leave
//         });

//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };



const deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        if (!leave) return res.status(404).json({ message: "Leave not found" });
        res.status(200).json({ message: "Leave deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getLeaveStatusById = async (req, res) => {
    try {
        // Fetch leave by ID
        const leave = await Leave.findById(req.params.id)
            .populate('employeeId', 'firstName lastName department')
            .populate('approvedBy', 'firstName lastName');

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        // Structure the response
        const response = {
            leaveType: leave.leaveType,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status,
            employee: {
                firstName: leave.employeeId.firstName,
                lastName: leave.employeeId.lastName,
                department: leave.employeeId.department,
            },
            approvedBy: leave.approvedBy ? {
                firstName: leave.approvedBy.firstName,
                lastName: leave.approvedBy.lastName,
            } : null,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt,
        };

        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getLeavesByManager = async (req, res) => {
    try {
        const managerId = req.user.id; // Assuming authenticated user ID
        const { employeeId } = req.params; // Get employeeId from route params

        // 🔹 Validate and Convert to ObjectId
        if (!mongoose.Types.ObjectId.isValid(managerId) || !mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ error: "Invalid manager or employee ID" });
        }

        // 🔹 Find the employee and check if they belong to the reporting manager's team
        const leaveRequests = await Leave.find({
            $or: [
                { "level1ReportingManager.employeeId": employeeId },
                { "level2ReportingManager.employeeId": employeeId }
            ]
        })
        .populate("employeeId", "firstName lastName employeeId")
        .populate("level1ReportingManager", "firstName lastName employeeId")
        .populate("level2ReportingManager", "firstName lastName employeeId")
        .sort({ startDate: -1 });

        if (!leaveRequests.length) {
            return res.status(404).json({ message: "No leave requests found for this employee under your reporting." });
        }

        res.status(200).json({ leaveRequests });

    } catch (error) {
        console.error("Error fetching leaves by manager:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAllLeavesWithFilters = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Validate employee ID
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ error: "Invalid employee ID" });
        }

        // Filter leaves where the provided employeeId is a reporting manager (level1 or level2)
        const filter = {
            $or: [
                { level1ReportingManager: employeeId },
                { level2ReportingManager: employeeId }
            ]
        };

        // Fetch leave data
        const leaves = await Leave.find(filter)
            .populate('employeeId', 'employeeId firstName lastName department')
            .populate('level1ReportingManager', 'employeeId firstName lastName department')
            .populate('level2ReportingManager', 'employeeId firstName lastName department')
            .sort({ createdAt: -1 });

        if (!leaves.length) {
            return res.status(404).json({ message: "No leaves found for the given reporting manager." });
        }

        res.status(200).json(leaves);
    } catch (err) {
        console.error("Error fetching leave data:", err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = {getAllLeavesWithFilters, getAllLeaves, getLeaveById, getMyLeaves, requestLeave, updateLeaveStatus, deleteLeave, getLeaveStatusById, getLeavesByManager };
