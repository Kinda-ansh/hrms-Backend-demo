const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Employee = require("../model/Employee"); // Adjust the path to your Employee model
const Leave = require("../model/Leave");
const Attendance = require("../model/Attendance");
const { faker } = require('@faker-js/faker');

const moment = require("moment");

// Department IDs (these should already exist in your DB, adjust as necessary)
const departmentIds = [
    mongoose.Types.ObjectId('673c51cfbb49ef24c2ce66e3'),
    mongoose.Types.ObjectId('673c50fcae711be29d09f756'),
];

// Function to generate unique employee data
const generateUniqueString = (prefix, index) => `${prefix}-${Date.now()}-${index}`;

const generateEmployeeData = async (count) => {
    const employees = [];

    // Generate employee data
    for (let i = 1; i <= count; i++) {
        // Generate a hashed password
        const hashedPassword = await bcrypt.hash("password123", 10); // Simple hashed password
        
        // Random joining date in the last 30 days
        const joiningDate = new Date();
        joiningDate.setDate(joiningDate.getDate() - Math.floor(Math.random() * 30)); 

        // Ensure unique email by appending the index to the email
        const email = `employee${i}@example.com`;

        // Add employee data to array
        employees.push({
            employeeId: generateUniqueString("EMP", i),
            firstName: `FirstName${i}`,
            lastName: `LastName${i}`,
            email: email, // Ensure unique email
            phone: `98${i % 10}${Math.floor(Math.random() * 10)}78432${i % 10}${Math.floor(Math.random() * 10)}`, // Generate phone number
            address: `Address ${i}`,
            department: departmentIds[Math.floor(Math.random() * departmentIds.length)], // Random department
            designation: `Designation${i}`,
            dateOfJoining: joiningDate,
            role: "employee", // Default role
            password: hashedPassword, // Store hashed password
            createdAt: joiningDate, 
            updatedAt: joiningDate,
        });
    }

    return employees;
};


// Function to insert employees into the database
const insertEmployees = async () => {
    try {
        const employees = await generateEmployeeData(20); // Generate 10 employees
        
        for (const employee of employees) {
            await Employee.updateOne(
                { email: employee.email }, 
                { $set: employee }, 
                { upsert: true } // Insert if not exists, update if exists
            );
        }
        console.log(employees)
        console.log("Employee data inserted successfully.");
    } catch (error) {
        console.error("Error inserting employee data:", error);
    } finally {
        mongoose.connection.close();
    }
};



