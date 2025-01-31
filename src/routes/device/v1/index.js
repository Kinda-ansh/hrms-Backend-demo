/**
 * index.js
 * @description :: index route file of admin platform.
 */

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    data: "Server is running",
  });
});

router.use(require("./CommonRoutes"));
router.use(require("./ContactRoutes"));
router.use(require("./adminRoutes"));
router.use(require("./employeeRoutes"));
router.use(require("./attendanceRoutes"));
router.use(require("./departmentRoutes"));
router.use(require("./leaveRoutes"));
router.use(require("./payrollRoutes"));
router.use(require("./performanceRoutes"));
router.use(require("./settingsRoutes"));
router.use(require("./ticketRoutes"));
router.use(require("./dashboardRoutes"));
router.use(require("./holyDayRoutes"));
router.use(require("./feedbackRoutes"));


module.exports = router;