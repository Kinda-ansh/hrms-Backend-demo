const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    description: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
