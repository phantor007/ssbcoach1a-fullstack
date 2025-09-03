# Frontend Route - Authentication
# Express.js router for login, registration, logout

const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    }
});

// Middleware to check if user is already authenticated
const redirectIfAuthenticated = (req, res, next) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    next();
};

// GET /auth/login - Show login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('pages/auth/login', {
        title: 'Login - SSB Coach 1A',
        page: 'login',
        errors: [],
        formData: {}
    });
});

// POST /auth/login - Handle login submission
router.post('/login', [
    authLimiter,
    redirectIfAuthenticated,
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('pages/auth/login', {
                title: 'Login - SSB Coach 1A',
                page: 'login',
                errors: errors.array(),
                formData: req.body
            });
        }

        const { email, password, remember } = req.body;

        // Call backend API for authentication
        const response = await axios.post(`${process.env.API_BASE_URL}/api/auth/login`, {
            email,
            password,
            remember: !!remember
        });

        if (response.data.success) {
            const { user, access_token, refresh_token } = response.data.data;
            
            // Store user session
            req.session.user = user;
            req.session.access_token = access_token;
            
            // Store refresh token as httpOnly cookie
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Set remember me cookie if requested
            if (remember) {
                res.cookie('remember_user', user.id, {
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production'
                });
            }

            req.flash('success', 'Welcome back! Login successful.');
            
            // Redirect based on user role
            const redirectUrl = user.role === 'admin' || user.role === 'super_admin' 
                ? '/admin' : '/dashboard';
            
            return res.redirect(redirectUrl);
        }
        
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        
        res.render('pages/auth/login', {
            title: 'Login - SSB Coach 1A',
            page: 'login',
            errors: [{ msg: errorMessage }],
            formData: req.body
        });
    }
});

// GET /auth/register - Show registration page
router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('pages/auth/register', {
        title: 'Register - SSB Coach 1A',
        page: 'register',
        errors: [],
        formData: {}
    });
});

// POST /auth/register - Handle registration submission
router.post('/register', [
    authLimiter,
    redirectIfAuthenticated,
    body('first_name').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('last_name').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return value;
    }),
    body('phone').optional().isMobilePhone('en-IN').withMessage('Please enter a valid Indian mobile number'),
    body('date_of_birth').optional().isISO8601().withMessage('Please enter a valid date of birth'),
    body('terms').equals('on').withMessage('You must accept the terms and conditions')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('pages/auth/register', {
                title: 'Register - SSB Coach 1A',
                page: 'register',
                errors: errors.array(),
                formData: req.body
            });
        }

        const { first_name, last_name, username, email, password, phone, date_of_birth, bio } = req.body;

        // Call backend API for registration
        const response = await axios.post(`${process.env.API_BASE_URL}/api/auth/register`, {
            first_name,
            last_name,
            username,
            email,
            password,
            phone: phone || null,
            date_of_birth: date_of_birth || null,
            bio: bio || null,
            role: 'student' // Default role for new registrations
        });

        if (response.data.success) {
            const { user, access_token, refresh_token } = response.data.data;
            
            // Store user session
            req.session.user = user;
            req.session.access_token = access_token;
            
            // Store refresh token as httpOnly cookie
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            req.flash('success', 'Registration successful! Welcome to SSB Coach 1A.');
            return res.redirect('/dashboard');
        }
        
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        
        res.render('pages/auth/register', {
            title: 'Register - SSB Coach 1A',
            page: 'register',
            errors: [{ msg: errorMessage }],
            formData: req.body
        });
    }
});

// GET /auth/logout - Handle logout
router.get('/logout', async (req, res) => {
    try {
        // Call backend API to logout (invalidate tokens)
        if (req.session.access_token) {
            await axios.post(`${process.env.API_BASE_URL}/api/auth/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${req.session.access_token}`
                }
            }).catch(() => {}); // Ignore errors on logout
        }
        
        // Clear session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            
            // Clear cookies
            res.clearCookie('refresh_token');
            res.clearCookie('remember_user');
            res.clearCookie('ssbcoach1a.sid');
            
            req.flash('success', 'You have been logged out successfully.');
            res.redirect('/');
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        req.flash('error', 'An error occurred during logout.');
        res.redirect('/');
    }
});

// GET /auth/forgot-password - Show forgot password page
router.get('/forgot-password', redirectIfAuthenticated, (req, res) => {
    res.render('pages/auth/forgot-password', {
        title: 'Forgot Password - SSB Coach 1A',
        page: 'forgot-password',
        errors: [],
        formData: {}
    });
});

// POST /auth/forgot-password - Handle forgot password submission
router.post('/forgot-password', [
    authLimiter,
    redirectIfAuthenticated,
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('pages/auth/forgot-password', {
                title: 'Forgot Password - SSB Coach 1A',
                page: 'forgot-password',
                errors: errors.array(),
                formData: req.body
            });
        }

        const { email } = req.body;

        // Call backend API for password reset
        await axios.post(`${process.env.API_BASE_URL}/api/auth/forgot-password`, {
            email
        });

        // Always show success message for security
        req.flash('success', 'If an account with that email exists, we have sent password reset instructions.');
        res.redirect('/auth/login');
        
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('success', 'If an account with that email exists, we have sent password reset instructions.');
        res.redirect('/auth/login');
    }
});

// GET /auth/reset-password/:token - Show reset password page
router.get('/reset-password/:token', redirectIfAuthenticated, (req, res) => {
    res.render('pages/auth/reset-password', {
        title: 'Reset Password - SSB Coach 1A',
        page: 'reset-password',
        token: req.params.token,
        errors: [],
        formData: {}
    });
});

// POST /auth/reset-password/:token - Handle reset password submission
router.post('/reset-password/:token', [
    authLimiter,
    redirectIfAuthenticated,
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return value;
    })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('pages/auth/reset-password', {
                title: 'Reset Password - SSB Coach 1A',
                page: 'reset-password',
                token: req.params.token,
                errors: errors.array(),
                formData: req.body
            });
        }

        const { password } = req.body;
        const { token } = req.params;

        // Call backend API for password reset
        const response = await axios.post(`${process.env.API_BASE_URL}/api/auth/reset-password`, {
            token,
            password
        });

        if (response.data.success) {
            req.flash('success', 'Password reset successful! You can now login with your new password.');
            return res.redirect('/auth/login');
        }
        
    } catch (error) {
        console.error('Reset password error:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
        
        res.render('pages/auth/reset-password', {
            title: 'Reset Password - SSB Coach 1A',
            page: 'reset-password',
            token: req.params.token,
            errors: [{ msg: errorMessage }],
            formData: req.body
        });
    }
});

module.exports = router;