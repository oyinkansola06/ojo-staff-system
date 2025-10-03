// server.js
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3001;

// Start server
const startServer = async () => {
    try {
        // Test database connection first
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your configuration.');
            process.exit(1);
        }

        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
            console.log(`👥 Staff API: http://localhost:${PORT}/api/staff`);
            console.log(`📁 Departments API: http://localhost:${PORT}/api/departments`);
            console.log(`📋 Attendance API: http://localhost:${PORT}/api/attendance`);
            console.log('\n🔧 Available endpoints:');
            console.log('  GET  /api/health');
            console.log('  GET  /api/departments');
            console.log('  GET  /api/staff');
            console.log('  GET  /api/attendance/date/:date');
            console.log('  POST /api/attendance/checkin');
            console.log('  POST /api/attendance/checkout');
            console.log('  POST /api/attendance/manual');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();