// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'event', 'exam', 'circular'],
        required: true
    },
    audience: {
        type: String,
        enum: ['college', 'CSE', 'ECE', 'ME', 'CE', 'EE'],
        required: true
    },
    image: { // Base64 string of the image
        type: String 
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);