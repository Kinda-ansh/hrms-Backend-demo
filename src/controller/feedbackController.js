const Feedback = require("../model/Feedback");

// ✅ 1. Create Feedback
const createFeedback = async (req, res) => {
    try {
        const { name, email, description } = req.body;

        if (!name || !email || !description) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const feedback = new Feedback({ name, email, description });
        await feedback.save();

        res.status(201).json({ message: "Feedback submitted successfully!", feedback });

    } catch (error) {
        console.error("Error creating feedback:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ 2. Get All Feedbacks
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.status(200).json({ feedbacks });

    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ 3. Get Single Feedback by ID
const getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        res.status(200).json({ feedback });

    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ 4. Update Feedback
const updateFeedback = async (req, res) => {
    try {
        const { name, email, description } = req.body;

        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { name, email, description },
            { new: true, runValidators: true }
        );

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        res.status(200).json({ message: "Feedback updated successfully!", feedback });

    } catch (error) {
        console.error("Error updating feedback:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ 5. Delete Feedback
const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found." });
        }

        res.status(200).json({ message: "Feedback deleted successfully!" });

    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createFeedback, getAllFeedbacks, getFeedbackById, updateFeedback, deleteFeedback };
