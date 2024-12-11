const Performance = require("../model/Performance");

// Get All Performance Reviews
const getAllPerformanceReviews = async (req, res) => {
    try {
        const reviews = await Performance.find().populate('employeeId', 'firstName lastName');
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get My Performance Reviews (for employees)
const getMyPerformanceReviews = async (req, res) => {
    try {
        const reviews = await Performance.find({ employeeId: req.user.id }).populate('employeeId', 'firstName lastName');
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Performance Review by ID
const getPerformanceReviewById = async (req, res) => {
    try {
        const review = await Performance.findById(req.params.id).populate('employeeId', 'firstName lastName');
        if (!review) return res.status(404).json({ message: "Performance Review not found" });
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add Performance Review
const addPerformanceReview = async (req, res) => {
    try {
        const newReview = new Performance(req.body);
        await newReview.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update Performance Review
const updatePerformanceReview = async (req, res) => {
    try {
        const updatedReview = await Performance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedReview) return res.status(404).json({ message: "Performance Review not found" });
        res.status(200).json(updatedReview);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Performance Review
const deletePerformanceReview = async (req, res) => {
    try {
        const review = await Performance.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: "Performance Review not found" });
        res.status(200).json({ message: "Performance Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllPerformanceReviews,
    getMyPerformanceReviews,
    getPerformanceReviewById,
    addPerformanceReview,
    updatePerformanceReview,
    deletePerformanceReview
};
