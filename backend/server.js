const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Core Node.js module for paths
const crypto = require('crypto'); // For password reset logic

dotenv.config();

const app = express();

// Middleware
// Allows parsing of large JSON payloads (for Base64 images)
app.use(express.json({ limit: '50mb' })); 

// --- NEW CORS CONFIGURATION ---
const allowedOrigins = [
    // GitHub Pages (Hosted Frontend Root Domain)
    'https://virajj12.github.io', 
    // Local Development (e.g., VS Code Live Server)
    'http://127.0.0.1:5500', 
    'http://localhost:5500' 
];

const corsOptions = {
    // Dynamically check if the request origin is allowed
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error('CORS Blocked Origin:', origin);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    optionsSuccessStatus: 204 
};

app.use(cors(corsOptions));
// --- END NEW CORS CONFIGURATION ---


// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
connectDB();

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notifications'));


// --- SERVING FRONTEND (Optional, but useful for hosting) ---
// Serve static assets (HTML, CSS, JS, images) from the root directory
// We join __dirname (backend) with '..' (parent directory)
app.use(express.static(path.join(__dirname, '..'))); 

// Serve the index.html file on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// The previous route has been replaced by the above logic.
// app.get('/', (req, res) => res.send('API Running')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
