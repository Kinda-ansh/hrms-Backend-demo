const Employee = require("../model/Employee");
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require("../utils/jwt");
const { sendEmail } = require("../services/nodemailerService");
const csvParser = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const Department = require('../model/Department')

// ===========|| Bulk Employee creation ||==================


const bulkInsertEmployees = async (req, res) => {
    try {
        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const filePath = path.resolve(req.file.path); // Path to the uploaded file
        const employeesData = [];

        // Check file type and parse accordingly
        if (req.file.mimetype === 'text/csv') {
            // Parse CSV file
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csvParser())
                    .on('data', (row) => employeesData.push(row))
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else if (
            req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            req.file.mimetype === 'application/vnd.ms-excel'
        ) {
            // Parse XLS/XLSX file
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0]; // Assume data is in the first sheet
            const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            employeesData.push(...sheetData);
        } else {
            return res.status(400).json({ error: 'Invalid file format. Upload CSV or XLS/XLSX files only.' });
        }

        // Fetch departments and create a map for department name to ObjectId
        const departments = await Department.find({});
        const departmentMap = {};
        departments.forEach((dep) => {
            departmentMap[dep.name] = dep._id; // Map department name to ObjectId
        });

        // Helper function to validate date
        const isValidDate = (dateString) => {
            const date = new Date(dateString);
            return !isNaN(date);
        };

        // Transform data and handle missing/invalid fields
        const employeesToInsert = employeesData.map((row) => {
            const departmentId = departmentMap[row.department] || null;

            return {
                employeeId: row.employeeId || null, // Allow null if missing
                firstName: row.firstName || 'Unknown', // Default to 'Unknown'
                lastName: row.lastName || '', // Allow empty if missing
                email: row.email || null, // Allow null for email
                phone: row.phone || null, // Allow null for phone
                address: row.address || '', // Allow empty address
                department: departmentId, // Map department name to ObjectId or null
                designation: row.designation || 'Employee', // Default to 'Employee'
                dateOfJoining: isValidDate(row.dateOfJoining)
                    ? new Date(row.dateOfJoining)
                    : new Date(), // Default to today's date if invalid/missing
                salary: parseFloat(row.salary) || 0, // Default salary to 0 if missing/invalid
                sickLeave: parseInt(row.sickLeave || 4, 10), // Default to 4 sick leaves
                casualLeave: parseInt(row.casualLeave || 8, 10), // Default to 8 casual leaves
                status: row.status || 'active', // Default status to 'active'
                role: row.role || 'employee', // Default role to 'employee'
                password: row.password || Math.random().toString(36).slice(-8), // Generate random password if missing
            };
        });

        // Insert data into MongoDB
        const insertedEmployees = await Employee.insertMany(employeesToInsert);

        // Send welcome email to all employees
        for (const emp of insertedEmployees) {
            const emailData = {
                firstName: emp.firstName,
                email: emp.email,
                password: emp.password,
                loginUrl: "https://kinda-hrms-testing.netlify.app/login",
            };
            await sendEmail(emp.email, 'Welcome to Kinda HRMS', 'hrmsLogin', emailData);
        }

        // Delete the uploaded file after processing
        fs.unlinkSync(filePath);

        res.status(201).json({
            message: 'Employees inserted and emails sent successfully.',
            insertedCount: insertedEmployees.length,
            employees: insertedEmployees,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'An error occurred while processing the file.', details: err.message });
    }
};


// const bulkInsertEmployees = async (req, res) => {
//     try {
//         // Check if a file is uploaded
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded.' });
//         }

//         const filePath = path.resolve(req.file.path); // Path to the uploaded file
//         const employeesData = [];

