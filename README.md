# College Connect: Unified Notification System

![College Connect OG](OG.png)

## 🌟 Overview

**College Connect** is a robust, full-stack web application designed to serve as a unified platform for colleges to disseminate announcements, notifications, events, and exam schedules. It bridges the gap between administration and students with a secure, role-based dashboard system.

Originally a static prototype, this project has evolved into a fully functional **MERN-style application** (using Vanilla JS on the frontend) backed by a **Node.js/Express** server and a **MongoDB** database.

## 🚀 Live Demo

* **Frontend (GitHub Pages):** [College Connect Live Site](https://virajj12.github.io/College-Connect/)
* **Backend API (Render):** [https://college-connect-pluo.onrender.com](https://college-connect-pluo.onrender.com)

## ✨ Features

### 🔐 Authentication & Security
* **Secure Signup/Login:** Users are authenticated using **JSON Web Tokens (JWT)**.
* **Password Encryption:** All passwords are hashed using **Bcrypt** before storage.
* **Forgot Password:** A secure flow allowing users to request a password reset link (simulated via token generation).

### 🎓 Student Dashboard
* **Personalized Feed:** Notifications are intelligently filtered based on the student's **Branch** (e.g., CSE, ME) and **College-wide** announcements.
* **Categorized Views:** dedicated sections for **General Notifications**, **Events**, and **Exams**.
* **Sorting & Filtering:** Students can filter by department or sort announcements by date and title.
* **Rich Media:** View full details and attached images in a responsive modal.

### 🛡️ Admin Dashboard
* **Content Management:** Create, Read, and Delete notifications.
* **Targeted Publishing:** Admins can send notifications to the entire college or specific branches (CSE, ECE, ME, etc.).
* **Image Handling:** Supports image uploads (processed and stored as Base64 strings).
* **Analytics:** Real-time overview of total notifications, events, and exams published.

## 🛠️ Tech Stack

### Frontend
* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Design:** Custom Glassmorphism UI, Responsive Flexbox/Grid layouts.
* **Connectivity:** Fetch API for asynchronous communication with the backend.

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens) & BcryptJS
* **Utilities:** Dotenv (Environment variables), CORS (Cross-Origin Resource Sharing).

## 🔑 Demo Credentials

To test the application, you can use the following credentials or register a new student account.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | *(Register a new account)* | *(Your choice)* |


## 💻 Running Locally

Follow these steps to get the full stack running on your local machine.

### Prerequisites
* Node.js installed
* MongoDB installed locally or a MongoDB Atlas connection string.

### 1. Clone the Repository
```bash
git clone [https://github.com/virajj12/College-Connect.git](https://github.com/virajj12/College-Connect.git)
cd College-Connect
```

### 2. Backend Setup
* Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```
Start the server:
```bash
npm start
# The server will run on http://localhost:5000
```

### 3. Frontend Setup
* Go back to the root directory.
* Open `script.js`.
* **Important**: Update the `API_BASE_URL` to point to your local server:
```javascript
// Comment out the production URL
// const API_BASE_URL = '[https://college-connect-pluo.onrender.com/api](https://college-connect-pluo.onrender.com/api)';

// Uncomment/Add the local URL
const API_BASE_URL = 'http://localhost:5000/api';
```
Open `index.html` in your browser (or use Live Server in VS Code).

## 📂 Project Structure
```bash
College-Connect/
├── backend/                # Node.js/Express Server
│   ├── models/             # Mongoose Database Models
│   ├── routes/             # API Endpoints (Auth, Notifications)
│   ├── middleware/         # Auth Middleware
│   └── server.js           # Entry point
├── index.html              # Main Frontend Interface
├── style.css               # Global Styling
├── script.js               # Frontend Logic & API Calls
└── README.md               # Project Documentation
```

## 📡 API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
POST | /api/auth/register | Register a new student |
POST | /api/auth/login | Login user and receive JWT |
GET | /api/auth/user | Get current user details |
GET | /api/notifications | Get filtered notifications (Student) |
POST | /api/notifications | Create notification (Admin only) |
DELETE | /api/notifications/:id | Delete notification (Admin only) | 

# Peace out ✌️
