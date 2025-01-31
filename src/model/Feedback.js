const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    name: { type: String, },
    email: { type: String, required: true },
    description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
