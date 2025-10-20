// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    branch: {
        type: String,
        enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'NA'], // 'NA' for Admin
        default: 'NA'
    },
    year: {
        type: String
    }
});

module.exports = mongoose.model('User', UserSchema);