const insertDummyEmployees = async (req, res) => {
    try {
        // Check if dummy data already exists
        const existingEmployees = await Employee.find({});
        if (existingEmployees.length > 0) {
            return res.status(400).json({ message: "Dummy employees data already exists." });
        }

        // Dummy data creation (October 2024 or older for both data and joining date)
        const dummyEmployees = [
            {
                employeeId: 'EMP001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                phone: '1234567890',
                address: '123 Main St, Springfield, IL',
                department: null, // assuming no department for simplicity
                designation: 'Software Engineer',
                dateOfJoining: new Date('2022-10-15'), // Joining date in October 2022
                salary: 50000,
                sickLeave: 4,
                casualLeave: 8,
                totalLeaveTaken: 0,
                managerId: null, // No manager for simplicity
                status: 'active',
                role: 'employee',
                profilePicture: '',
                password: 'password123', // Plain password will be hashed before saving
            },
            {
                employeeId: 'EMP002',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'janesmith@example.com',
                phone: '1234567891',
                address: '456 Elm St, Springfield, IL',
                department: null,
                designation: 'HR Manager',
                dateOfJoining: new Date('2021-10-10'), // Joining date in October 2021
                salary: 60000,
                sickLeave: 4,
                casualLeave: 8,
                totalLeaveTaken: 0,
                managerId: null,
                status: 'active',
                role: 'hr',
                profilePicture: '',
                password: 'password123',
            },
            {
                employeeId: 'EMP003',
                firstName: 'Michael',
                lastName: 'Johnson',
                email: 'michaeljohnson@example.com',
                phone: '1234567892',
                address: '789 Oak St, Springfield, IL',
                department: null,
                designation: 'Project Manager',
                dateOfJoining: new Date('2020-09-01'), // Joining date in September 2020
                salary: 75000,
                sickLeave: 5,
                casualLeave: 10,
                totalLeaveTaken: 0,
                managerId: null,
                status: 'active',
                role: 'employee',
                profilePicture: '',
                password: 'password123',
            },
            {
                employeeId: 'EMP004',
                firstName: 'Emily',
                lastName: 'Davis',
                email: 'emilydavis@example.com',
                phone: '1234567893',
                address: '101 Pine St, Springfield, IL',
                department: null,
                designation: 'Sales Executive',
                dateOfJoining: new Date('2023-10-01'), // Joining date in October 2023
                salary: 45000,
                sickLeave: 4,
                casualLeave: 8,
                totalLeaveTaken: 0,
                managerId: null,
                status: 'active',
                role: 'employee',
                profilePicture: '',
                password: 'password123',
            },
            {
                employeeId: 'EMP005',
                firstName: 'David',
                lastName: 'Martinez',
                email: 'davidmartinez@example.com',
                phone: '1234567894',
                address: '202 Maple St, Springfield, IL',
                department: null,
                designation: 'Marketing Manager',
                dateOfJoining: new Date('2020-10-05'), // Joining date in October 2020
                salary: 70000,
                sickLeave: 5,
                casualLeave: 10,
                totalLeaveTaken: 0,
                managerId: null,
                status: 'active',
                role: 'employee',
                profilePicture: '',
                password: 'password123',
            }
        ];

        // Insert dummy employees into the database
        await Employee.insertMany(dummyEmployees);

        res.status(200).json({
            message: "Dummy employees data inserted successfully.",
            employees: dummyEmployees
        });
    } catch (error) {
        console.error('Error inserting dummy employees data:', error);
        res.status(500).json({ message: "An error occurred while inserting dummy employees data.", error });
    }
};






// Employee IDs
const employeeIds = [
    mongoose.Types.ObjectId('673dbaee140af68a3d93a9e2'),
    mongoose.Types.ObjectId('673dbedda3467c19b9975a98'),
    mongoose.Types.ObjectId('673ebfd7e34a935e97538eef'),
    mongoose.Types.ObjectId('673ebfd7e34a935e97538ef3'),
    mongoose.Types.ObjectId('673ebfd7e34a935e97538ef5'),
    mongoose.Types.ObjectId('673ebfd7e34a935e97538ef7'),
    mongoose.Types.ObjectId('673ebfd7e34a935e97538efb'),
    mongoose.Types.ObjectId('673ec0d9e34a935e97538fbf'),
    mongoose.Types.ObjectId('673ec0d9e34a935e97538fc1'),
    mongoose.Types.ObjectId('673ec0d9e34a935e97538fc5'),
    mongoose.Types.ObjectId('673ec0d9e34a935e97538fcb')
];

// Function to generate random leave data
const generateLeaveData = async (count) => {
    const leaves = [];
    const today = new Date();
    
    // Generate leave data for the given count
    for (let i = 0; i < count; i++) {
        const employeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
        
        // Random start date within the last 60 days
        const randomDaysAgo = Math.floor(Math.random() * 60);
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - randomDaysAgo);
        
        // Random end date (within 3 days of the start date)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3)); // Ensures end date is within 3 days
        
        // Create leave data
        leaves.push({
            employeeId: employeeId,
            leaveType: Math.random() > 0.5 ? 'sickLeave' : 'casualLeave',
            startDate: startDate,
            endDate: endDate,
            reason: `Reason for leave ${i + 1}`,
            status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)], // Random status
            approvedBy: Math.random() > 0.5 ? employeeIds[Math.floor(Math.random() * employeeIds.length)] : null, // Random approver
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    return leaves;
};


// Function to insert leave data into MongoDB
const insertLeaveData = async () => {
    try {
        const leaves = await generateLeaveData(10); // Generate 10 leave records
        await Leave.insertMany(leaves); // Insert into MongoDB

        console.log("Leave data inserted successfully.");
    } catch (error) {
        console.error("Error inserting leave data:", error);
    } finally {
        mongoose.connection.close();
    }
};





