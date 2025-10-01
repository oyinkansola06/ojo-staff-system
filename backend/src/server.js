const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
// const attendanceRoutes = require('./routes/attendance');  // Make sure this exists
// or if you have separate files:
// const staffRoutes = require('./routes/staff');
// const attendanceRoutes = require('./routes/attendance');

// Register routes
// app.use('/api', attendanceRoutes);  // This registers all routes with /api prefix

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});