const express = require("express");
const {
  updateWeekOffs,
  addAnnouncement,
  removeAnnouncement,
  updateCasualOffs,
  addCompanyHoliday,
  removeCompanyHoliday,
  updateWorkHours,
  updateLeavePolicy,
  getAllSettings,
  setLocation,
  getLocation,
  deleteLocation,
  updateLocationRange,
  getLocationRangeAndStatus,
  getAttendanceSettings,
} = require("../../../controller/settingsController");
const { authMiddleware, roleMiddleware } = require("../../../middleware/auth");

const router = express.Router();

// Week Off Routes
router.get("/settings/all", getAllSettings); 
router.put("/settings/week-offs", authMiddleware, roleMiddleware(["admin", "hr"]), updateWeekOffs); // Update week-off days

// Announcement Routes
router.post("/announcements", addAnnouncement); // Add a new announcement
router.delete("/announcements", removeAnnouncement); // Remove an announcement

// Casual Off Routes
router.put("/casual-offs", updateCasualOffs); // Update casual off settings

// Company Holiday Routes
router.post("/company-holidays", addCompanyHoliday); // Add a new company holiday
router.delete("/company-holidays", removeCompanyHoliday); // Remove a company holiday

// Work Hours Routes
router.put("/work-hours", updateWorkHours); // Update work hours

// Leave Policy Routes
router.put("/leave-policy", updateLeavePolicy); // Update leave policy settings

router.put("/update-location-range", updateLocationRange); // Update leave policy settings
router.get("/get-location-range", getLocationRangeAndStatus); // Update leave policy settings

// Route to set or update location
router.post("/set-location", setLocation);

// Route to get latitude and longitude
router.get("/get-location", getLocation);
router.get("/get-attendance-settings", getAttendanceSettings);

// Route to delete latitude and longitude
router.delete("/delete-location", deleteLocation);

module.exports = router;
