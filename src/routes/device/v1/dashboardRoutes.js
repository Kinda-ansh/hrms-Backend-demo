const express = require("express");

const { getDashboardAnalytics } = require("../../../controller/dashboardController");

const router = express.Router();

// Week Off Routes
router.get("/dashboard/analytics", getDashboardAnalytics); 


module.exports = router;
