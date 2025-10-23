const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth'); 

// Helper function to generate token
const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            role: user.role,
            branch: user.branch 
        }
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};

// Helper function to simulate sending an email 
const sendPasswordResetEmail = (user, resetToken) => {
    // **IMPORTANT:** Update this URL with your actual hosted frontend domain
    const resetURL = `https://virajj12.github.io/reset.html?token=${resetToken}`; 

    console.log(`\n\n======================================================`);
    console.log(`*** PASSWORD RESET TOKEN GENERATED FOR ${user.email} ***`);
    console.log(`*** DEVELOPMENT ONLY: Go to this URL to reset: ${resetURL}`);
    console.log(`======================================================\n`);
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

// @route   POST api/auth/forgot-password (Token Generation)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ 
                msg: 'If a user with that email is found, a password reset link has been sent.' 
            });
        }
        
        const resetToken = user.getResetPasswordToken();
        await user.save();
        
        sendPasswordResetEmail(user, resetToken);

        res.json({ msg: 'Password reset link sent to email (check server console).' });

    } catch (err) {
        console.error(err.message);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(500).send('Server error');
    }
});


// @route   PUT api/auth/reset-password/:token (Password Change)
router.put('/reset-password/:token', async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired reset token.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ msg: 'Password successfully reset. You can now log in.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   GET api/auth/setup-admin
// NOTE: I am using the standard 'password' for the Admin login.
router.get('/setup-admin', async (req, res) => {
    const ADMIN_EMAIL = 'vjvirajjain1@gmail.com'; 
    const ADMIN_PASSWORD = 'password'; 

    try {
        await User.deleteOne({ email: ADMIN_EMAIL });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        const newAdmin = new User({ 
            email: ADMIN_EMAIL, 
            password: hashedPassword, 
            role: 'admin' 
        });
        await newAdmin.save();
        
        res.json({ 
            msg: 'Admin account successfully created/reset.', 
            email: ADMIN_EMAIL,
            login_password: ADMIN_PASSWORD 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during Admin setup');
    }
});

module.exports = router;
