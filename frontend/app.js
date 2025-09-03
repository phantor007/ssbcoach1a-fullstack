/**
 * SSB Coach 1A - Frontend Application
 * Node.js + Express.js + EJS Templates
 * Version: 1.0.0
 */

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import middleware and utilities
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const apiClient = require('./utils/apiClient');

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const testsRoutes = require('./routes/tests');
const coachesRoutes = require('./routes/coaches');
const centersRoutes = require('./routes/centers');
const blogRoutes = require('./routes/blog');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

// Create Express application
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

console.log('🚀 Starting SSB Coach 1A Frontend Server...');
console.log(`📊 Environment: ${NODE_ENV}`);
console.log(`🔌 API Base URL: ${API_BASE_URL}`);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", API_BASE_URL]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Logging
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'ssbcoach1a-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    name: 'ssbcoach1a.sid',
    cookie: {
        secure: NODE_ENV === 'production', // Only use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '7d' : '0',
    etag: true
}));

// Global middleware to pass data to templates
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.isAuthenticated = !!req.user;
    res.locals.currentPath = req.path;
    res.locals.messages = req.flash();
    res.locals.NODE_ENV = NODE_ENV;
    res.locals.API_BASE_URL = API_BASE_URL;
    res.locals.moment = require('moment');
    res.locals._ = require('lodash');
    next();
});

// API client setup
app.use((req, res, next) => {
    req.apiClient = apiClient;
    next();
});

// Authentication middleware for protected routes
app.use('/dashboard', authMiddleware.requireAuth);
app.use('/profile', authMiddleware.requireAuth);
app.use('/admin', authMiddleware.requireAuth, authMiddleware.requireRole(['admin', 'super_admin']));

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/tests', testsRoutes);
app.use('/coaches', coachesRoutes);
app.use('/centers', centersRoutes);
app.use('/blog', blogRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);

// API proxy routes (for direct API access from frontend)
app.use('/api', require('./routes/apiProxy'));

// Socket.IO for real-time features
io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    
    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`👤 User ${userId} joined personal room`);
    });
    
    // Handle test progress updates
    socket.on('test-progress', (data) => {
        socket.to(`user-${data.userId}`).emit('test-progress-update', data);
    });
    
    // Handle real-time notifications
    socket.on('notification', (data) => {
        io.to(`user-${data.userId}`).emit('new-notification', data);
    });
    
    socket.on('disconnect', () => {
        console.log(`👋 User disconnected: ${socket.id}`);
    });
});

// Make io available to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: '1.0.0'
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('pages/error', {
        title: 'Page Not Found',
        error: {
            status: 404,
            message: 'The page you are looking for could not be found.',
            description: 'Please check the URL or navigate back to the homepage.'
        }
    });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Close server gracefully
    server.close(() => {
        process.exit(1);
    });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Close server gracefully
    server.close(() => {
        process.exit(1);
    });
});

// Start server
server.listen(PORT, () => {
    console.log('✅ SSB Coach 1A Frontend Server started successfully!');
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔗 API Connection: ${API_BASE_URL}`);
    console.log('📚 Available Routes:');
    console.log('   🏠 Homepage: http://localhost:' + PORT);
    console.log('   🔐 Login: http://localhost:' + PORT + '/auth/login');
    console.log('   📊 Dashboard: http://localhost:' + PORT + '/dashboard');
    console.log('   📝 Tests: http://localhost:' + PORT + '/tests');
    console.log('   👥 Coaches: http://localhost:' + PORT + '/coaches');
    console.log('   🏢 Centers: http://localhost:' + PORT + '/centers');
    console.log('   📖 Blog: http://localhost:' + PORT + '/blog');
    console.log('   ⚙️ Admin: http://localhost:' + PORT + '/admin');
    console.log('   ❤️ Health: http://localhost:' + PORT + '/health');
});

module.exports = app;