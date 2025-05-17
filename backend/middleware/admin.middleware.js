const db = require('../config/db');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
        
        if (!users.length || users[0].role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Middleware to log admin actions
const logAdminAction = async (req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
        // Store the response data
        res.locals.responseData = data;
        // Call the original json method
        return originalJson.call(this, data);
    };

    try {
        next();

        // Log the action after the response is sent
        if (req.user && req.user.role === 'admin') {
            const action = req.method + ' ' + req.originalUrl;
            const entityType = req.baseUrl.split('/').pop(); // e.g., 'users', 'products'
            const entityId = req.params.id;
            
            // Convert body and response to JSON strings safely
            const oldValue = req.body ? JSON.stringify(req.body) : null;
            const newValue = res.locals.responseData ? JSON.stringify(res.locals.responseData) : null;
            
            await db.query(
                `INSERT INTO audit_logs 
                (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.user.id,
                    action,
                    entityType,
                    entityId || null,
                    oldValue,
                    newValue,
                    req.ip,
                    req.headers['user-agent']
                ]
            );
        }
    } catch (error) {
        console.error('Error logging admin action:', error);
        // Don't send error response here as the main response has already been sent
    }
};

// Middleware to check maintenance mode
const checkMaintenanceMode = async (req, res, next) => {
    try {
        // Skip maintenance check for admin routes
        if (req.path.startsWith('/api/admin')) {
            return next();
        }

        const [settings] = await db.query(
            'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
            ['maintenance_mode']
        );

        if (settings.length && settings[0].setting_value === 'true') {
            return res.status(503).json({
                success: false,
                message: 'The site is currently under maintenance. Please try again later.'
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance mode check error:', error);
        next(); // Continue even if there's an error checking maintenance mode
    }
};

module.exports = {
    isAdmin,
    logAdminAction,
    checkMaintenanceMode
}; 