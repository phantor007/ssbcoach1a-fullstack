// Frontend Middleware - Authentication
// Express.js middleware for user authentication and authorization

const axios = require('axios');

/**
 * Middleware to check if user is authenticated
 * Verifies JWT token and fetches user data
 */
const requireAuth = async (req, res, next) => {
    try {
        // Check if user session exists
        if (!req.session.user || !req.session.access_token) {
            return redirectToLogin(req, res);
        }

        // Verify token with backend
        try {
            const response = await axios.get(`${process.env.API_BASE_URL}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${req.session.access_token}`
                }
            });

            if (response.data.success) {
                // Update user data in session
                req.user = response.data.data;
                req.session.user = response.data.data;
                return next();
            }
        } catch (tokenError) {
            // Token might be expired, try to refresh
            if (tokenError.response?.status === 401) {
                const refreshSuccess = await tryRefreshToken(req, res);
                if (refreshSuccess) {
                    return next();
                }
            }
            
            console.error('Token verification failed:', tokenError.message);
            return redirectToLogin(req, res);
        }

    } catch (error) {
        console.error('Authentication middleware error:', error);
        return redirectToLogin(req, res);
    }
};

/**
 * Middleware to check if user has required role
 * Usage: requireRole(['admin', 'super_admin'])
 */
const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return redirectToLogin(req, res);
        }

        if (!allowedRoles.includes(req.user.role)) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/dashboard');
        }

        next();
    };
};

/**
 * Middleware to check if user is guest (not authenticated)
 * Redirects authenticated users to dashboard
 */
const requireGuest = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};

/**
 * Middleware to attach user data to all requests
 * Makes user available in templates
 */
const attachUser = async (req, res, next) => {
    try {
        if (req.session.user && req.session.access_token) {
            // Try to get fresh user data
            try {
                const response = await axios.get(`${process.env.API_BASE_URL}/api/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${req.session.access_token}`
                    }
                });

                if (response.data.success) {
                    req.user = response.data.data;
                    res.locals.user = response.data.data;
                    res.locals.isAuthenticated = true;
                } else {
                    req.user = null;
                    res.locals.user = null;
                    res.locals.isAuthenticated = false;
                }
            } catch (error) {
                // If token verification fails, clear session
                if (error.response?.status === 401) {
                    req.session.destroy(() => {});
                }
                req.user = null;
                res.locals.user = null;
                res.locals.isAuthenticated = false;
            }
        } else {
            req.user = null;
            res.locals.user = null;
            res.locals.isAuthenticated = false;
        }

        next();
    } catch (error) {
        console.error('Attach user middleware error:', error);
        req.user = null;
        res.locals.user = null;
        res.locals.isAuthenticated = false;
        next();
    }
};

/**
 * Try to refresh access token using refresh token
 */
const tryRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        
        if (!refreshToken) {
            return false;
        }

        const response = await axios.post(`${process.env.API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
        });

        if (response.data.success) {
            const { access_token, refresh_token: newRefreshToken } = response.data.data;
            
            // Update session with new tokens
            req.session.access_token = access_token;
            
            // Update refresh token cookie
            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return true;
        }

        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
};

/**
 * Redirect user to login page with return URL
 */
const redirectToLogin = (req, res) => {
    // Clear any existing session
    req.session.destroy(() => {});
    
    // Clear cookies
    res.clearCookie('refresh_token');
    
    // Store return URL for redirect after login
    const returnUrl = req.originalUrl;
    const loginUrl = returnUrl !== '/auth/login' 
        ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : '/auth/login';
    
    req.flash('error', 'Please log in to access this page.');
    return res.redirect(loginUrl);
};

/**
 * Middleware for premium features
 * Checks if user has premium access
 */
const requirePremium = (req, res, next) => {
    if (!req.user) {
        return redirectToLogin(req, res);
    }

    const premiumRoles = ['premium_student', 'premium_user', 'admin', 'super_admin'];
    
    if (!premiumRoles.includes(req.user.role)) {
        req.flash('error', 'This feature requires a premium subscription.');
        return res.redirect('/pricing');
    }

    next();
};

/**
 * Rate limiting middleware for sensitive operations
 */
const sensitiveOperationLimit = (maxAttempts = 5, windowMinutes = 15) => {
    const attempts = new Map();
    
    return (req, res, next) => {
        const key = req.ip + (req.user?.id || '');
        const now = Date.now();
        const windowMs = windowMinutes * 60 * 1000;
        
        // Clean old attempts
        const userAttempts = attempts.get(key) || [];
        const recentAttempts = userAttempts.filter(time => now - time < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
            req.flash('error', `Too many attempts. Please try again in ${windowMinutes} minutes.`);
            return res.redirect('back');
        }
        
        // Record this attempt
        recentAttempts.push(now);
        attempts.set(key, recentAttempts);
        
        next();
    };
};

/**
 * Middleware to ensure email is verified
 */
const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        return redirectToLogin(req, res);
    }

    if (!req.user.email_verified) {
        req.flash('warning', 'Please verify your email address to access this feature.');
        return res.redirect('/profile/verify-email');
    }

    next();
};

/**
 * Admin middleware - requires admin or super_admin role
 */
const requireAdmin = requireRole(['admin', 'super_admin']);

/**
 * Super admin middleware - requires super_admin role only
 */
const requireSuperAdmin = requireRole(['super_admin']);

module.exports = {
    requireAuth,
    requireRole,
    requireGuest,
    attachUser,
    requirePremium,
    requireAdmin,
    requireSuperAdmin,
    requireEmailVerification,
    sensitiveOperationLimit
};