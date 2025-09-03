// Frontend Route - Homepage and General Pages
// Express.js router for main website pages

const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET / - Homepage
router.get('/', async (req, res) => {
    try {
        // Fetch featured coaches and recent blog posts for homepage
        const [coachesResponse, blogResponse] = await Promise.all([
            axios.get(`${process.env.API_BASE_URL}/api/coaches?featured=true&limit=4`).catch(() => null),
            axios.get(`${process.env.API_BASE_URL}/api/blog?featured=true&limit=3`).catch(() => null)
        ]);

        const featuredCoaches = coachesResponse?.data?.data || [];
        const recentBlogs = blogResponse?.data?.data || [];

        res.render('pages/home', {
            title: 'SSB Coach 1A - Advanced Defence Interview Preparation',
            page: 'home',
            featuredCoaches,
            recentBlogs,
            stats: {
                totalStudents: 5000,
                successRate: 87,
                expertCoaches: 12,
                practiceTests: 50
            }
        });
    } catch (error) {
        console.error('Homepage error:', error);
        res.render('pages/home', {
            title: 'SSB Coach 1A - Advanced Defence Interview Preparation',
            page: 'home',
            featuredCoaches: [],
            recentBlogs: [],
            stats: {
                totalStudents: 5000,
                successRate: 87,
                expertCoaches: 12,
                practiceTests: 50
            }
        });
    }
});

// GET /about - About Us page
router.get('/about', (req, res) => {
    res.render('pages/about', {
        title: 'About Us - SSB Coach 1A',
        page: 'about'
    });
});

// GET /features - Features page
router.get('/features', (req, res) => {
    res.render('pages/features', {
        title: 'Features - SSB Coach 1A',
        page: 'features',
        features: [
            {
                name: 'AI-Powered Analysis',
                description: 'Get intelligent feedback on your test performance',
                icon: 'fas fa-brain'
            },
            {
                name: 'Expert Coaches',
                description: 'Learn from retired defence officers',
                icon: 'fas fa-user-tie'
            },
            {
                name: 'Practice Tests',
                description: 'Comprehensive test series for all SSB components',
                icon: 'fas fa-clipboard-check'
            },
            {
                name: 'Real-time Analytics',
                description: 'Track your progress with detailed analytics',
                icon: 'fas fa-chart-line'
            },
            {
                name: 'Gamification',
                description: 'Earn points, badges, and compete with peers',
                icon: 'fas fa-trophy'
            },
            {
                name: 'Mobile Responsive',
                description: 'Learn anywhere, anytime on any device',
                icon: 'fas fa-mobile-alt'
            }
        ]
    });
});

// GET /pricing - Pricing page
router.get('/pricing', (req, res) => {
    res.render('pages/pricing', {
        title: 'Pricing - SSB Coach 1A',
        page: 'pricing',
        plans: [
            {
                name: 'Basic',
                price: 0,
                period: 'Forever',
                description: 'Perfect for getting started with SSB preparation',
                features: [
                    '5 Practice Tests',
                    'Basic Analytics',
                    'Community Support',
                    'Mobile Access'
                ],
                buttonText: 'Get Started Free',
                buttonClass: 'btn-outline-primary',
                popular: false
            },
            {
                name: 'Premium',
                price: 999,
                period: 'month',
                description: 'Complete preparation package with AI features',
                features: [
                    'Unlimited Practice Tests',
                    'AI-Powered Analysis',
                    'Expert Coach Sessions',
                    'Advanced Analytics',
                    'Progress Tracking',
                    'Gamification',
                    'Priority Support'
                ],
                buttonText: 'Start Premium',
                buttonClass: 'btn-primary',
                popular: true
            },
            {
                name: 'Enterprise',
                price: 2999,
                period: 'month',
                description: 'For coaching institutes and bulk users',
                features: [
                    'Everything in Premium',
                    'Multi-user Management',
                    'Custom Branding',
                    'Advanced Reporting',
                    'API Access',
                    'Dedicated Support',
                    'Custom Features'
                ],
                buttonText: 'Contact Sales',
                buttonClass: 'btn-outline-primary',
                popular: false
            }
        ]
    });
});

// GET /contact - Contact Us page
router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us - SSB Coach 1A',
        page: 'contact',
        errors: [],
        formData: {},
        contactInfo: {
            address: '123 Defence Colony, New Delhi - 110024',
            phone: '+91-11-4567-8901',
            email: 'info@ssbcoach1a.com',
            hours: 'Mon-Sat: 9:00 AM - 6:00 PM'
        }
    });
});

