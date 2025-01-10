const Ticket = require('../model/Tickets');
const Employee = require('../model/Employee');
const moment = require('moment');

const raiseTicket = async (req, res) => {
  try {
    const { subject, message, to, cc, priority, status } = req.body;
    const employeeId = req.user.id; // Getting employeeId from the JWT middleware

    // Validate input fields
    if (!subject || !message || !to || !priority) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate priority
    const validPriorities = ["High", "Moderate", "Low"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority type" });
    }

    // Fetch employee data (the one raising the ticket)
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Optionally, fetch the "To" and "CC" employees to validate them (if required)
    const toEmployee = await Employee.findById(to);
    const ccEmployees = await Employee.find({ '_id': { $in: cc } });

    if (!toEmployee) {
      return res.status(404).json({ message: "Recipient employee not found" });
    }

    // Create the ticket
    const newTicket = new Ticket({
      subject,
      message,
      to,
      cc,
      priority,
      status,
      createdBy: employeeId, // Store the employee who raised the ticket
    });

    await newTicket.save();

    res.status(201).json({
      message: "Ticket raised successfully",
      ticket: newTicket,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while processing the ticket" });
  }
};


// ===========================
// GetAllTickets Controller (GET)
const getAllTickets = async (req, res) => {
    try {
      const tickets = await Ticket.find()
       
  
      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ message: 'No tickets found' });
      }
  
      res.status(200).json({ tickets });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  module.exports = {
    raiseTicket,
    getAllTickets,
  };
