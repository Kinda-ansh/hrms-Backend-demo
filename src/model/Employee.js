// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // To hash passwords

// const employeeSchema = new mongoose.Schema({
//     employeeId: { type: String, unique: true, required: true },
//     firstName: { type: String, required: true },
//     lastName: { type: String,  },
//     email: { type: String, unique: true, required: true },
//     phone: { type: String },
//     address: { type: String },
//     department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
//     designation: { type: String },
//     dateOfJoining: { type: Date },  
//     salary: { type: Number },
//     sickLeave: { type: Number, default: 4 },  // Sick leave
//     casualLeave: { type: Number, default: 8 }, // Casual leave
//     totalLeaveTaken: { type: Number, default: 0 }, 
//     managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
//     status: { type: String, enum: ['active', 'inactive', 'on-Leave', 'weekly-off',], default: 'active' },
//     role: { type: String, enum: ['admin', 'hr', 'employee'], default:'employee' },
//     profilePicture: { type: String },
//     password: { type: String, required: true },
//     // createdAt: { type: Date, default: Date.now },
//     // updatedAt: { type: Date, default: Date.now },
// }, { timestamps: true, toJSON: { virtuals: true }, });

// employeeSchema.virtual('leaveBalance').get(function() {
//     return this.sickLeave + this.casualLeave; // Return the sum of sickLeave and casualLeave
// });

// // Hash password before saving
// employeeSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10); // Hash the password with 10 rounds of salting
//     next();
// });

// // Method to compare passwords
// employeeSchema.methods.comparePassword = function(password) {
//     return bcrypt.compare(password, this.password); // Compare hashed passwords
// };

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

module.exports = mongoose.model('Employee', employeeSchema);
