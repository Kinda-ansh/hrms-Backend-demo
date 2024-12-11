const express = require("express");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");
const performanceController = require("../../../controller/performanceController");
const router = express.Router();

// Performance Routes
router.get("/performance", authMiddleware, roleMiddleware(["admin", "hr"]), performanceController.getAllPerformanceReviews);
router.get("/performance/mine", authMiddleware, roleMiddleware(["employee"]), performanceController.getMyPerformanceReviews);
router.get("/performance/:id", authMiddleware, roleMiddleware(["admin", "hr", "employee"]), performanceController.getPerformanceReviewById);
router.post("/performance", authMiddleware, roleMiddleware(["admin", "hr"]), performanceController.addPerformanceReview);
router.put("/performance/:id", authMiddleware, roleMiddleware(["admin", "hr"]), performanceController.updatePerformanceReview);
router.delete("/performance/:id", authMiddleware, roleMiddleware(["admin"]), performanceController.deletePerformanceReview);

module.exports = router;