// POST /contact - Handle contact form
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // Validate required fields
        const errors = [];
        if (!name || name.trim().length < 2) {
            errors.push({ msg: 'Name must be at least 2 characters long' });
        }
        if (!email || !email.includes('@')) {
            errors.push({ msg: 'Please enter a valid email address' });
        }
        if (!message || message.trim().length < 10) {
            errors.push({ msg: 'Message must be at least 10 characters long' });
        }

        if (errors.length > 0) {
            return res.render('pages/contact', {
                title: 'Contact Us - SSB Coach 1A',
                page: 'contact',
                errors,
                formData: req.body,
                contactInfo: {
                    address: '123 Defence Colony, New Delhi - 110024',
                    phone: '+91-11-4567-8901',
                    email: 'info@ssbcoach1a.com',
                    hours: 'Mon-Sat: 9:00 AM - 6:00 PM'
                }
            });
        }

        // Send contact form data to backend API
        await axios.post(`${process.env.API_BASE_URL}/api/contact`, {
            name: name.trim(),
            email: email.trim(),
            phone: phone?.trim(),
            subject: subject?.trim() || 'General Inquiry',
            message: message.trim()
        });

        req.flash('success', 'Thank you for your message! We will get back to you soon.');
        res.redirect('/contact');

    } catch (error) {
        console.error('Contact form error:', error);
        req.flash('error', 'Failed to send message. Please try again later.');
        res.render('pages/contact', {
            title: 'Contact Us - SSB Coach 1A',
            page: 'contact',
            errors: [],
            formData: req.body,
            contactInfo: {
                address: '123 Defence Colony, New Delhi - 110024',
                phone: '+91-11-4567-8901',
                email: 'info@ssbcoach1a.com',
                hours: 'Mon-Sat: 9:00 AM - 6:00 PM'
            }
        });
    }
});

// GET /privacy - Privacy Policy page
router.get('/privacy', (req, res) => {
    res.render('pages/privacy', {
        title: 'Privacy Policy - SSB Coach 1A',
        page: 'privacy'
    });
});

// GET /terms - Terms of Service page
router.get('/terms', (req, res) => {
    res.render('pages/terms', {
        title: 'Terms of Service - SSB Coach 1A',
        page: 'terms'
    });
});

// GET /faq - Frequently Asked Questions
router.get('/faq', (req, res) => {
    const faqs = [
        {
            question: 'What is SSB Coach 1A?',
            answer: 'SSB Coach 1A is a comprehensive online platform for preparing for Services Selection Board (SSB) interviews for Indian Armed Forces. We provide AI-powered analysis, expert coaching, and extensive practice tests.'
        },
        {
            question: 'How does the AI analysis work?',
            answer: 'Our AI system analyzes your test responses, identifies patterns in your answers, and provides personalized feedback to help improve your performance in OIR, PPDT, Psychology tests, and GTO tasks.'
        },
        {
            question: 'Who are the coaches?',
            answer: 'Our coaches are retired officers from Indian Army, Navy, and Air Force with extensive experience in SSB interviews. They have successfully trained thousands of candidates.'
        },
        {
            question: 'Is there a free trial available?',
            answer: 'Yes! We offer a free plan that includes 5 practice tests, basic analytics, and community support. You can upgrade to premium anytime for full access.'
        },
        {
            question: 'Can I access the platform on mobile?',
            answer: 'Absolutely! Our platform is fully responsive and works seamlessly on all devices - desktop, tablet, and mobile phones.'
        }
    ];

    res.render('pages/faq', {
        title: 'FAQ - SSB Coach 1A',
        page: 'faq',
        faqs
    });
});

// GET /sitemap - Site map
router.get('/sitemap', (req, res) => {
    const pages = [
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
        { name: 'Features', url: '/features' },
        { name: 'Pricing', url: '/pricing' },
        { name: 'Tests', url: '/tests' },
        { name: 'Coaches', url: '/coaches' },
        { name: 'Centers', url: '/centers' },
        { name: 'Blog', url: '/blog' },
        { name: 'Contact', url: '/contact' },
        { name: 'Login', url: '/auth/login' },
        { name: 'Register', url: '/auth/register' },
        { name: 'Dashboard', url: '/dashboard' },
        { name: 'Profile', url: '/profile' }
    ];

    res.render('pages/sitemap', {
        title: 'Site Map - SSB Coach 1A',
        page: 'sitemap',
        pages
    });
});

module.exports = router;