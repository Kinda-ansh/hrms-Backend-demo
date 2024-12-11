const mongoose = require("mongoose");

const recruitmentSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String },
    requirements: [String],
    salaryRange: { type: String },
    postedDate: { type: Date, default: Date.now },
    applications: [{
        candidateName: String,
        email: String,
        phone: String,
        resumeLink: String,
        status: { type: String, enum: ['Applied', 'Shortlisted', 'Rejected', 'Hired'], default: 'Applied' },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Recruitment', recruitmentSchema);
