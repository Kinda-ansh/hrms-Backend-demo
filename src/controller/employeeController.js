const Employee = require("../model/Employee");
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require("../utils/jwt");
const { sendEmail } = require("../services/nodemailerService");


// Helper function to generate employeeId
const generateEmployeeId = () => {
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetters = Array.from({ length: 2 }, () =>
        alphabets.charAt(Math.floor(Math.random() * alphabets.length))
    ).join("");
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `${randomLetters}${randomNumbers}`;
};



// Get All Employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate('department', 'name');
        if(!employees){
            res.status(400).json({message: "No data fount" });
        }
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Employee By ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('department', 'name');
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json(employee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add New Employee
// const createEmployee = async (req, res) => {
//     try {
//         const newEmployee = new Employee(req.body);
//         await newEmployee.save();
//         res.status(201).json(newEmployee);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };
const createEmployee = async (req, res) => {
    try {
        const { firstName, email, password } = req.body;

        // Create a new employee
        const newEmployee = new Employee(req.body);
        await newEmployee.save();

        // Prepare email data
        const emailData = {
            firstName,
            email,
            password,
            loginUrl: "https://kinda-hrms-testing.netlify.app/login" // Default login URL
        };

        // Send welcome email
        await sendEmail(email, 'Welcome to Kinda HRMS', 'hrmsLogin', emailData);

        res.status(201).json({ message: 'Employee created and email sent successfully.', employee: newEmployee });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};



// Update Employee
const updateEmployee = async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEmployee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json(updatedEmployee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// Employee Registration
// const registerEmployee = async (req, res) => {
//     const { firstName, lastName, email, password, role } = req.body;

//     try {
//         // Check if the email already exists
//         const existingEmployee = await Employee.findOne({ email });
//         if (existingEmployee) {
//             return res.status(400).json({ message: "Email already registered" });
//         }

//         // Generate a unique employeeId
//         let employeeId;
//         do {
//             employeeId = generateEmployeeId();
//         } while (await Employee.findOne({ employeeId })); // Ensure uniqueness

//         // Create a new employee
//         const newEmployee = new Employee({
//             employeeId,
//             firstName,
//             lastName,
//             email,
//             password,
//             role,
//         });

//         // Save the employee to the database
//         await newEmployee.save();

//         // Generate a JWT token for immediate login
//         const token = jwt.sign({ id: newEmployee._id, role: newEmployee.role }, SECRET_KEY, { expiresIn: '1h' });

//         res.status(201).json({
//             message: "Registration successful",
//             employee: {
//                 id: newEmployee._id,
//                 employeeId: newEmployee.employeeId,
//                 firstName: newEmployee.firstName,
//                 lastName: newEmployee.lastName,
//                 email: newEmployee.email,
//                 role: newEmployee.role,
//             },
//             token: token
//         });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

const registerEmployee = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    try {
        // Check if the email already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Generate a unique employeeId
        let employeeId;
        do {
            employeeId = generateEmployeeId();
        } while (await Employee.findOne({ employeeId })); // Ensure uniqueness

        // Create a new employee
        const newEmployee = new Employee({
            employeeId,
            firstName,
            lastName,
            email,
            password, // Store password as plain text
            role,
        });

        // Save the employee to the database
        await newEmployee.save();

        // Generate a JWT token for immediate login
        const token = jwt.sign({ id: newEmployee._id, role: newEmployee.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({
            message: "Registration successful",
            employee: {
                id: newEmployee._id,
                employeeId: newEmployee.employeeId,
                firstName: newEmployee.firstName,
                lastName: newEmployee.lastName,
                email: newEmployee.email,
                role: newEmployee.role,
            },
            token: token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// Employee Login
// const loginEmployee = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Check if the employee exists
//         const employee = await Employee.findOne({ email });

//         if (!employee) return res.status(404).json({ message: "Employee not found" });

//         // Compare the provided password with the hashed password in the database
//         const isMatch = await employee.comparePassword(password);
//         if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//         // Generate JWT token
//         const token = jwt.sign({ id: employee._id, role: employee.role }, SECRET_KEY, { expiresIn: '10d' });

//         // Send the token in the response
//         res.status(200).json({
//             message: "Login successful",
//             data : employee,
//             token: token
//         });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
const loginEmployee = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the employee exists
        const employee = await Employee.findOne({ email });

        if (!employee) return res.status(404).json({ message: "Employee not found" });

        // Compare the provided password with the one in the database
        if (employee.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: employee._id, role: employee.role }, SECRET_KEY, { expiresIn: '10d' });

        // Send the token in the response
        res.status(200).json({
            message: "Login successful",
            data: employee,
            token: token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



const getMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findOne({_id : req.user.id}).populate('department', 'name');
        if (!employee) return res.status(404).json({ message: "profile not found" });
        res.status(200).json({data : employee, message: "profile fetch successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = {getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, loginEmployee, registerEmployee, getMyProfile}

