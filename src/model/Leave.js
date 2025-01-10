const mongoose = require("mongoose");

// const leaveSchema = new mongoose.Schema({
//     employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
//     leaveType: { type: String, enum: ['sickLeave', 'casualLeave', 'LWP'], required: true, default:'LWP'},
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     reason: { type: String },
//     status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'Pending' },
//     approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
// }, { timestamps: false });




const leaveSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, enum: ['sickLeave', 'casualLeave', 'LWP'], required: true, default: 'LWP' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    managerApproval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    hrApproval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    rejectionReason: { type: String }, // Field for rejection reason
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('Leave', leaveSchema);