//         // Check file type and parse accordingly
//         if (req.file.mimetype === 'text/csv') {
//             // Parse CSV file
//             await new Promise((resolve, reject) => {
//                 fs.createReadStream(filePath)
//                     .pipe(csvParser())
//                     .on('data', (row) => employeesData.push(row))
//                     .on('end', resolve)
//                     .on('error', reject);
//             });
//         } else if (
//             req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//             req.file.mimetype === 'application/vnd.ms-excel'
//         ) {
//             // Parse XLS/XLSX file
//             const workbook = xlsx.readFile(filePath);
//             const sheetName = workbook.SheetNames[0]; // Assume data is in the first sheet
//             const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//             employeesData.push(...sheetData);
//         } else {
//             return res.status(400).json({ error: 'Invalid file format. Upload CSV or XLS/XLSX files only.' });
//         }

//         // Fetch departments and create a map for department name to ObjectId
//         const departments = await Department.find({});
//         const departmentMap = {};
//         departments.forEach((dep) => {
//             departmentMap[dep.name] = dep._id; // Map department name to ObjectId
//         });

//         // Transform data and validate records based on the new schema
//         const employeesToInsert = employeesData.map((row) => {
//             const departmentId = departmentMap[row.department] || null;

//             return {
//                 employeeId: row.employeeId,
//                 firstName: row.firstName,
//                 lastName: row.lastName,
//                 email: row.email,
//                 phone: row.phone,
//                 address: row.address,
//                 department: departmentId, // Map department name to ObjectId
//                 designation: row.designation,
//                 dateOfJoining: new Date(row.dateOfJoining),
//                 salary: parseFloat(row.salary),
//                 sickLeave: parseInt(row.sickLeave || 4, 10),
//                 casualLeave: parseInt(row.casualLeave || 8, 10),
//                 status: row.status || 'active',
//                 role: row.role || 'employee',
//                 password: row.password,
//             };
//         });

//         // Insert data into MongoDB
//         const insertedEmployees = await Employee.insertMany(employeesToInsert);

//         // Send welcome email to all employees
//         for (const emp of insertedEmployees) {
//             const emailData = {
//                 firstName: emp.firstName,
//                 email: emp.email,
//                 password: emp.password,
//                 loginUrl: "https://kinda-hrms-testing.netlify.app/login",
//             };
//             await sendEmail(emp.email, 'Welcome to Kinda HRMS', 'hrmsLogin', emailData);
//         }

//         // Delete the uploaded file after processing
//         fs.unlinkSync(filePath);

//         res.status(201).json({
//             message: 'Employees inserted and emails sent successfully.',
//             insertedCount: insertedEmployees.length,
//             employees: insertedEmployees,
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ error: 'An error occurred while processing the file.' });
//     }
// };



// const bulkInsertEmployees = async (req, res) => {
//     try {
//         // Check if a file is uploaded
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded.' });
//         }

//         const filePath = path.resolve(req.file.path); // Path to the uploaded file
//         const employeesData = [];

//         // Check file type and parse accordingly
//         if (req.file.mimetype === 'text/csv') {
//             // Parse CSV file
//             await new Promise((resolve, reject) => {
//                 fs.createReadStream(filePath)
//                     .pipe(csvParser())
//                     .on('data', (row) => employeesData.push(row))
//                     .on('end', resolve)
//                     .on('error', reject);
//             });
//         } else if (
//             req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//             req.file.mimetype === 'application/vnd.ms-excel'
//         ) {
//             // Parse XLS/XLSX file
//             const workbook = xlsx.readFile(filePath);
//             const sheetName = workbook.SheetNames[0]; // Assume data is in the first sheet
//             const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//             employeesData.push(...sheetData);
//         } else {
//             return res.status(400).json({ error: 'Invalid file format. Upload CSV or XLS/XLSX files only.' });
//         }

//         // Fetch employees (managers) from the database and create a mapping for managerId
//         const employees = await Employee.find({});
//         const employeeMap = {};
//         employees.forEach((emp) => {
//             employeeMap[emp.employeeId] = emp._id; // Mapping employeeId to _id
//         });

//         // Fetch departments and create a map for department name to ObjectId
//         const departments = await Department.find({});
//         const departmentMap = {};
//         departments.forEach((dep) => {
//             departmentMap[dep.name] = dep._id; // Map department name to ObjectId
//         });

