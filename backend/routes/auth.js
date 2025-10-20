// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Middleware to verify token

// Helper function to generate token
const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            role: user.role,
            branch: user.branch // Student branch for filtering
        }
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};

// @route   POST api/auth/register
// @desc    Register a new student user
router.post('/register', async (req, res) => {
    const { email, password, branch, year } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, password, branch, year, role: 'student' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const token = generateToken(user);
        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const token = generateToken(user);
        res.json({ token, user: { role: user.role, branch: user.branch } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get user data by token (replaces currentUser localStorage)
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin Setup: Add the predefined admin if not exists (run this once)
router.get('/setup-admin', async (req, res) => {
    try {
        let admin = await User.findOne({ email: 'vjvirajjain1@gmail.com' });
        if (!admin) {
            const newAdmin = new User({ email: 'vjvirajjain1@gmail.com', password: 'vjv@ccadmin.com', role: 'admin' });
            const salt = await bcrypt.genSalt(10);
            newAdmin.password = await bcrypt.hash('password', salt);
            await newAdmin.save();
            return res.json({ msg: 'Admin account created/reset.', admin: newAdmin });
        }
        res.json({ msg: 'Admin already exists.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;