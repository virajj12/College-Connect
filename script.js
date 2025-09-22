const authSection = document.getElementById('authSection');
const studentDashboard = document.getElementById('studentDashboard');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const switchText = document.getElementById('switchText');
const switchLink = document.getElementById('switchLink');
const notificationForm = document.getElementById('notificationForm');
const notificationList = document.getElementById('notificationList');
const eventsList = document.getElementById('eventsList');
const examsList = document.getElementById('examsList');
const adminNotificationList = document.getElementById('adminNotificationList');
const notificationModal = document.getElementById('notificationModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalContent = document.getElementById('modalContent');
const modalMeta = document.getElementById('modalMeta');
const overlay = document.getElementById('overlay');
const sortSelect = document.getElementById('sortSelect');

const dropArea = document.getElementById('dropArea');
// Updated: Use a new input for PDFs and a different one for images
const fileInput = document.getElementById('notificationFile'); // This will handle both images and PDFs
const imagePreview = document.getElementById('imagePreview');

// Predefined users for demonstration
const initialUsers = {
    'student@college.edu': { password: 'password', role: 'student', branch: 'CSE', year: '3' },
    'admin@college.edu': { password: 'password', role: 'admin' }
};

// Load data from localStorage or use initial data
let users = JSON.parse(localStorage.getItem('users')) || initialUsers;
let allNotifications = JSON.parse(localStorage.getItem('notifications')) || [];

// Save initial data to localStorage if it doesn't exist
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(initialUsers));
}

// Add some sample data
if (!localStorage.getItem('notifications')) {
    allNotifications = [
        {
            id: 1,
            title: 'Welcome to College Connect',
            content: 'This is the college notification system. Stay updated with all events and announcements.',
            type: 'general',
            audience: 'college',
            date: new Date().toLocaleDateString('en-US'),
            file: { type: 'image', data: 'https://placehold.co/600x300/cccccc/white', alt: 'Illustration of connected college students collaborating on a project with digital screens' }
        },
        {
            id: 2,
            title: 'Technical Fest 2024',
            content: 'Annual technical fest will be held on December 15-17. Register now!',
            type: 'event',
            audience: 'college',
            date: new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-US'),
            file: { type: 'image', data: 'https://placehold.co/600x300/5c8fff/white', alt: 'Vibrant poster for technical festival with abstract circuit board and technology icons' }
        },
        {
            id: 3,
            title: 'End Semester Exams',
            content: 'Semester exams schedule has been announced. Check your department notice board.',
            type: 'exam',
            audience: 'college',
            date: new Date(Date.now() + 86400000 * 10).toLocaleDateString('en-US'),
            file: { type: 'image', data: 'https://placehold.co/600x300/ff6b6b/white', alt: 'Calendar view showing examination dates with book stacks and pencils in background' }
        },
        {
            id: 4,
            title: 'CSE Workshop on AI',
            content: 'Workshop on Artificial Intelligence for CSE students on November 30th.',
            type: 'event',
            audience: 'CSE',
            date: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US'),
            file: { type: 'image', data: 'https://placehold.co/600x300/4ecdc4/white', alt: 'Workshop scene with presentation screen showing AI code and attendees taking notes' }
        },
        {
            id: 5,
            title: 'New Student Handbook',
            content: 'The updated student handbook for 2024-2025 is now available.',
            type: 'general',
            audience: 'college',
            date: new Date().toLocaleDateString('en-US'),
            file: { type: 'pdf', data: 'assets/sample.pdf' }
        }
    ];
    localStorage.setItem('notifications', JSON.stringify(allNotifications));
}

document.addEventListener('DOMContentLoaded', () => {
    renderDashboards();
    sortSelect.addEventListener('change', () => {
        filterNotifications('all', document.querySelector('.filter-btn.active'));
    });
});

function renderDashboards() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        authSection.style.display = 'none';
        if (currentUser.role === 'student') {
            studentDashboard.style.display = 'block';
            setTimeout(() => studentDashboard.classList.add('visible'), 10);
            showSection('notifications');
        } else if (currentUser.role === 'admin') {
            adminDashboard.style.display = 'block';
            setTimeout(() => adminDashboard.classList.add('visible'), 10);
            showAdminSection('create');
        }
    } else {
        authSection.style.display = 'flex';
        studentDashboard.style.display = 'none';
        adminDashboard.style.display = 'none';
        authSection.classList.remove('fade-out');
    }
}

