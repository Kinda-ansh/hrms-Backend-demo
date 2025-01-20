const moment = require('moment');
const Leave = require('../model/Leave')
const Employee = require('../model/Employee');

// Get All Leaves
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('employeeId', 'employeeId firstName lastName department')
            .populate('approvedBy', 'employeeId firstName lastName department role')
            .sort({ createdAt: -1 });
        
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Leave By ID
const getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('employeeId', 'employeeId firstName lastName department');
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

        // Fetch employee data
        const employee = await Employee.findById(employeeId);
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
            status: { $ne: "rejected" }, // Only consider non-rejected leaves
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

        // Create a leave request
        const leaveRequest = new Leave({
            employeeId,
            leaveType,
            startDate,
            endDate,
            reason,
            status: "pending",
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


// const updateLeaveStatus = async (req, res) => {
//     try {
//         const { status } = req.body; // Expecting status ('approved' or 'rejected')
//         const leave = await Leave.findById(req.params.id).populate(
//             'employeeId',
//             'employeeId firstName lastName sickLeave casualLeave totalLeaveTaken'
//         ); // Populate employee details to access leaveBalance

//         if (!leave) {
//             return res.status(404).json({ message: "Leave request not found" });
//         }

//         const employee = leave.employeeId; // The employee who requested the leave

//         // Only HR/Admin can approve or reject leave
//         if (status === 'approved') {
//             // Check if employee has enough leave balance based on leave type
//             if (leave.leaveType === 'sickLeave' && employee.sickLeave <= 0) {
//                 return res.status(400).json({
//                     message: "Insufficient sick leave balance to approve the leave"
//                 });
//             }
//             if (leave.leaveType === 'casualLeave' && employee.casualLeave <= 0) {
//                 return res.status(400).json({
//                     message: "Insufficient casual leave balance to approve the leave"
//                 });
//             }

//             // Check if the leave request exceeds the monthly leave limit (4 leaves per month)
//             const currentYear = leave.startDate.getFullYear();
//             const currentMonth = leave.startDate.getMonth(); // 0-based month (Jan = 0)

//             const startOfMonth = new Date(currentYear, currentMonth, 1);
//             const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

//             const monthLeaves = await Leave.countDocuments({
//                 employeeId: employee._id,
//                 status: 'approved',
//                 startDate: { $gte: startOfMonth, $lt: startOfNextMonth }
//             });

//             if (monthLeaves >= 4) {
//                 return res.status(400).json({
//                     message: "You have exceeded the maximum leave limit for this month (4 leaves)"
//                 });
//             }

//             // Update employee's leave balance based on leave type
//             if (leave.leaveType === 'sickLeave') {
//                 employee.sickLeave -= 1; // Reduce the sick leave balance by 1
//             } else if (leave.leaveType === 'casualLeave') {
//                 employee.casualLeave -= 1; // Reduce the casual leave balance by 1
//             }

//             // Increase the total leave taken
//             employee.totalLeaveTaken += 1;

//             // Save updated employee record
//             await employee.save();

//             leave.status = 'approved';
//             leave.approvedBy = req.user.id; // HR/Admin who approved the leave

//         } else if (status === 'rejected') {
//             leave.status = 'rejected';
//         } else {
//             return res.status(400).json({ message: "Invalid status" });
//         }

//         // Save the updated leave record
//         await leave.save();

//         res.status(200).json({
//             message: `Leave ${status} successfully`,
//             leave
//         });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

const updateLeaveStatus = async (req, res) => {
    try {
        const { status, role, rejectionReason } = req.body; // Expecting rejectionReason if status is 'rejected'
        const leave = await Leave.findById(req.params.id).populate(
            'employeeId',
            'employeeId firstName lastName sickLeave casualLeave totalLeaveTaken role'
        );

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        const employee = leave.employeeId;

        // Role-based approval/rejection
        if (role === 'manager') {
            if (leave.managerApproval !== 'pending') {
                return res.status(400).json({ message: "Manager has already reviewed this leave request" });
            }

            if (status === 'rejected' && !rejectionReason) {
                return res.status(400).json({ message: "Rejection reason is required" });
            }

            leave.managerApproval = status;

            if (status === 'rejected') {
                leave.status = 'rejected';
                leave.rejectionReason = rejectionReason; // Save rejection reason
            }

        } else if (role === 'hr') {
            if (leave.managerApproval !== 'approved') {
                return res.status(400).json({ message: "Leave must be approved by the manager first" });
            }

            if (leave.hrApproval !== 'pending') {
                return res.status(400).json({ message: "HR has already reviewed this leave request" });
            }

            if (status === 'rejected' && !rejectionReason) {
                return res.status(400).json({ message: "Rejection reason is required" });
            }

            if (status === 'approved') {
                if (leave.leaveType === 'sickLeave' && employee.sickLeave <= 0) {
                    return res.status(400).json({ message: "Insufficient sick leave balance to approve the leave" });
                }
                if (leave.leaveType === 'casualLeave' && employee.casualLeave <= 0) {
                    return res.status(400).json({ message: "Insufficient casual leave balance to approve the leave" });
                }

                const currentYear = leave.startDate.getFullYear();
                const currentMonth = leave.startDate.getMonth();
                const startOfMonth = new Date(currentYear, currentMonth, 1);
                const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

                const monthLeaves = await Leave.countDocuments({
                    employeeId: employee._id,
                    status: 'approved',
                    startDate: { $gte: startOfMonth, $lt: startOfNextMonth }
                });

                if (monthLeaves >= 4) {
                    return res.status(400).json({ message: "Maximum leave limit for this month exceeded (4 leaves)" });
                }

                if (leave.leaveType === 'sickLeave') {
                    employee.sickLeave -= 1;
                } else if (leave.leaveType === 'casualLeave') {
                    employee.casualLeave -= 1;
                }

                employee.totalLeaveTaken += 1;
                await employee.save();

                leave.status = 'approved';
            } else if (status === 'rejected') {
                leave.status = 'rejected';
                leave.rejectionReason = rejectionReason; // Save rejection reason
            }

            leave.hrApproval = status;
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

        await leave.save();

        res.status(200).json({
            message: `Leave ${status} successfully by ${role}`,
            leave
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



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



module.exports = { getAllLeaves, getLeaveById, getMyLeaves, requestLeave, updateLeaveStatus, deleteLeave, getLeaveStatusById,  };
