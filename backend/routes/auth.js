const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../emailService');

// Rate limiters for brute-force protection
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { msg: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { msg: 'Too many registration attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

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

// Email sending is now handled by ../emailService.js
// Uses Nodemailer + Gmail SMTP in production, console.log in dev

// @route   POST api/auth/register
// @desc    Register a new student user
router.post('/register', registerLimiter, async (req, res) => {
    const { name, email, password, branch, year } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ name, email, password, branch, year, role: 'student' });

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
router.post('/login', loginLimiter, async (req, res) => {
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
    let user;
    try {
        user = await User.findOne({ email });

        if (!user) {
            // Always return 200 to prevent email enumeration
            return res.status(200).json({
                msg: 'If a user with that email is found, a password reset link has been sent.'
            });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save();

        await sendPasswordResetEmail(user, resetToken);

        res.json({ msg: 'Password reset link has been sent to your email.' });

    } catch (err) {
        console.error(err.message);
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
        }
        res.status(500).json({ msg: 'Error sending reset email. Please try again.' });
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

// @route   PUT api/auth/change-password
// @desc    Change password for authenticated user
router.put('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ msg: 'Please provide current and new password.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ msg: 'New password must be at least 6 characters.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect.' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password changed successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error.' });
    }
});

// @route   DELETE api/auth/delete-account
// @desc    Delete the authenticated user's account and related data
router.delete('/delete-account', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete user's tasks
        await Task.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ msg: 'Account deleted successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error.' });
    }
});

module.exports = router;
