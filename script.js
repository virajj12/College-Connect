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
const fileInput = document.getElementById('notificationImage');
const imagePreview = document.getElementById('imagePreview');

// --- FINAL DEPLOYMENT URL ---
const API_BASE_URL = 'https://college-connect-pluo.onrender.com/api'; // Your Render.com Backend URL

// Helper function to format ISO date string into a readable format
function formatNotificationDate(isoDateString) {
    if (!isoDateString) return 'N/A';
    
    // Create a Date object from the ISO string
    const date = new Date(isoDateString);
    
    // Format it into a readable, localized string (e.g., Oct 23, 2025, 4:36 PM)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderDashboards();
    sortSelect.addEventListener('change', () => {
        filterNotifications('all', document.querySelector('.filter-btn.active'));
    });
});

async function renderDashboards() {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/user`, {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                throw new Error('Token invalid or expired');
            }

            const currentUser = await response.json();
            
            // Store user details (except token) for client-side use
            localStorage.setItem('currentUserDetails', JSON.stringify(currentUser)); 

            authSection.style.display = 'none';
            if (currentUser.role === 'student') {
                studentDashboard.style.display = 'block';
                setTimeout(() => studentDashboard.classList.add('visible'), 10);
                showSection('notifications', currentUser.branch);
            } else if (currentUser.role === 'admin') {
                adminDashboard.style.display = 'block';
                setTimeout(() => adminDashboard.classList.add('visible'), 10);
                showAdminSection('create');
            }
        } catch (error) {
            console.error(error);
            // If token is invalid, clear storage and show auth section
            localStorage.removeItem('token');
            localStorage.removeItem('currentUserDetails');
            authSection.style.display = 'flex';
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

loginForm.addEventListener('submit', async (e) => { 
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            
            authSection.classList.add('fade-out');
            authSection.addEventListener('transitionend', () => {
                renderDashboards();
            }, { once: true });
        } else {
            alert(data.msg || 'Invalid email or password.');
        }
    } catch (error) {
        // This catches network errors (like the "Could not connect" error)
        alert('Could not connect to the server.');
    }
});

registerForm.addEventListener('submit', async (e) => { 
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const branch = document.getElementById('registerBranch').value;
    const year = document.getElementById('registerYear').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, branch, year })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Account created successfully! Please sign in.');
            toggleAuthForm();
        } else {
            alert(data.msg || 'An error occurred during registration.');
        }
    } catch (error) {
        alert('Could not connect to the server.');
    }
});

forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    
    // Check if API URL is available (it is now, as it's a constant)
    if (!API_BASE_URL) {
        alert('API URL is missing.');
        closeModal();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.msg); // Updated to result.msg to match backend response
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

function handleFile(file) {
    if (file.type.startsWith('image/')) {
        const publishButton = document.querySelector('#notificationForm .btn-primary');
        
        // Disable button while loading
        publishButton.disabled = true; 
        publishButton.textContent = 'Loading Image...';

        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
            notificationForm.dataset.image = event.target.result;
            
            // Re-enable button
            publishButton.disabled = false;
            publishButton.textContent = 'Publish Notification'; 
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please upload a valid image file.');
        fileInput.value = '';
        imagePreview.style.display = 'none';
        notificationForm.dataset.image = '';
    }
}

notificationForm.addEventListener('submit', async (e) => { 
    e.preventDefault();
    const title = document.getElementById('notificationTitle').value;
    const content = document.getElementById('notificationContent').value;
    const type = document.getElementById('notificationType').value;
    const audience = document.getElementById('notificationAudience').value;
    const image = notificationForm.dataset.image || null; 

    const token = localStorage.getItem('token');
    if (!token) return logout();

    try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ title, content, type, audience, image })
        });

        if (response.ok) {
            alert('Notification Published Successfully!');
            notificationForm.reset();
            imagePreview.style.display = 'none';
            notificationForm.dataset.image = '';
            
            if (document.getElementById('manageSection').classList.contains('hidden')) {
                 renderAdminNotifications(); 
            }
        } else {
            const error = await response.json();
            alert(`Failed to publish: ${error.msg}`);
        }
    } catch (error) {
        alert('Network error. Check backend server.');
    }
});

async function fetchNotifications(type, audience = null) {
    const token = localStorage.getItem('token');
    if (!token) return logout();

    let url = `${API_BASE_URL}/notifications?type=${type}`;
    if (audience && audience !== 'all') {
        url += `&audience=${audience}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'x-auth-token': token
            }
        });

        if (response.ok) {
            let notifications = await response.json();
            
            notifications = sortNotifications(notifications, sortSelect.value);
            
            return notifications;
        } else {
            alert('Failed to load notifications. Session expired. Please log in.');
            logout();
            return [];
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('Network error. Check server connection.');
        return [];
    }
}

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
        let imageHtml = '';
        if (note.image) {
            imageHtml = `<img src="${note.image}" alt="${note.imageAlt || 'Notification image'}" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
        }
        li.innerHTML = `
            ${imageHtml}
            <div class="notification-header">
                <span class="notification-title">${note.title}</span>
                <span class="notification-meta">${formatNotificationDate(note.date)}</span>
            </div>
            <p class="notification-content">${note.content}</p>
        `;
        notificationList.appendChild(li);
    });
}

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
        let imageHtml = '';
        if (event.image) {
            imageHtml = `<img src="${event.image}" alt="${event.imageAlt || 'Event image'}" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
        }
        li.innerHTML = `
            ${imageHtml}
            <div class="notification-header">
                <span class="notification-title">${event.title}</span>
                <span class="notification-meta">${formatNotificationDate(event.date)}</span>
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
        let imageHtml = '';
        if (exam.image) {
            imageHtml = `<img src="${exam.image}" alt="${exam.imageAlt || 'Exam image'}" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
        }
        li.innerHTML = `
            ${imageHtml}
            <div class="notification-header">
                <span class="notification-title">${exam.title}</span>
                <span class="notification-meta">${formatNotificationDate(exam.date)}</span>
            </div>
            <p class="notification-content">${exam.content}</p>
        `;
        examsList.appendChild(li);
    });
}

