const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const { deleteFeedback, createFeedback, getAllFeedbacks, getFeedbackById, updateFeedback } = require("../../../controller/feedbackController");
const router = express.Router();

// Leave Routes
router.post("/create-feedback", createFeedback); // Get all leaves
router.get("/get-feedback", getAllFeedbacks); 
router.delete("/delete-feedback/:id", deleteFeedback); 
router.get("/get-feedback/:id", getFeedbackById); 
router.put("/update-feedback/:id", updateFeedback); 
module.exports = router;


