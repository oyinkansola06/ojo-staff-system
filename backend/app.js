const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const departmentRoutes = require('./routes/departments');
const staffRoutes = require('./routes/staff');
const attendanceRoutes = require('./routes/attendance');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your React app URL
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true, 
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// Handle 404 routes
app.use('/', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;