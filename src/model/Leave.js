// const mongoose = require("mongoose");

// const leaveSchema = new mongoose.Schema({
//     employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
//     leaveType: { type: String, enum: ['sickLeave', 'casualLeave', 'LWP'], required: true, default: 'LWP' },
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     reason: { type: String },
//     status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
//     level1Approval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
//     level2Approval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
//     rejectionReason: { type: String },
// }, { timestamps: true });

// module.exports = mongoose.model('Leave', leaveSchema);




const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, enum: ['sickLeave', 'casualLeave', 'LWP'], required: true, default: 'LWP' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    level1Approval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    level2Approval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },

    // 🔹 New Fields for Reporting Managers
    level1ReportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    level2ReportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
