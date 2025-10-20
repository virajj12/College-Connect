# College Connect: Unified Notification System

## 🌟 Overview

**College Connect** is a responsive, single-page web application designed to serve as a unified platform for colleges to disseminate announcements, notifications, events, and exam schedules to their students. It features role-based authentication, providing a tailored dashboard experience for both students and administrators.

The application is built using a pure HTML, CSS, and Vanilla JavaScript stack, utilizing the browser's `localStorage` for client-side data persistence in this demo environment.

## 🚀 Live Demo

Experience the application live here:

[College Connect Live Site](https://virajj12.github.io/College-Connect/)

## ✨ Features

### Student Dashboard

* **Role-Based Access:** Automatic routing to the student dashboard upon login.
* **Targeted Notifications:** Notifications are filtered to display either **College-wide** announcements or those specifically for the student's registered **Branch** (e.g., CSE).
* **Content Sections:** Dedicated views for **Notifications** (General/Circular), **Events**, and **Exams**.
* **Filtering & Sorting:** Ability to filter notifications by audience (All, CSE, ECE, ME, College-wide) and sort by date or title.
* **Modal View:** Click on any notification to view the full content and any associated image in a clean modal.

### Admin Dashboard

* **Notification Creation:** A dedicated interface to publish new announcements with required fields: Title, Content, Type (General, Event, Exam, Circular), and **Audience** (College-wide or specific branches like CSE, ECE, ME, CE, EE).
* **Image Upload:** Supports image uploads with a **Drag & Drop** area and a file preview.
* **Management:** View all created notifications and a dedicated button to **Delete** outdated entries.
* **Analytics:** A simple dashboard providing an overview of total notifications, total events, and total exams created.

## 🔑 Demo Credentials

To explore the application's full functionality, use the following predefined users:



## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Styling:** Custom CSS with a modern, glassmorphic design and a dark background using `banner.jpg`.
* **Data Storage:** `localStorage` (for demonstration purposes only)

## 💻 Running Locally

To get a local copy up and running, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/virajj12/College-Connect.git](https://github.com/virajj12/College-Connect.git)
    ```
2.  **Navigate to the directory:**
    ```bash
    cd College-Connect
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in your preferred web browser.

No server setup is required, as all logic runs on the client side.

## ⚠️ Important Note on Backend Functionality

Please note that this is a client-side demo. The **Forgot Password** functionality, while implemented with a form and a mock API call, is non-functional in this demo. The script includes an alert stating: `"This is a demo. Email functionality requires a server."`. For production use, a secure backend API would be required to handle user authentication, password reset emails, and persistent database storage.
