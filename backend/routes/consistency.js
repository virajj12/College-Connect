// backend/routes/consistency.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Utility to get today's date in YYYY-MM-DD string format (Local time)
const getTodayString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset*60*1000));
    return localDate.toISOString().split('T')[0];
};

// @route   GET api/consistency/tasks
// @desc    Get all tasks for current user with completion status for today
router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        const today = getTodayString();

        const tasksWithStatus = tasks.map(task => ({
            _id: task._id,
            title: task.title,
            isCompletedToday: task.completions.includes(today)
        }));

        res.json(tasksWithStatus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/consistency/tasks
// @desc    Create a new habit/task
router.post('/tasks', auth, async (req, res) => {
    try {
        const newTask = new Task({
            user: req.user.id,
            title: req.body.title,
            completions: []
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/consistency/tasks/:id/toggle
// @desc    Toggle completion for today
router.put('/tasks/:id/toggle', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        const today = getTodayString();
        const index = task.completions.indexOf(today);

        if (index === -1) {
            // Not done yet, so mark as done
            task.completions.push(today);
        } else {
            // Already done, so uncheck it
            task.completions.splice(index, 1);
        }

        await task.save();
        res.json({ isCompletedToday: index === -1 }); 

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/consistency/tasks/:id
// @desc    Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await task.deleteOne();
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/consistency/heatmap
// @desc    Get aggregated data for the Github-style graph
router.get('/heatmap', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        
        // Aggregate all completions into a single map: Date -> Count
        const heatmapData = {};

        tasks.forEach(task => {
            task.completions.forEach(dateStr => {
                if (heatmapData[dateStr]) {
                    heatmapData[dateStr]++;
                } else {
                    heatmapData[dateStr] = 1;
                }
            });
        });

        res.json(heatmapData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;