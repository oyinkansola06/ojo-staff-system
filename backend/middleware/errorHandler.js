// Global error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);

    // Default error
    let error = { ...err };
    error.message = err.message;

    // MySQL duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
        const message = 'Duplicate entry detected';
        error = { message, statusCode: 409 };
    }

    // MySQL foreign key constraint error
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        const message = 'Referenced record does not exist';
        error = { message, statusCode: 400 };
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;