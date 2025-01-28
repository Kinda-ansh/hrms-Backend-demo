const Employee = require('../model/Employee');
const Attendance = require('../model/Attendance');
const Ticket = require('../model/Tickets');
const Settings = require('../model/settings');

const getDashboardAnalytics = async (req, res) => {
    try {
        // Get today's date
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of the day (midnight)
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of the day

        // Total present employees on today's date (including 'present' and 'late')
        const presentEmployeesCount = await Attendance.countDocuments({
            status: { $in: ['present', 'late'] }, // Include both 'present' and 'late'
            date: { $gte: startOfDay, $lte: endOfDay } // Ensure the attendance is marked today
        });

        // Pending tickets
        const pendingTicketsCount = await Ticket.countDocuments({ status: 'pending' });

        // Latest announcements
        const announcements = await Settings.findOne({}, { announcements: 1 }).sort({ updatedAt: -1 });

        // Total employees excluding admin
        const totalEmployeesCount = await Employee.countDocuments({ role: { $ne: 'admin' } });

        res.status(200).json({
            totalPresentEmployeesToday: presentEmployeesCount,
            pendingTickets: pendingTicketsCount,
            announcements: announcements?.announcements || [],
            totalEmployees: totalEmployeesCount
        });
    } catch (error) {
        console.error('Error fetching dashboard analytics:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching analytics data.' });
    }
};

module.exports = { getDashboardAnalytics };
