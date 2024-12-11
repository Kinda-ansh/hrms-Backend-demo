const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    salaryMonth: { type: String, required: true },
    baseSalary: { type: Number, required: true },
    deductions: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    totalSalary: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
