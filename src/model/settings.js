const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
   
    announcements: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    casualOffs: {
      yearlyLimit: { type: Number, required: true, default: 12 },
      carryForward: { type: Boolean, required: true, default: false },
    },
    companyHolidays: [
      {
        date: { type: Date, required: true },
        name: { type: String, required: true },
      },
    ],
    workHours: {
      startTime: { type: String, required: true, default: "09:00" },
      endTime: { type: String, required: true, default: "18:00" },
    },
    leavePolicy: {
      maxConsecutiveLeaveDays: { type: Number, required: true, default: 5 },
      approvalRequired: { type: Boolean, required: true, default: true },
    },
    locationRange: {
      type: Number, // Numeric value representing the range in meters
      required: true,
      default: 1000, // Default range set to 1000 meters
      min: 1, // Minimum value validation
    },
    latitude: {
      type: Number, // Latitude for geographical location
      required: true,
    },
    longitude: {
      type: Number, // Longitude for geographical location
      required: true,
    },
    
    locationBasedAttendance: {
      type: Boolean, // Status for enabling/disabling location-based attendance
      required: true,
      default: false, // Default is disabled
    },
   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
