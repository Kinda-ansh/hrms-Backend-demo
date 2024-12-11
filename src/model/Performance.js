const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewPeriod: { type: String, required: true },
    goalsAchieved: { type: String },
    strengths: { type: String },
    weaknesses: { type: String },
    feedback: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);
