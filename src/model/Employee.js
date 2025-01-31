



// const mongoose = require('mongoose');

// const employeeSchema = new mongoose.Schema({
//     employeeId: { type: String, unique: true, required: true },
//     firstName: { type: String, required: true },
//     lastName: { type: String },
//     email: { type: String, unique: true, required: true },
//     phone: { type: String },
//     address: { type: String },
//     department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
//     designation: { type: String },
//     dateOfJoining: { type: Date },
//     salary: { type: Number },
//     sickLeave: { type: Number, default: 4 },
//     casualLeave: { type: Number, default: 8 },
//     totalLeaveTaken: { type: Number, default: 0 },
//     status: { type: String, enum: ['active', 'inactive', 'on-Leave', 'weekly-off'], default: 'active' },
//     role: { type: String, enum: ['admin', 'hr', 'employee', 'manager'], default: 'employee' },
//     profilePicture: { type: String },
//     password: { type: String, required: true },
//     level1ReportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, 
//     level2ReportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, 
// }, { timestamps: true, toJSON: { virtuals: true } });

// // Virtual field to calculate leave balance
// employeeSchema.virtual('leaveBalance').get(function () {
//     return this.sickLeave + this.casualLeave; 
// });


// module.exports = mongoose.model('Employee', employeeSchema);




const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeId: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    address: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: String },
    dateOfJoining: { type: Date },
    salary: { type: Number },
    sickLeave: { type: Number, default: 4 },
    casualLeave: { type: Number, default: 8 },
    totalLeaveTaken: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'on-Leave', 'weekly-off'], default: 'active' },
    role: { type: String, enum: ['admin', 'hr', 'employee', 'manager'], default: 'employee' },
    profilePicture: { type: String },
    password: { type: String, required: true },
    level1ReportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, 
    level2ReportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true, toJSON: { virtuals: true } });

// Virtual field to calculate leave balance
employeeSchema.virtual('leaveBalance').get(function () {
    return this.sickLeave + this.casualLeave; 
});

// Virtual field to get employees managed by the current employee as Level 1 manager
employeeSchema.virtual('youAreLevel1ReportingManagerOf', {
    ref: 'Employee', // Reference to Employee model
    localField: '_id', // Local field (_id of the current employee)
    foreignField: 'level1ReportingManager', // Foreign field (level1ReportingManager of other employees)
    justOne: false, // Return all employees managed by this manager
    select: 'firstName lastName employeeId', // Select fields to return for managed employees
});

// Virtual field to get employees managed by the current employee as Level 2 manager
employeeSchema.virtual('youAreLevel2ReportingManagerOf', {
    ref: 'Employee',
    localField: '_id',
    foreignField: 'level2ReportingManager',
    justOne: false,
    select: 'firstName lastName employeeId',
});

module.exports = mongoose.model('Employee', employeeSchema);
