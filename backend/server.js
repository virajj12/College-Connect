const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Core Node.js module for paths

dotenv.config();

const app = express();

const webpush = require('web-push');

// Configure web-push with your keys
webpush.setVapidDetails(
  'mailto:vjvirajjain122005@gmail.com', // Replace with your email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Store subscriptions in memory (For production, save these to your MongoDB database alongside the User model)
let dummyDb = []; 

// Route to save a user's subscription
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  dummyDb.push(subscription);
  res.status(201).json({ message: 'Subscription saved.' });
});

// Example route to trigger a push notification (e.g., when an admin posts a new curriculum update)
router.post('/send-broadcast', (req, res) => {
  const payload = JSON.stringify({
    title: 'New Update Available!',
    body: 'Check the dashboard for the latest curriculum changes.',
    icon: '/favicon.png'
  });

  // Send to all subscribed users
  dummyDb.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error(err));
  });
  
  res.status(200).json({ message: 'Broadcast sent.' });
});

// Trust the first reverse proxy (Render's load balancer).
// This is SAFE and REQUIRED for Render deployments:
// - Ensures req.ip returns the real client IP (not the proxy's IP)
// - Makes express-rate-limit work correctly per-user
// - Sets req.secure correctly for HTTPS detection
// Value of 1 = trust only the first hop (secure). Never use `true`.
app.set('trust proxy', 1);

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
app.use('/api/consistency', require('./routes/consistency'));



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
