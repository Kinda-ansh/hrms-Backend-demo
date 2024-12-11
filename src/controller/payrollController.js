const Payroll = require("../model/Payroll");

// Generate Payroll
const generatePayroll = async (req, res) => {
    try {
        const payroll = new Payroll(req.body);
        await payroll.save();
        res.status(201).json(payroll);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get All Payroll Records
const getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find().populate('employeeId', 'firstName lastName');
        res.status(200).json(payrolls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Payroll by ID
const getPayrollById = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate('employeeId', 'firstName lastName');
        if (!payroll) return res.status(404).json({ message: "Payroll not found" });
        res.status(200).json(payroll);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get My Payroll
const getMyPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.find({ employeeId: req.user.id });
        res.status(200).json(payrolls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Payroll Status
const updatePayrollStatus = async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!payroll) return res.status(404).json({ message: "Payroll not found" });
        res.status(200).json(payroll);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Payroll
const deletePayroll = async (req, res) => {
    try {
        // Find and delete the payroll record by its ID
        const payroll = await Payroll.findByIdAndDelete(req.params.id);
        
        // If no payroll record was found
        if (!payroll) {
            return res.status(404).json({ message: "Payroll not found" });
        }

        // Successfully deleted the payroll record
        res.status(200).json({ message: "Payroll deleted successfully" });
    } catch (err) {
        // Handle errors (e.g., invalid ID format)
        res.status(500).json({ error: err.message });
    }
};


module.exports = { generatePayroll, getAllPayrolls, getPayrollById, getMyPayroll, updatePayrollStatus, deletePayroll };