function openNotificationModal(note) {
    modalTitle.textContent = note.title;
    if (note.image) {
        modalImage.src = note.image;
        modalImage.alt = note.imageAlt || `${note.title} image`;
        modalImage.style.display = 'block';
    } else {
        modalImage.style.display = 'none';
    }
    modalContent.textContent = note.content;
    modalMeta.textContent = `Date: ${formatNotificationDate(note.date)} | Type: ${note.type}`;
    notificationModal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeNotificationModal() {
    notificationModal.style.display = 'none';
    overlay.style.display = 'none';
}

async function filterNotifications(audience, button) { 
    const allBtns = document.querySelectorAll('.filter-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const token = localStorage.getItem('token');
    if (!token) return logout();

    try {
        let url = `${API_BASE_URL}/notifications?type=general`;
        
        const response = await fetch(url, {
            headers: { 'x-auth-token': token }
        });

        if (response.ok) {
            let filtered = await response.json();
            
            if (audience !== 'all') {
                filtered = filtered.filter(n => n.audience === 'college' || n.audience === audience);
            }

            filtered = sortNotifications(filtered, sortSelect.value);
            renderNotifications(filtered);
        }

    } catch (error) {
        console.error('Filter Error:', error);
        alert('Could not update filter.');
    }
}

function sortNotifications(notifications, sortBy) {
    return notifications.slice().sort((a, b) => {
        if (sortBy === 'date-desc') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'date-asc') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'title') {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });
}

async function renderAdminNotifications() { 
    adminNotificationList.innerHTML = '';
    const token = localStorage.getItem('token');
    if (!token) return logout();

    try {
        const response = await fetch(`${API_BASE_URL}/notifications/manage`, {
            headers: { 'x-auth-token': token }
        });

        const allNotifications = await response.json();

        if (allNotifications.length === 0) {
            adminNotificationList.innerHTML = '<li class="empty-state">No notifications created yet</li>';
            return;
        }

        allNotifications.forEach(note => {
            const li = document.createElement('li');
            li.className = 'notification-item';
            li.onclick = () => openNotificationModal(note);
            let imageHtml = '';
            if (note.image) {
                imageHtml = `<img src="${note.image}" alt="${note.title || 'Notification image'}" style="width: 50px; height: 50px; border-radius: 5px; float: right; margin-left: 10px; object-fit: cover;">`;
            }
            
            li.innerHTML = `
                ${imageHtml}
                <div class="notification-header">
                    <span class="notification-title">${note.title}</span>
                    <span class="notification-meta">Audience: ${note.audience.toUpperCase()} | Type: ${note.type}</span>
                </div>
                <p class="notification-content">${note.content}</p>
                <button class="btn btn-danger" onclick="deleteNotification('${note._id}', event)">Delete</button>
            `;
            adminNotificationList.appendChild(li);
        });

    } catch (error) {
        adminNotificationList.innerHTML = '<li class="empty-state">Error fetching notifications.</li>';
    }
}

async function deleteNotification(id, event) { 
    event.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return logout();

    if (confirm('Are you sure you want to delete this notification?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                alert('Notification deleted.');
                renderAdminNotifications(); // Reload list
                updateAnalytics(); // Update counts
            } else {
                alert('Failed to delete notification.');
            }
        } catch (error) {
            alert('Network error during deletion.');
        }
    }
}

