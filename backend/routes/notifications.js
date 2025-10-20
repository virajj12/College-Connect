// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth'); // Middleware for token verification

// Middleware to restrict access to Admin
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied: Admin only' });
    }
    next();
};

// @route   GET api/notifications
// @desc    Student: Get filtered notifications
router.get('/', auth, async (req, res) => {
    try {
        const userBranch = req.user.branch;
        const audienceFilter = ['college', userBranch];
        const typeFilter = req.query.type; // general, event, exam, circular, or 'all'

        let query = { audience: { $in: audienceFilter } };

        if (typeFilter && typeFilter !== 'all') {
            query.type = typeFilter;
        } else if (typeFilter === 'general') {
            // General section should also include circulars
            query.type = { $in: ['general', 'circular'] };
        }
        
        const notifications = await Notification.find(query).sort({ date: -1 });
        res.json(notifications);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/notifications
// @desc    Admin: Create a new notification
router.post('/', [auth, adminAuth], async (req, res) => {
    const { title, content, type, audience, image } = req.body;

    try {
        const newNotification = new Notification({
            title,
            content,
            type,
            audience,
            image // Base64 string is stored directly
        });

        const notification = await newNotification.save();
        res.json(notification);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/notifications/manage
// @desc    Admin: Get all notifications for management
router.get('/manage', [auth, adminAuth], async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ date: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/notifications/:id
// @desc    Admin: Delete a notification
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        await notification.deleteOne();
        res.json({ msg: 'Notification removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/analytics
// @desc    Admin: Get analytics data
router.get('/analytics', [auth, adminAuth], async (req, res) => {
    try {
        const totalNotifications = await Notification.countDocuments();
        const totalEvents = await Notification.countDocuments({ type: 'event' });
        const totalExams = await Notification.countDocuments({ type: 'exam' });

        res.json({ totalNotifications, totalEvents, totalExams });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;