function toggleAuthForm() {
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    if (loginForm.classList.contains('hidden')) {
        switchText.textContent = 'Already have an account? ';
        switchLink.textContent = 'Sign in';
    } else {
        switchText.textContent = "Don't have an account? ";
        switchLink.textContent = 'Sign up';
    }
}

function showForgotPassword() {
    forgotPasswordModal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeModal() {
    forgotPasswordModal.style.display = 'none';
    overlay.style.display = 'none';
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (users[email] && users[email].password === password) {
        const user = users[email];
        localStorage.setItem('currentUser', JSON.stringify({ email: email, role: user.role, branch: user.branch }));

        authSection.classList.add('fade-out');
        authSection.addEventListener('transitionend', () => {
            renderDashboards();
        }, { once: true });
    } else {
        alert('Invalid email or password.');
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const branch = document.getElementById('registerBranch').value;
    const year = document.getElementById('registerYear').value;
    const role = document.getElementById('registerRole').value;

    if (users[email]) {
        alert('An account with this email already exists.');
        return;
    }

    const newUser = {
        password: password,
        role: role,
        branch: branch,
        year: year
    };
    users[email] = newUser;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created successfully! You can now sign in.');
    toggleAuthForm();
});

forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    
    // Check if a backend URL is available
    if (!BACKEND_URL) {
        alert('This is a demo. Email functionality requires a server.');
        closeModal();
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // e.g., "If an account with this email exists, a reset link has been sent."
        } else {
            alert(result.error || 'An error occurred. Please try again.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Could not connect to the server. Please try again later.');
    }
    
    closeModal();
});

// Drag and drop event listeners
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('highlight');
});

dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('highlight');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('highlight');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFile(files[0]);
    }
});

// Click to upload
dropArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

// Updated: handleFile now checks for PDF or image
function handleFile(file) {
    // Clear previous state
    imagePreview.style.display = 'none';
    notificationForm.dataset.fileType = '';
    notificationForm.dataset.fileData = '';

    const dropText = dropArea.querySelector('.drop-text');

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
            dropText.textContent = file.name;
            notificationForm.dataset.fileType = 'image';
            notificationForm.dataset.fileData = event.target.result;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        dropText.textContent = file.name;
        notificationForm.dataset.fileType = 'pdf';
        // Use a simple data URI for a PDF, or you could read it as base64
        // For a full-scale app, you'd upload this to a server
        const reader = new FileReader();
        reader.onload = (event) => {
            notificationForm.dataset.fileData = event.target.result;
        };
        reader.readAsDataURL(file);
        
    } else {
        alert('Please upload a valid image or PDF file.');
        fileInput.value = '';
        dropText.textContent = 'Drag & drop image or PDF here, or click to browse';
    }
}

notificationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('notificationTitle').value;
    const content = document.getElementById('notificationContent').value;
    const type = document.getElementById('notificationType').value;
    const audience = document.getElementById('notificationAudience').value;

    const fileType = notificationForm.dataset.fileType || null;
    const fileData = notificationForm.dataset.fileData || null;

    const newNotification = {
        id: Date.now(),
        title,
        content,
        type,
        audience,
        date: new Date().toLocaleDateString('en-US'),
        file: fileData ? { type: fileType, data: fileData, alt: title ? `${title} related visual content` : null } : null
    };

    allNotifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(allNotifications));

    renderAdminNotifications();
    updateAnalytics();
    notificationForm.reset();
    imagePreview.style.display = 'none';
    const dropText = dropArea.querySelector('.drop-text');
    dropText.textContent = 'Drag & drop image or PDF here, or click to browse';
});

// Updated: Render function now handles different file types
function renderNotifications(notifications) {
    notificationList.innerHTML = '';

    if (notifications.length === 0) {
        notificationList.innerHTML = '<li class="empty-state">No notifications found</li>';
        return;
    }

    notifications.forEach(note => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        li.onclick = () => openNotificationModal(note);
        let fileHtml = '';
        if (note.file) {
            if (note.file.type === 'image') {
                fileHtml = `<img src="${note.file.data}" alt="${note.file.alt || 'Notification image'}" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            } else if (note.file.type === 'pdf') {
                fileHtml = `<img src="https://via.placeholder.com/50/FF5733/FFFFFF?text=PDF" alt="PDF icon" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            }
        }
        li.innerHTML = `
            ${fileHtml}
            <div class="notification-header">
                <span class="notification-title">${note.title}</span>
                <span class="notification-meta">${note.date}</span>
            </div>
            <p class="notification-content">${note.content}</p>
        `;
        notificationList.appendChild(li);
    });
}

