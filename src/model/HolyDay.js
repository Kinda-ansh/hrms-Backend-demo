const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ["week-off", "custom"] },
  title: { type: String, required: true },
  backgroundColor: { type: String },
  borderColor: { type: String, default: "transparent" },
  textColor: { type: String, default: "white" },
});

// Pre-save hook to set default background color
holidaySchema.pre("save", function (next) {
  if (!this.backgroundColor) {
    this.backgroundColor = this.type === "week-off" ? "#9e9e9e" : "#ffffff";
  }
  next();
});

module.exports = mongoose.model("Holiday", holidaySchema);
