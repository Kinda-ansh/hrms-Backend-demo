// const mongoose = require("mongoose");

// const attendanceSchema = new mongoose.Schema({
//     employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
//     date: { type: Date, required: true },
//     checkInTime: { type: Date },
//     checkOutTime: { type: Date },
//     totalWorkingHour: { type: String }, // Stored as a string (e.g., "8h 30m")
//     lateTime: { type: String }, // Stored as a string (e.g., "30m")
//     status: { type: String, enum: ['present', 'absent', 'late'], required: true },
//     createdAt: 'createdAt',
//     updatedAt: 'updatedAt',
// }, { timestamps: true });

// module.exports = mongoose.model('Attendance', attendanceSchema);


const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    totalWorkingHour: { type: String }, // Stored as a string (e.g., "8h 30m")
    lateTime: { type: String }, // Stored as a string (e.g., "30m")
    status: { type: String, enum: ['present', 'absent', 'late', 'weekly-off', 'on-leave', 'pending'], required: true },
    createdAt: { type: Date, default: Date.now }, 
    updatedAt: { type: Date, default: Date.now }, 
}, { timestamps: false }); 

module.exports = mongoose.model('Attendance', attendanceSchema);