// Updated: Render events and exams with new file handling
function renderEvents(events) {
    eventsList.innerHTML = '';
    if (events.length === 0) {
        eventsList.innerHTML = '<li class="empty-state">No upcoming events</li>';
        return;
    }
    events.forEach(event => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        li.onclick = () => openNotificationModal(event);
        let fileHtml = '';
        if (event.file) {
            if (event.file.type === 'image') {
                fileHtml = `<img src="${event.file.data}" alt="${event.file.alt || 'Event image'}" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            } else if (event.file.type === 'pdf') {
                fileHtml = `<img src="https://via.placeholder.com/50/FF5733/FFFFFF?text=PDF" alt="PDF icon" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            }
        }
        li.innerHTML = `
            ${fileHtml}
            <div class="notification-header">
                <span class="notification-title">${event.title}</span>
                <span class="notification-meta">${event.date}</span>
            </div>
            <p class="notification-content">${event.content}</p>
        `;
        eventsList.appendChild(li);
    });
}

function renderExams(exams) {
    examsList.innerHTML = '';
    if (exams.length === 0) {
        examsList.innerHTML = '<li class="empty-state">No exam schedule available</li>';
        return;
    }
    exams.forEach(exam => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        li.onclick = () => openNotificationModal(exam);
        let fileHtml = '';
        if (exam.file) {
            if (exam.file.type === 'image') {
                fileHtml = `<img src="${exam.file.data}" alt="${exam.file.alt || 'Exam image'}" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            } else if (exam.file.type === 'pdf') {
                fileHtml = `<img src="https://via.placeholder.com/50/FF5733/FFFFFF?text=PDF" alt="PDF icon" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            }
        }
        li.innerHTML = `
            ${fileHtml}
            <div class="notification-header">
                <span class="notification-title">${exam.title}</span>
                <span class="notification-meta">${exam.date}</span>
            </div>
            <p class="notification-content">${exam.content}</p>
        `;
        examsList.appendChild(li);
    });
}

// Updated: Modal now displays image or PDF link
function openNotificationModal(note) {
    modalTitle.textContent = note.title;
    modalContent.textContent = note.content;
    modalMeta.textContent = `Date: ${note.date} | Type: ${note.type}`;

    if (note.file) {
        if (note.file.type === 'image') {
            modalImage.src = note.file.data;
            modalImage.alt = note.file.alt || `${note.title} image`;
            modalImage.style.display = 'block';
            // Hide any PDF link
            const pdfLink = document.getElementById('modalPdfLink');
            if (pdfLink) pdfLink.style.display = 'none';
        } else if (note.file.type === 'pdf') {
            // Hide the image
            modalImage.style.display = 'none';
            // Create or update a link for the PDF
            let pdfLink = document.getElementById('modalPdfLink');
            if (!pdfLink) {
                pdfLink = document.createElement('a');
                pdfLink.id = 'modalPdfLink';
                pdfLink.target = '_blank';
                pdfLink.className = 'btn btn-primary mt-3';
                pdfLink.textContent = 'View PDF File';
                modalContent.parentNode.insertBefore(pdfLink, modalContent.nextSibling);
            }
            pdfLink.href = note.file.data;
            pdfLink.style.display = 'block';
        }
    } else {
        modalImage.style.display = 'none';
        const pdfLink = document.getElementById('modalPdfLink');
        if (pdfLink) pdfLink.style.display = 'none';
    }

    notificationModal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeNotificationModal() {
    notificationModal.style.display = 'none';
    overlay.style.display = 'none';
}

function filterNotifications(audience, button) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userDetails = users[currentUser.email];

    const allBtns = document.querySelectorAll('.filter-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    let filtered = [...allNotifications];

    if (audience !== 'all') {
        filtered = filtered.filter(n => n.audience === audience || n.audience === 'college');
    } else {
        filtered = filtered.filter(n => n.audience === 'college' || n.audience === userDetails.branch);
    }

    filtered = filtered.filter(n => n.type === 'general' || n.type === 'circular' || n.type === 'event' || n.type === 'exam');

    filtered = sortNotifications(filtered, sortSelect.value);

    renderNotifications(filtered);
}

function sortNotifications(notifications, sortBy) {
    return notifications.slice().sort((a, b) => {
        if (sortBy === 'date-desc') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'date-asc') {
            return new Date(a.date) - new Date(a.date);
        } else if (sortBy === 'title') {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });
}

// Updated: Admin view also handles new file types
function renderAdminNotifications() {
    adminNotificationList.innerHTML = '';

    if (allNotifications.length === 0) {
        adminNotificationList.innerHTML = '<li class="empty-state">No notifications created yet</li>';
        return;
    }

    allNotifications.forEach(note => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        li.onclick = () => openNotificationModal(note);
        let fileHtml = '';
        if (note.file) {
            if (note.file.type === 'image') {
                fileHtml = `<img src="${note.file.data}" alt="${note.file.alt || 'Notification image'}" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            } else if (note.file.type === 'pdf') {
                fileHtml = `<img src="https://via.placeholder.com/50/FF5733/FFFFFF?text=PDF" alt="PDF icon" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            }
        }
        li.innerHTML = `
            ${fileHtml}
            <div class="notification-header">
                <span class="notification-title">${note.title}</span>
                <span class="notification-meta">Audience: ${note.audience.toUpperCase()} | Type: ${note.type}</span>
            </div>
            <p class="notification-content">${note.content}</p>
            <button class="btn btn-danger" onclick="deleteNotification(${note.id}, event)">Delete</button>
        `;
        adminNotificationList.appendChild(li);
    });
}

