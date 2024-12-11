const Department = require("../model/Department");

// Get All Departments
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Department By ID
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ message: "Department not found" });
        res.status(200).json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add New Department
const addDepartment = async (req, res) => {
    try {
        const newDepartment = new Department(req.body);
        await newDepartment.save();
        res.status(201).json(newDepartment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update Department
const updateDepartment = async (req, res) => {
    try {
        const updatedDepartment = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDepartment) return res.status(404).json({ message: "Department not found" });
        res.status(200).json(updatedDepartment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Department
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ message: "Department not found" });
        res.status(200).json({ message: "Department deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllDepartments, getDepartmentById, addDepartment, updateDepartment, deleteDepartment };
