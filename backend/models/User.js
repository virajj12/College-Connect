const mongoose = require('mongoose');
const crypto = require('crypto'); // Core Node.js module

const UserSchema = new new mongoose.Schema({
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
    },
    // --- ADDED FOR PASSWORD RESET ---
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Method to generate and hash the password token (used by /forgot-password)
UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash the token and set to resetPasswordToken field (for storage in DB)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token expiration to 1 hour
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    // Return the plain-text token (for the email link)
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