function deleteNotification(id, event) {
    event.stopPropagation();
    allNotifications = allNotifications.filter(note => note.id !== id);
    localStorage.setItem('notifications', JSON.stringify(allNotifications));
    renderAdminNotifications();
    updateAnalytics();
}

function updateAnalytics() {
    document.getElementById('totalNotifications').textContent = allNotifications.length;
    document.getElementById('totalEvents').textContent = allNotifications.filter(n => n.type === 'event').length;
    document.getElementById('totalExams').textContent = allNotifications.filter(n => n.type === 'exam').length;
}

function showSection(sectionId) {
    // Hide all sections first
    document.getElementById('notificationsSection').classList.add('hidden');
    document.getElementById('eventsSection').classList.add('hidden');
    document.getElementById('examsSection').classList.add('hidden');

    // Show the selected section
    document.getElementById(sectionId + 'Section').classList.remove('hidden');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'student') {
        const userDetails = users[currentUser.email];
        if (userDetails) {
            if (sectionId === 'notifications') {
                const filteredNotifications = allNotifications.filter(n => (n.audience === 'college' || n.audience === userDetails.branch) && (n.type === 'general' || n.type === 'circular' || n.type === 'event' || n.type === 'exam'));
                const sorted = sortNotifications(filteredNotifications, sortSelect.value);
                renderNotifications(sorted);
            } else if (sectionId === 'events') {
                const filteredEvents = allNotifications.filter(n => (n.audience === 'college' || n.audience === userDetails.branch) && n.type === 'event');
                renderEvents(filteredEvents);
            } else if (sectionId === 'exams') {
                const filteredExams = allNotifications.filter(n => (n.audience === 'college' || n.audience === userDetails.branch) && n.type === 'exam');
                renderExams(filteredExams);
            }
        }
    }
}

function showAdminSection(sectionId) {
    document.getElementById('createSection').classList.add('hidden');
    document.getElementById('manageSection').classList.add('hidden');
    document.getElementById('analyticsSection').classList.add('hidden');

    document.getElementById(sectionId + 'Section').classList.remove('hidden');

    if (sectionId === 'manage') {
        renderAdminNotifications();
    } else if (sectionId === 'analytics') {
        updateAnalytics();
    }
}

function logout() {
    const currentDashboard = studentDashboard.style.display === 'block' ? studentDashboard : adminDashboard;

    // Trigger fade-out on current dashboard
    currentDashboard.classList.remove('visible');
    currentDashboard.classList.add('fade-out');

    // Wait for the transition to finish before changing display
    currentDashboard.addEventListener('transitionend', () => {
        localStorage.removeItem('currentUser');
        currentDashboard.style.display = 'none';
        currentDashboard.classList.remove('fade-out');
        renderDashboards();
    }, { once: true });
}

// Close modals on overlay click
overlay.addEventListener('click', () => {
    closeNotificationModal();
    closeModal();
});
