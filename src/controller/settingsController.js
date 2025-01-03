const Settings = require("../model/settings");

/**
 * Controller for Week Offs
 */
// const updateWeekOffDays = async (req, res) => {
//   try {
//     const { weekOffDays } = req.body;

//     if (!Array.isArray(weekOffDays)) {
//       return res.status(400).json({ message: "Invalid week-off days format." });
//     }

//     const updatedSettings = await Settings.findOneAndUpdate(
//       {},
//       { weekOffDays },
//       { new: true, upsert: true }
//     );

//     res.status(200).json({ message: "Week-off days updated successfully.", data: updatedSettings });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating week-off days.", error: error.message });
//   }
// };
const updateWeekOffs = async (req, res) => {
    try {
      const { weekOffDays, customWeekOffs } = req.body;
  
      // Validate `weekOffDays`
      if (weekOffDays && !Array.isArray(weekOffDays)) {
        return res.status(400).json({ message: "Invalid week-off days format." });
      }
  
      // Validate `customWeekOffs`
      if (customWeekOffs && !Array.isArray(customWeekOffs)) {
        return res.status(400).json({ message: "Invalid custom week-offs format." });
      }
  
      // Update the settings
      const updatedSettings = await Settings.findOneAndUpdate(
        {},
        { weekOffDays, customWeekOffs },
        { new: true, upsert: true }
      );
  
      res.status(200).json({
        message: "Week-off settings updated successfully.",
        data: updatedSettings,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating week-off settings.", error: error.message });
    }
  };
  
/**
 * Controller for Announcements
 */
const addAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $push: { announcements: { title, message } } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Announcement added successfully.", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error adding announcement.", error: error.message });
  }
};

const removeAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $pull: { announcements: { _id: announcementId } } },
      { new: true }
    );

    res.status(200).json({ message: "Announcement removed successfully.", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error removing announcement.", error: error.message });
  }
};

/**
 * Controller for Casual Offs
 */
const updateCasualOffs = async (req, res) => {
  try {
    const { yearlyLimit, carryForward } = req.body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { casualOffs: { yearlyLimit, carryForward } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Casual offs updated successfully.", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error updating casual offs.", error: error.message });
  }
};

/**
 * Controller for Company Holidays
 */
const addCompanyHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;

    if (!date || !name) {
      return res.status(400).json({ message: "Date and name are required." });
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $push: { companyHolidays: { date, name } } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Company holiday added successfully.", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error adding company holiday.", error: error.message });
  }
};

const removeCompanyHoliday = async (req, res) => {
  try {
    const { holidayId } = req.body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $pull: { companyHolidays: { _id: holidayId } } },
      { new: true }
    );

    res.status(200).json({ message: "Company holiday removed successfully.", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error removing company holiday.", error: error.message });
  }
};

/**
 * Controller for Work Hours
 */
const updateWorkHours = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { workHours: { startTime, endTime } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Work hours updated successfully.", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error updating work hours.", error: error.message });
  }
};

/**
 * Controller for Leave Policy
 */
const updateLeavePolicy = async (req, res) => {
  try {
    const { maxConsecutiveLeaveDays, approvalRequired } = req.body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { leavePolicy: { maxConsecutiveLeaveDays, approvalRequired } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Leave policy updated successfully.", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave policy.", error: error.message });
  }
};



const getAllSettings = async (req, res) => {
    try {
      // Retrieve the latest settings document
      const settings = await Settings.findOne().sort({ createdAt: -1 });
  
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
  
      res.status(200).json({
        success: true,
        settings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve settings",
        error: error.message,
      });
    }
  };

module.exports={
    updateWeekOffs,
    addAnnouncement,
    removeAnnouncement,
    updateCasualOffs,
    updateLeavePolicy,
    updateWorkHours,
    removeCompanyHoliday,
    addCompanyHoliday,
    getAllSettings
}