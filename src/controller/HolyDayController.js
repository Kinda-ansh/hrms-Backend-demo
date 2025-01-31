const Holiday = require("../model/HolyDay");

// Create and save holidays
const createHoliday = async (req, res) => {
  try {
    const { date, type, title } = req.body;
    
    // Set default colors based on type
    const backgroundColor = type === "week-off" ? "#9e9e9e" : "#ffffff";
    const borderColor = "transparent";
    const textColor = "white";

    const holiday = new Holiday({ date, type, title, backgroundColor, borderColor, textColor });
    await holiday.save();

    res.status(201).json({ message: "Holiday added successfully", holiday });
  } catch (error) {
    res.status(500).json({ message: "Error adding holiday", error: error.message });
  }
};

// Get all holidays
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Error fetching holidays", error: error.message });
  }
};

// Delete a holiday
const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    await Holiday.findByIdAndDelete(id);
    res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting holiday", error: error.message });
  }
};


module.exports = {createHoliday, getHolidays, deleteHoliday}