//         // Transform data and validate records
//         const employeesToInsert = employeesData.map((row) => {
//             const managerId = employeeMap[row.managerId] || null;
//             const departmentId = departmentMap[row.department] || null;

//             return {
//                 employeeId: row.employeeId,
//                 firstName: row.firstName,
//                 lastName: row.lastName,
//                 email: row.email,
//                 phone: row.phone,
//                 address: row.address,
//                 department: departmentId, // Map department name to ObjectId
//                 designation: row.designation,
//                 dateOfJoining: new Date(row.dateOfJoining),
//                 salary: parseFloat(row.salary),
//                 sickLeave: parseInt(row.sickLeave || 4, 10),
//                 casualLeave: parseInt(row.casualLeave || 8, 10),
//                 managerId: managerId, // Map managerId (employeeId) to ObjectId
//                 status: row.status || 'active',
//                 role: row.role || 'employee',
//                 profilePicture: row.profilePicture,
//                 password: row.password,
//             };
//         });

//         // Validate managerIds
//         const invalidManagers = employeesToInsert.filter((emp) => emp.managerId === null && emp.managerId !== undefined);
//         if (invalidManagers.length > 0) {
//             return res.status(400).json({
//                 error: 'Some managerIds in the file do not exist in the database.',
//                 invalidManagers: invalidManagers.map((emp) => emp.managerId),
//             });
//         }

//         // Validate departmentIds
//         const invalidDepartments = employeesToInsert.filter((emp) => emp.department === null && emp.department !== undefined);
//         if (invalidDepartments.length > 0) {
//             return res.status(400).json({
//                 error: 'Some departments in the file do not exist in the database.',
//                 invalidDepartments: invalidDepartments.map((emp) => emp.department),
//             });
//         }

//         // Insert data into MongoDB
//         const insertedEmployees = await Employee.insertMany(employeesToInsert);

//         // Send welcome email to all employees
//         for (const emp of insertedEmployees) {
//             const emailData = {
//                 firstName: emp.firstName,
//                 email: emp.email,
//                 password: emp.password,
//                 loginUrl: "https://kinda-hrms-testing.netlify.app/login",
//             };
//             await sendEmail(emp.email, 'Welcome to Kinda HRMS', 'hrmsLogin', emailData);
//         }

//         // Delete the uploaded file after processing
//         fs.unlinkSync(filePath);

//         res.status(201).json({
//             message: 'Employees inserted and emails sent successfully.',
//             insertedCount: insertedEmployees.length,
//             employees: insertedEmployees,
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ error: 'An error occurred while processing the file.' });
//     }
// };


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
// const getAllEmployees = async (req, res) => {
//     try {
//         const employees = await Employee.find().populate('department', 'name');
//         if(!employees){
//             res.status(400).json({message: "No data fount" });
//         }
//         res.status(200).json(employees);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
const getAllEmployees = async (req, res) => {
    try {
        // Fetch all employees, excluding the one with employeeId "RW7446"
        const employees = await Employee.find({ employeeId: { $ne: "RW7446" } })
            .populate('department', 'name') // Populate department with only name field
            .populate('level1ReportingManager', 'firstName lastName role') // Populate Level 1 Manager with specific fields
            .populate('level2ReportingManager', 'firstName lastName role') // Populate Level 2 Manager with specific fields
            .sort({ firstName: 1 }); // Sort alphabetically by firstName

        if (!employees || employees.length === 0) {
            return res.status(400).json({ message: "No data found" });
        }

        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Employee By ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('department', 'name') // Populate department with only name field
            .populate('level1ReportingManager', 'firstName lastName role') // Populate Level 1 Manager with specific fields
            .populate('level2ReportingManager', 'firstName lastName role'); // Populate Level 2 Manager with specific fields

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


module.exports = {bulkInsertEmployees, getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, loginEmployee, registerEmployee, getMyProfile}