async function updateAnalytics() { 
    const token = localStorage.getItem('token');
    if (!token) return logout();
    
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/analytics`, {
            headers: { 'x-auth-token': token }
        });
        
        const data = await response.json();
        
        document.getElementById('totalNotifications').textContent = data.totalNotifications;
        document.getElementById('totalEvents').textContent = data.totalEvents;
        document.getElementById('totalExams').textContent = data.totalExams;
    } catch (error) {
         document.getElementById('totalNotifications').textContent = 'N/A';
         document.getElementById('totalEvents').textContent = 'N/A';
         document.getElementById('totalExams').textContent = 'N/A';
    }
}

async function showSection(sectionId) { 
    // Hide all sections first
    document.getElementById('notificationsSection').classList.add('hidden');
    document.getElementById('eventsSection').classList.add('hidden');
    document.getElementById('examsSection').classList.add('hidden');

    // Show the selected section
    document.getElementById(sectionId + 'Section').classList.remove('hidden');

    const userDetails = JSON.parse(localStorage.getItem('currentUserDetails'));
    if (userDetails && userDetails.role === 'student') {
        let fetchedData = [];

        // Determine which data to fetch based on sectionId
        if (sectionId === 'notifications') {
            fetchedData = await fetchNotifications('general'); 
            renderNotifications(fetchedData);
            
            filterNotifications(document.querySelector('.filter-btn.active').dataset.audience, document.querySelector('.filter-btn.active'));
            
        } else if (sectionId === 'events') {
            fetchedData = await fetchNotifications('event');
            renderEvents(fetchedData);
        } else if (sectionId === 'exams') {
            fetchedData = await fetchNotifications('exam');
            renderExams(fetchedData);
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

    currentDashboard.classList.remove('visible');
    currentDashboard.classList.add('fade-out');

    currentDashboard.addEventListener('transitionend', () => {
        // Clear all local user data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUserDetails'); 
        
        currentDashboard.style.display = 'none';
        currentDashboard.classList.remove('fade-out');
        renderDashboards(); // Show login screen
    }, { once: true });
}

// Close modals on overlay click
overlay.addEventListener('click', () => {
    closeNotificationModal();
    closeModal();
});
