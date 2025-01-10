const mongoose = require('mongoose');

// Enum for ticket priority
const priorityEnum = ['High', 'Moderate', 'Low'];

// Ticket Schema
const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Reference to Employee schema (for the recipient)
      required: true,
    },
    cc: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', // Reference to Employee schema (for CCed employees)
      },
    ],
    priority: {
      type: String,
      enum: priorityEnum,
      default: 'Moderate', // Default value if not provided
    },
    status: { type: String, enum: ['pending', 'resolved', 'cantResolve', 'closed'], default: 'pending' },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Create a Ticket model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