// Function to generate random attendance data
const generateAttendanceData = async (count) => {
    const attendances = [];
    const today = new Date();
    
    // Generate attendance data for the last 30 days
    for (let i = 0; i < count; i++) {
        const employeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
        
        // Generate 30 attendance records for each employee, excluding Sundays
        for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
            const date = new Date(today);
            date.setDate(today.getDate() - dayOffset); // Set the date to the past

            // Skip Sundays (getDay() returns 0 for Sunday)
            if (date.getDay() === 0) {
                continue; // Skip if it's Sunday
            }

            // Random check-in time (between 8 AM and 10 AM)
            const checkInTime = new Date(date);
            checkInTime.setHours(8 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60)); // Check-in between 8 AM and 10 AM
            
            // Random check-out time (between 4 PM and 7 PM, ensuring working hours are between 6 and 9 hours)
            let totalWorkingHours = 6 + Math.floor(Math.random() * 4); // Working hours between 6 and 9
            
            // Calculate check-out time based on check-in time + working hours
            const checkOutTime = new Date(checkInTime);
            checkOutTime.setHours(checkInTime.getHours() + totalWorkingHours);
            
            // If check-out time exceeds 9 hours, adjust to keep it between 6-9 hours
            if (checkOutTime - checkInTime > 9 * 60 * 60 * 1000) {
                totalWorkingHours = 9;
                checkOutTime.setHours(checkInTime.getHours() + 9);
            }

            // Calculate late time (if check-in is after 9:30 AM)
            let lateTime = null;
            if (checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30)) {
                const lateInMinutes = (checkInTime - new Date(checkInTime.setHours(9, 30))) / 60000; // late in minutes from 09:30 AM
                lateTime = `${Math.floor(lateInMinutes)}m`;
            }

            // Set status based on check-in time
            const status = checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30) 
                ? 'late' 
                : 'present';

            // Create attendance data
            attendances.push({
                employeeId: employeeId,
                date: date,
                checkInTime: checkInTime,
                checkOutTime: checkOutTime,
                totalWorkingHour: `${totalWorkingHours}h ${checkOutTime.getMinutes()}m`,
                lateTime: lateTime,
                status: status,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    return attendances;
};

// Function to insert attendance data into MongoDB
const insertAttendanceData = async () => {
    try {
        const attendances = await generateAttendanceData(employeeIds.length); // Generate attendance records for all employees
        await Attendance.insertMany(attendances); // Insert into MongoDB

        console.log("Attendance data inserted successfully.");
    } catch (error) {
        console.error("Error inserting attendance data:", error);
    } finally {
        mongoose.connection.close();
    }
};



const insertFakeAttendanceData = async (req, res) => {
    try {
        // Fetch all employees
        const employees = await Employee.find();

        if (!employees.length) {
            return res.status(404).json({ message: "No employees found in the database." });
        }

        // Generate fake attendance records for each employee
        const attendanceRecords = employees.map(employee => {
            // Generate a random date within the current month (example for December 2024)
            const fromDate = new Date('2024-12-01');  // Start date of December
            const toDate = new Date('2024-12-31');    // End date of December
            
            // Pass the `from` and `to` as an options object
            const randomDate = faker.date.between({ from: fromDate, to: toDate });  // Corrected usage of faker.date.between

            // Create check-in time between 8 AM and 9 AM for the random date
            const checkInDate = new Date(randomDate);  // Clone the randomDate to avoid mutating it
            checkInDate.setHours(8, faker.number.int({ min: 0, max: 59 }), 0, 0);  // Random check-in between 8 AM and 9 AM
            
            // Create check-out time between check-in time and 6 PM for the same date
            const checkOutDate = new Date(checkInDate);  // Clone the check-in time to avoid mutating it
            checkOutDate.setHours(18, faker.number.int({ min: 0, max: 59 }), 0, 0);  // Random check-out between check-in and 6 PM

            // Random late time (could be 0, 15m, 30m, etc.)
            const lateTime = faker.helpers.arrayElement(['0m', '15m', '30m', '45m', '60m']);  // Use helpers.arrayElement
            
            // Random attendance status (present, absent, or late)
            const status = faker.helpers.arrayElement(['present', 'absent', 'late']);  // Use helpers.arrayElement

            return {
                employeeId: employee._id,
                date: randomDate,
                checkInTime: checkInDate,
                checkOutTime: checkOutDate,
                totalWorkingHour: calculateWorkingHours(checkInDate, checkOutDate),
                lateTime,
                status,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        // Insert attendance records into the database
        await Attendance.insertMany(attendanceRecords);

        res.status(201).json({ message: "Fake attendance records inserted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while inserting attendance data." });
    }
};

// Helper function to calculate total working hours
const calculateWorkingHours = (checkInTime, checkOutTime) => {
    const diffInMilliseconds = checkOutTime - checkInTime;
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffInHours}h ${diffInMinutes}m`;
};


// const  insertMonthlyAttendanceData = async (req, res) => {
//     try {
//         // Fetch all employees
//         const employees = await Employee.find();

//         if (!employees.length) {
//             return res.status(404).json({ message: "No employees found in the database." });
//         }

//         // Define the range for November 2024
//         const fromDate = new Date('2024-11-01');
//         const toDate = new Date('2024-11-30');

//         // Generate all dates in November
//         const allDatesInNovember = [];
//         for (let date = fromDate; date <= toDate; date.setDate(date.getDate() + 1)) {
//             allDatesInNovember.push(new Date(date));
//         }

//         const attendanceRecords = [];

//         // Generate attendance for each employee for each day in November
//         employees.forEach(employee => {
//             allDatesInNovember.forEach(date => {
//                 // Randomize attendance status
//                 const status = faker.helpers.arrayElement(['present', 'absent', 'late']);

//                 let checkInTime = null;
//                 let checkOutTime = null;
//                 let lateTime = '0m';
//                 let totalWorkingHour = '0h 0m';

//                 // Generate check-in and check-out times if the employee is present or late
//                 if (status !== 'absent') {
//                     checkInTime = new Date(date);
//                     const checkInHour = faker.number.int({ min: 8, max: 11 }); // Random hour between 8 AM and 11 AM
//                     const checkInMinute = faker.number.int({ min: 0, max: 59 });
//                     checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

//                     // Determine if the employee is late
//                     if (checkInTime.getHours() >= 10) {
//                         lateTime = faker.helpers.arrayElement(['15m', '30m', '45m', '60m']);
//                     }

//                     checkOutTime = new Date(checkInTime);
//                     checkOutTime.setHours(Math.min(checkInTime.getHours() + 9, 18)); // Limit working hours to max 9 hours
//                     checkOutTime.setMinutes(faker.number.int({ min: 0, max: 59 }));

//                     totalWorkingHour = calculateWorkingHoursForMonth(checkInTime, checkOutTime);
//                 } else {
//                     // If absent but checked in before 10 AM, mark as present
//                     const absentCheckIn = new Date(date);
//                     absentCheckIn.setHours(faker.number.int({ min: 8, max: 11 }), faker.number.int({ min: 0, max: 59 }), 0, 0);
//                     if (absentCheckIn.getHours() < 10) {
//                         checkInTime = absentCheckIn;
//                         checkOutTime = new Date(absentCheckIn);
//                         checkOutTime.setHours(Math.min(absentCheckIn.getHours() + 9, 18));
//                         totalWorkingHour = calculateWorkingHoursForMonth(checkInTime, checkOutTime);
//                     } else {
//                         totalWorkingHour = '0h 0m';
//                     }
//                 }

//                 // Push attendance record
//                 attendanceRecords.push({
//                     employeeId: employee._id,
//                     date: new Date(date),
//                     checkInTime: status === 'absent' && !checkInTime ? null : checkInTime,
//                     checkOutTime: status === 'absent' && !checkOutTime ? null : checkOutTime,
//                     totalWorkingHour: status === 'absent' && !checkInTime ? '0h 0m' : totalWorkingHour,
//                     lateTime: status === 'absent' && !checkInTime ? '0m' : lateTime,
//                     status: status === 'absent' && checkInTime ? 'present' : status,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                 });
//             });
//         });

//         // Bulk insert into the database
//         await Attendance.insertMany(attendanceRecords);

//         res.status(201).json({ message: "Monthly attendance records for November 2024 inserted successfully." });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "An error occurred while inserting monthly attendance data." });
//     }
// };

// Helper function to calculate total working hours




// Controller to insert dummy data

// const insertMonthlyAttendanceData = async (req, res) => {
//     try {
//         // Fetch all employees
//         const employees = await Employee.find();

//         if (!employees.length) {
//             return res.status(404).json({ message: "No employees found in the database." });
//         }

//         // Define the range for November 2024
//         const fromDate = new Date('2024-11-01');
//         const toDate = new Date('2024-11-30');

//         // Generate all dates in November
//         const allDatesInNovember = [];
//         for (let date = new Date(fromDate); date <= toDate; date.setDate(date.getDate() + 1)) {
//             allDatesInNovember.push(new Date(date));
//         }

//         // Fetch approved leaves for November 2024
//         const approvedLeaves = await Leave.find({
//             status: 'approved',
//             $or: [
//                 { startDate: { $gte: fromDate, $lte: toDate } },
//                 { endDate: { $gte: fromDate, $lte: toDate } },
//                 { startDate: { $lte: fromDate }, endDate: { $gte: toDate } },
//             ],
//         });

//         // Create a map for quick lookup of leave dates for each employee
//         const leaveMap = {};
//         approvedLeaves.forEach(leave => {
//             const { employeeId, startDate, endDate } = leave;

//             const effectiveStartDate = startDate < fromDate ? fromDate : startDate;
//             const effectiveEndDate = endDate > toDate ? toDate : endDate;

//             if (!leaveMap[employeeId]) {
//                 leaveMap[employeeId] = new Set();
//             }

//             for (let date = new Date(effectiveStartDate); date <= effectiveEndDate; date.setDate(date.getDate() + 1)) {
//                 leaveMap[employeeId].add(date.toDateString()); // Use toDateString for consistent date comparison
//             }
//         });

//         const attendanceRecords = [];

//         // Generate attendance for each employee for each day in November
//         employees.forEach(employee => {
//             allDatesInNovember.forEach(date => {
//                 const dateString = date.toDateString();

//                 if (leaveMap[employee._id]?.has(dateString)) {
//                     // If the employee is on approved leave, mark attendance as "absent"
//                     attendanceRecords.push({
//                         employeeId: employee._id,
//                         date: new Date(date),
//                         checkInTime: null,
//                         checkOutTime: null,
//                         totalWorkingHour: '0h 0m',
//                         lateTime: '0m',
//                         status: 'absent', // Use 'absent' instead of 'on leave'
//                         createdAt: new Date(),
//                         updatedAt: new Date(),
//                     });
//                 } else {
//                     // Randomize attendance status
//                     const status = faker.helpers.arrayElement(['present', 'absent', 'late']);

//                     let checkInTime = null;
//                     let checkOutTime = null;
//                     let lateTime = '0m';
//                     let totalWorkingHour = '0h 0m';

//                     // Generate check-in and check-out times if the employee is present or late
//                     if (status !== 'absent') {
//                         checkInTime = new Date(date);
//                         const checkInHour = faker.number.int({ min: 8, max: 11 }); // Random hour between 8 AM and 11 AM
//                         const checkInMinute = faker.number.int({ min: 0, max: 59 });
//                         checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

//                         // Determine if the employee is late
//                         if (checkInTime.getHours() >= 10) {
//                             lateTime = faker.helpers.arrayElement(['15m', '30m', '45m', '60m']);
//                         }

//                         checkOutTime = new Date(checkInTime);
//                         checkOutTime.setHours(Math.min(checkInTime.getHours() + 9, 18)); // Limit working hours to max 9 hours
//                         checkOutTime.setMinutes(faker.number.int({ min: 0, max: 59 }));

//                         totalWorkingHour = calculateWorkingHoursForMonth(checkInTime, checkOutTime);
//                     }

//                     // Push attendance record
//                     attendanceRecords.push({
//                         employeeId: employee._id,
//                         date: new Date(date),
//                         checkInTime: status === 'absent' ? null : checkInTime,
//                         checkOutTime: status === 'absent' ? null : checkOutTime,
//                         totalWorkingHour: status === 'absent' ? '0h 0m' : totalWorkingHour,
//                         lateTime: status === 'absent' ? '0m' : lateTime,
//                         status: status,
//                         createdAt: new Date(),
//                         updatedAt: new Date(),
//                     });
//                 }
//             });
//         });

//         // Bulk insert into the database
//         await Attendance.insertMany(attendanceRecords);

//         res.status(201).json({ message: "Monthly attendance records for November 2024 inserted successfully." });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "An error occurred while inserting monthly attendance data." });
//     }
// };

// // Helper function to calculate total working hours
// const calculateWorkingHoursForMonth = (checkInTime, checkOutTime) => {
//     const diffInMilliseconds = checkOutTime - checkInTime;
//     const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
//     const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
//     return `${diffInHours}h ${diffInMinutes}m`;
// };

const insertNovemberAttendanceData = async (req, res) => {
    try {
        // Fetch all employees
        const employees = await Employee.find();

        if (!employees.length) {
            return res.status(404).json({ message: "No employees found in the database." });
        }

        // Define the range for November 2024
        const fromDate = new Date('2024-11-01');
        const toDate = new Date('2024-11-30');

        // Generate all dates in November
        const allDatesInNovember = [];
        for (let date = new Date(fromDate); date <= toDate; date.setDate(date.getDate() + 1)) {
            allDatesInNovember.push(new Date(date));
        }

        // Fetch approved leaves for November 2024
        const approvedLeaves = await Leave.find({
            status: 'approved',
            $or: [
                { startDate: { $gte: fromDate, $lte: toDate } },
                { endDate: { $gte: fromDate, $lte: toDate } },
                { startDate: { $lte: fromDate }, endDate: { $gte: toDate } },
            ],
        });

        // Create a map for quick lookup of leave dates for each employee
        const leaveMap = {};
        approvedLeaves.forEach(leave => {
            const { employeeId, startDate, endDate } = leave;

            const effectiveStartDate = startDate < fromDate ? fromDate : startDate;
            const effectiveEndDate = endDate > toDate ? toDate : endDate;

            if (!leaveMap[employeeId]) {
                leaveMap[employeeId] = new Set();
            }

            for (let date = new Date(effectiveStartDate); date <= effectiveEndDate; date.setDate(date.getDate() + 1)) {
                leaveMap[employeeId].add(date.toDateString()); // Use toDateString for consistent date comparison
            }
        });

        const attendanceRecords = [];

        // Generate attendance for each employee for each day in November
        employees.forEach(employee => {
            allDatesInNovember.forEach(date => {
                const dateString = date.toDateString();
                const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

                if (leaveMap[employee._id]?.has(dateString)) {
                    // If the employee is on approved leave, mark attendance as "absent"
                    attendanceRecords.push({
                        employeeId: employee._id,
                        date: new Date(date),
                        checkInTime: null,
                        checkOutTime: null,
                        totalWorkingHour: '0h 0m',
                        lateTime: '0m',
                        status: 'absent', // Use 'absent' instead of 'on leave'
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                } else {
                    let status = faker.helpers.arrayElement(['present', 'absent', 'late']);
                    let checkInTime = null;
                    let checkOutTime = null;
                    let lateTime = '0m';
                    let totalWorkingHour = '0h 0m';

                    // Handle Sundays as Weekly off (No check-in or check-out)
                    if (dayOfWeek === 0) {  // If it's Sunday
                        status = 'weekly-off';
                        totalWorkingHour = '0h 0m';
                    } else if (status !== 'absent') {
                        checkInTime = new Date(date);
                        const checkInHour = faker.number.int({ min: 8, max: 11 }); // Random hour between 8 AM and 11 AM
                        const checkInMinute = faker.number.int({ min: 0, max: 59 });
                        checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

                        // Determine if the employee is late
                        if (checkInTime.getHours() >= 10) {
                            lateTime = faker.helpers.arrayElement(['15m', '30m', '45m', '60m']);
                        }

                        checkOutTime = new Date(checkInTime);
                        checkOutTime.setHours(Math.min(checkInTime.getHours() + 9, 18)); // Limit working hours to max 9 hours
                        checkOutTime.setMinutes(faker.number.int({ min: 0, max: 59 }));

                        totalWorkingHour = calculateWorkingHoursForMonth(checkInTime, checkOutTime);
                    }

                    // Push attendance record
                    attendanceRecords.push({
                        employeeId: employee._id,
                        date: new Date(date),
                        checkInTime: status === 'absent' || status === 'weekly-off' ? null : checkInTime,
                        checkOutTime: status === 'absent' || status === 'weekly-off' ? null : checkOutTime,
                        totalWorkingHour: status === 'absent' || status === 'weekly-off' ? '0h 0m' : totalWorkingHour,
                        lateTime: status === 'absent' || status === 'weekly-off' ? '0m' : lateTime,
                        status: status,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            });
        });

        // Bulk insert into the database
        await Attendance.insertMany(attendanceRecords);

        res.status(201).json({ message: "November 2024 attendance records inserted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while inserting monthly attendance data." });
    }
};

// Helper function to calculate total working hours
const calculateWorkingHoursForMonth = (checkInTime, checkOutTime) => {
    const diffInMilliseconds = checkOutTime - checkInTime;
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffInHours}h ${diffInMinutes}m`;
};







const insertFakeLeaveData = async (req, res) => {
    try {
        // Fetch all employees
        const employees = await Employee.find();

        if (!employees.length) {
            return res.status(404).json({ message: "No employees found in the database." });
        }

        // Generate fake leave records for each employee
        const leaveRecords = employees.map(employee => {
            // Generate a random leave start date within the current year
            const fromDate = new Date('2024-01-01'); // Start of the year
            const toDate = new Date('2024-12-31'); // End of the year
            const randomStartDate = faker.date.between({ from: fromDate, to: toDate });

            // Generate a random leave end date (1-5 days from the start date)
            const randomEndDate = new Date(randomStartDate);
            randomEndDate.setDate(randomStartDate.getDate() + faker.number.int({ min: 1, max: 5 }));

            // Randomly choose leave type
            const leaveType = faker.helpers.arrayElement(['sickLeave', 'casualLeave', 'LWP']);

            // Randomly choose leave status
            const status = faker.helpers.arrayElement(['pending', 'approved', 'rejected']);

            // Randomly assign approver if the leave is approved or rejected
            const approvedBy = status === 'approved' || status === 'rejected' ? faker.helpers.arrayElement(employees)._id : null;

            return {
                employeeId: employee._id,
                leaveType,
                startDate: randomStartDate,
                endDate: randomEndDate,
                reason: faker.lorem.sentence(), // Generate a random leave reason
                status,
                approvedBy,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        // Insert leave records into the database
        await Leave.insertMany(leaveRecords);

        res.status(201).json({ message: "Fake leave records inserted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while inserting leave data." });
    }
};


const insertMonthlyFakeLeaveData = async (req, res) => {
    try {
        // Fetch all employees
        const employees = await Employee.find();

        if (!employees.length) {
            return res.status(404).json({ message: "No employees found in the database." });
        }

        // Define the date range for November 2024
        const fromDate = new Date('2024-11-01');
        const toDate = new Date('2024-11-30');

        const leaveRecords = [];

        // Generate leave records for each employee
        employees.forEach(employee => {
            let sickLeaveUsed = 0;
            let casualLeaveUsed = 0;

            // Randomly determine the number of leave entries for the employee in November
            const leaveEntries = faker.number.int({ min: 5, max: 15 }); // Adjusted for more realistic scenarios

            for (let i = 0; i < leaveEntries; i++) {
                const randomStartDate = faker.date.between({ from: fromDate, to: toDate });
                const leaveDuration = faker.number.int({ min: 1, max: 3 });

                const randomEndDate = new Date(randomStartDate);
                randomEndDate.setDate(randomStartDate.getDate() + leaveDuration);

                // Ensure the leave doesn't extend beyond November 30
                if (randomEndDate > toDate) {
                    randomEndDate.setDate(toDate.getDate());
                }

                // Choose leave type considering limits
                const availableLeaveTypes = [];
                if (sickLeaveUsed < 4) availableLeaveTypes.push('sickLeave');
                if (casualLeaveUsed < 8) availableLeaveTypes.push('casualLeave');
                if (availableLeaveTypes.length === 0) availableLeaveTypes.push('LWP'); // Default to LWP if limits are exhausted

                const leaveType = faker.helpers.arrayElement(availableLeaveTypes);

                // Update used leave counts
                if (leaveType === 'sickLeave') sickLeaveUsed++;
                if (leaveType === 'casualLeave') casualLeaveUsed++;

                // Randomly assign leave status
                const status = faker.helpers.arrayElement(['pending', 'approved', 'rejected']);

                // Randomly assign approver if the leave is approved or rejected
                const approvedBy =
                    status === 'approved' || status === 'rejected'
                        ? faker.helpers.arrayElement(employees)._id
                        : null;

                // Add leave record
                leaveRecords.push({
                    employeeId: employee._id,
                    leaveType,
                    startDate: randomStartDate,
                    endDate: randomEndDate,
                    reason: faker.lorem.sentence(),
                    status,
                    approvedBy,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        });

        // Insert leave records into the database
        await Leave.insertMany(leaveRecords);

        res.status(201).json({ message: "Fake leave records for November 2024 inserted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while inserting leave data." });
    }
};

const insertLeaveDataForAbsentEmployees = async (req, res) => {
    try {
        // Extract startDate and endDate from request body
        let { startDate, endDate } = req.body;

        // If not provided, default to November 2024
        if (!startDate || !endDate) {
            startDate = "2024-11-01";
            endDate = "2024-11-30";
        }

        const start = moment(startDate, "YYYY-MM-DD").startOf('day').toDate();
        const end = moment(endDate, "YYYY-MM-DD").endOf('day').toDate();

        // Fetch all attendance records with "absent" status within the given date range
        const absentees = await Attendance.find({
            status: "absent",
            date: { $gte: start, $lte: end },
        }).populate("employeeId");

        if (absentees.length === 0) {
            return res.status(404).json({ message: "No absent employees found in the given date range." });
        }

        const leaveDataToInsert = [];
        const absentDaysToSkip = new Set(); // To randomly skip absences

        absentees.forEach((attendance) => {
            const dayOfWeek = moment(attendance.date).day(); // 0 is Sunday

            if (dayOfWeek === 0) {
                // Skip Sundays
                return;
            }

            const employee = attendance.employeeId;

            // Ensure employee has leave balance
            if (employee.sickLeave <= 0 && employee.casualLeave <= 0) {
                return;
            }

            const randomSkip = Math.random() < 0.3; // 30% chance to keep the day absent
            if (randomSkip) {
                absentDaysToSkip.add(attendance.date.toISOString());
                return; // Skip this record
            }

            const leaveType = getRandomLeaveType(employee); // Determine leave type

            // Limit to 2-3 leaves per employee
            const employeeLeaveCount = leaveDataToInsert.filter(
                (leave) => leave.employeeId.toString() === employee._id.toString()
            ).length;

            if (employeeLeaveCount >= 3) {
                return;
            }

            leaveDataToInsert.push({
                employeeId: employee._id,
                leaveType,
                startDate: attendance.date,
                endDate: attendance.date,
                reason: "Auto-assigned leave due to absence",
                status: "approved", // Mark auto-inserted leaves as approved
            });
        });

        // Insert leave data in bulk
        if (leaveDataToInsert.length > 0) {
            await Leave.insertMany(leaveDataToInsert);
        }

        res.status(200).json({
            message: "Leave data inserted successfully for absent employees.",
            totalLeavesInserted: leaveDataToInsert.length,
            absencesSkipped: absentDaysToSkip.size,
        });
    } catch (error) {
        console.error("Error inserting leave data:", error);
        res.status(500).json({ message: "An error occurred while processing leave data.", error });
    }
};

// Helper function to randomly assign a leave type
const getRandomLeaveType = (employee) => {
    const leaveTypes = [];

    if (employee.sickLeave > 0) {
        leaveTypes.push("sickLeave");
    }
    if (employee.casualLeave > 0) {
        leaveTypes.push("casualLeave");
    }

    return leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
};





module.exports = {insertEmployees , insertLeaveData, insertDummyEmployees, insertAttendanceData,insertFakeAttendanceData, insertFakeLeaveData,  insertMonthlyFakeLeaveData , insertNovemberAttendanceData, insertLeaveDataForAbsentEmployees}
