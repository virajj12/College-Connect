// ============================================
// COLLEGE CONNECT — MAIN SCRIPT
// ============================================

// --- DOM Elements ---
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

const taskList = document.getElementById('taskList');
const addTaskForm = document.getElementById('addTaskForm');
const heatmapGrid = document.getElementById('heatmapGrid');

// --- API Configuration ---
const API_BASE_URL = 'https://college-connect-pluo.onrender.com/api';

// --- Store for search functionality ---
let cachedNotifications = [];

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span>${escapeHtml(message)}</span>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Auto-remove after animation
    setTimeout(() => {
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3200);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// XSS Prevention — escape HTML in user-generated content
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format ISO date into readable format
function formatNotificationDate(isoDateString) {
    if (!isoDateString) return 'N/A';
    const date = new Date(isoDateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Button loading state helpers
function setButtonLoading(btn, loading) {
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Password visibility toggle
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
        btn.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        btn.textContent = '👁';
        btn.setAttribute('aria-label', 'Show password');
    }
}

// Animated counter for stat numbers
function animateCounter(element, target) {
    const duration = 800;
    const startTime = performance.now();
    const startVal = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startVal + (target - startVal) * eased);
        element.textContent = current;
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

// ============================================
// MOBILE MENU
// ============================================
function toggleMobileMenu(navId) {
    const isStudent = navId === 'studentNav';
    const navLinks = document.getElementById(isStudent ? 'studentNavLinks' : 'adminNavLinks');
    const hamburger = document.getElementById(isStudent ? 'studentHamburger' : 'adminHamburger');

    navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('active');

    const isOpen = navLinks.classList.contains('mobile-open');
    hamburger.setAttribute('aria-expanded', isOpen);
}

// Close mobile menu when a link is clicked
function closeMobileMenu() {
    document.querySelectorAll('.nav-links').forEach(nl => nl.classList.remove('mobile-open'));
    document.querySelectorAll('.hamburger').forEach(h => {
        h.classList.remove('active');
        h.setAttribute('aria-expanded', 'false');
    });
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderDashboards();
    sortSelect.addEventListener('change', () => {
        filterNotifications('all', document.querySelector('.filter-btn.active'));
    });
});

// ============================================
// AUTH & DASHBOARD RENDERING
// ============================================
async function renderDashboards() {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/user`, {
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) throw new Error('Token invalid or expired');

            const currentUser = await response.json();
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

// ============================================
// NAVIGATION
// ============================================
function handleNavClick(element, section) {
    const navContainer = element.closest('.bubble-nav');
    navContainer.querySelectorAll('a').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
    closeMobileMenu();
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
    document.getElementById('resetEmail').focus();
}

function closeModal() {
    forgotPasswordModal.style.display = 'none';
    overlay.style.display = 'none';
}

// ============================================
// LOGIN
// ============================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    setButtonLoading(btn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            showToast('Welcome back!', 'success');
            authSection.classList.add('fade-out');
            authSection.addEventListener('transitionend', () => {
                renderDashboards();
            }, { once: true });
        } else {
            showToast(data.msg || 'Invalid email or password.', 'error');
        }
    } catch (error) {
        showToast('Could not connect to the server.', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
});

// ============================================
// REGISTER
// ============================================
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const branch = document.getElementById('registerBranch').value;
    const year = document.getElementById('registerYear').value;
    const btn = document.getElementById('registerBtn');

    setButtonLoading(btn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, branch, year })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Account created successfully! Please sign in.', 'success');
            toggleAuthForm();
        } else {
            showToast(data.msg || 'An error occurred during registration.', 'error');
        }
    } catch (error) {
        showToast('Could not connect to the server.', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
});

// ============================================
// FORGOT PASSWORD
// ============================================
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const btn = forgotPasswordForm.querySelector('.btn-primary');

    if (!API_BASE_URL) {
        showToast('API URL is missing.', 'error');
        closeModal();
        return;
    }

    setButtonLoading(btn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (response.ok) {
            showToast(result.msg, 'success');
        } else {
            showToast(result.error || 'An error occurred. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Could not connect to the server.', 'error');
    } finally {
        setButtonLoading(btn, false);
    }

    closeModal();
});

// ============================================
// IMAGE UPLOAD (Drag & Drop)
// ============================================
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

dropArea.addEventListener('click', () => fileInput.click());

// Also handle keyboard activation for accessibility
dropArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    if (file.type.startsWith('image/')) {
        const publishButton = document.getElementById('publishBtn');
        setButtonLoading(publishButton, true);

        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
            notificationForm.dataset.image = event.target.result;
            setButtonLoading(publishButton, false);
        };
        reader.readAsDataURL(file);
    } else {
        showToast('Please upload a valid image file.', 'warning');
        fileInput.value = '';
        imagePreview.style.display = 'none';
        notificationForm.dataset.image = '';
    }
}

// ============================================
// CREATE NOTIFICATION (Admin)
// ============================================
notificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('notificationTitle').value;
    const content = document.getElementById('notificationContent').value;
    const type = document.getElementById('notificationType').value;
    const audience = document.getElementById('notificationAudience').value;
    const image = notificationForm.dataset.image || null;
    const btn = document.getElementById('publishBtn');

    const token = localStorage.getItem('token');
    if (!token) return logout();

    setButtonLoading(btn, true);

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
            showToast('Notification Published Successfully!', 'success');
            notificationForm.reset();
            imagePreview.style.display = 'none';
            notificationForm.dataset.image = '';
            if (document.getElementById('manageSection').classList.contains('hidden')) {
                renderAdminNotifications();
            }
        } else {
            const error = await response.json();
            showToast(`Failed to publish: ${error.msg}`, 'error');
        }
    } catch (error) {
        showToast('Network error. Check backend server.', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
});

// ============================================
// FETCH & RENDER NOTIFICATIONS
// ============================================
async function fetchNotifications(type, audience = null) {
    const token = localStorage.getItem('token');
    if (!token) return logout();

    let url = `${API_BASE_URL}/notifications?type=${type}`;
    if (audience && audience !== 'all') {
        url += `&audience=${audience}`;
    }

    try {
        const response = await fetch(url, {
            headers: { 'x-auth-token': token }
        });

        if (response.ok) {
            let notifications = await response.json();
            notifications = sortNotifications(notifications, sortSelect.value);
            return notifications;
        } else {
            showToast('Session expired. Please log in again.', 'error');
            logout();
            return [];
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        showToast('Network error. Check server connection.', 'error');
        return [];
    }
}

function renderNotifications(notifications) {
    notificationList.innerHTML = '';
    cachedNotifications = notifications; // Cache for search

    if (notifications.length === 0) {
        notificationList.innerHTML = '<li class="empty-state"><span class="empty-state-icon">📭</span>No notifications found</li>';
        return;
    }

    notifications.forEach(note => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        li.onclick = () => openNotificationModal(note);
        li.setAttribute('role', 'listitem');
        li.setAttribute('tabindex', '0');
        li.onkeydown = (e) => { if (e.key === 'Enter') openNotificationModal(note); };

        let imageHtml = '';
        if (note.image) {
            imageHtml = `<img src="${note.image}" alt="${escapeHtml(note.imageAlt || 'Notification image')}" style="width: 50px; height: 50px; border-radius: 8px; float: right; margin-left: 12px; object-fit: cover;" loading="lazy">`;
        }
        li.innerHTML = `
            ${imageHtml}
            <div class="notification-header">
                <span class="notification-title">${escapeHtml(note.title)}</span>
                <span class="notification-meta">${formatNotificationDate(note.date)}</span>
            </div>
            <p class="notification-content">${escapeHtml(note.content)}</p>
        `;
        notificationList.appendChild(li);
    });
}

function renderEvents(events) {
    eventsList.innerHTML = '';

    if (events.length === 0) {
        eventsList.innerHTML = '<li class="empty-state"><span class="empty-state-icon">🎉</span>No upcoming events</li>';
        return;
    }

    events.forEach(event => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        li.onclick = () => openNotificationModal(event);
        li.setAttribute('role', 'listitem');
        li.setAttribute('tabindex', '0');
        li.onkeydown = (e) => { if (e.key === 'Enter') openNotificationModal(event); };

        let imageHtml = '';
        if (event.image) {
            imageHtml = `<img src="${event.image}" alt="${escapeHtml(event.imageAlt || 'Event image')}" style="width: 50px; height: 50px; border-radius: 8px; float: right; margin-left: 12px; object-fit: cover;" loading="lazy">`;
        }
        li.innerHTML = `
            ${imageHtml}
            <div class="notification-header">
                <span class="notification-title">${escapeHtml(event.title)}</span>
                <span class="notification-meta">${formatNotificationDate(event.date)}</span>
            </div>
            <p class="notification-content">${escapeHtml(event.content)}</p>
        `;
        eventsList.appendChild(li);
    });
}

function renderExams(exams) {
    examsList.innerHTML = '';

    if (exams.length === 0) {
        examsList.innerHTML = '<li class="empty-state"><span class="empty-state-icon">📝</span>No exam schedule available</li>';
        return;
    }

    exams.forEach(exam => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        li.onclick = () => openNotificationModal(exam);
        li.setAttribute('role', 'listitem');
        li.setAttribute('tabindex', '0');
        li.onkeydown = (e) => { if (e.key === 'Enter') openNotificationModal(exam); };

        let imageHtml = '';
        if (exam.image) {
            imageHtml = `<img src="${exam.image}" alt="${escapeHtml(exam.imageAlt || 'Exam image')}" style="width: 50px; height: 50px; border-radius: 8px; float: right; margin-left: 12px; object-fit: cover;" loading="lazy">`;
        }
        li.innerHTML = `
            ${imageHtml}
            <div class="notification-header">
                <span class="notification-title">${escapeHtml(exam.title)}</span>
                <span class="notification-meta">${formatNotificationDate(exam.date)}</span>
            </div>
            <p class="notification-content">${escapeHtml(exam.content)}</p>
        `;
        examsList.appendChild(li);
    });
}

// ============================================
// NOTIFICATION MODAL
// ============================================
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

    // Focus trap to modal
    notificationModal.focus();
}

function closeNotificationModal() {
    notificationModal.style.display = 'none';
    overlay.style.display = 'none';
}

// ============================================
// SEARCH NOTIFICATIONS
// ============================================
function searchNotifications(query) {
    if (!query.trim()) {
        renderNotifications(cachedNotifications);
        return;
    }
    const lower = query.toLowerCase();
    const filtered = cachedNotifications.filter(n =>
        n.title.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower)
    );
    renderNotifications(filtered);
}

// ============================================
// FILTER & SORT
// ============================================
async function filterNotifications(audience, button) {
    const allBtns = document.querySelectorAll('.filter-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const token = localStorage.getItem('token');
    if (!token) return logout();

    try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            headers: { 'x-auth-token': token }
        });

        if (response.ok) {
            let filtered = await response.json();
            if (audience !== 'all') {
                filtered = filtered.filter(n => n.audience === audience);
            }
            filtered = sortNotifications(filtered, sortSelect.value);
            renderNotifications(filtered);

            // Clear search
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
        }
    } catch (error) {
        console.error('Filter Error:', error);
        showToast('Could not update filter.', 'error');
    }
}

function sortNotifications(notifications, sortBy) {
    return notifications.slice().sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
    });
}

// ============================================
// ADMIN: MANAGE NOTIFICATIONS
// ============================================
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
            adminNotificationList.innerHTML = '<li class="empty-state"><span class="empty-state-icon">📋</span>No notifications created yet</li>';
            return;
        }

        allNotifications.forEach(note => {
            const li = document.createElement('li');
            li.className = 'notification-item';
            li.onclick = () => openNotificationModal(note);
            let imageHtml = '';
            if (note.image) {
                imageHtml = `<img src="${note.image}" alt="${escapeHtml(note.title || 'Notification image')}" style="width: 50px; height: 50px; border-radius: 8px; float: right; margin-left: 12px; object-fit: cover;" loading="lazy">`;
            }

            li.innerHTML = `
                ${imageHtml}
                <div class="notification-header">
                    <span class="notification-title">${escapeHtml(note.title)}</span>
                    <span class="notification-meta">Audience: ${escapeHtml(note.audience.toUpperCase())} | Type: ${escapeHtml(note.type)}</span>
                </div>
                <p class="notification-content">${escapeHtml(note.content)}</p>
                <button class="btn btn-danger" onclick="deleteNotification('${note._id}', event)" aria-label="Delete notification: ${escapeHtml(note.title)}">Delete</button>
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
                showToast('Notification deleted.', 'success');
                renderAdminNotifications();
                updateAnalytics();
            } else {
                showToast('Failed to delete notification.', 'error');
            }
        } catch (error) {
            showToast('Network error during deletion.', 'error');
        }
    }
}

// ============================================
// ADMIN: ANALYTICS
// ============================================
async function updateAnalytics() {
    const token = localStorage.getItem('token');
    if (!token) return logout();

    try {
        const response = await fetch(`${API_BASE_URL}/notifications/analytics`, {
            headers: { 'x-auth-token': token }
        });

        const data = await response.json();

        // Animate counters
        animateCounter(document.getElementById('totalNotifications'), data.totalNotifications || 0);
        animateCounter(document.getElementById('totalEvents'), data.totalEvents || 0);
        animateCounter(document.getElementById('totalExams'), data.totalExams || 0);
    } catch (error) {
        document.getElementById('totalNotifications').textContent = 'N/A';
        document.getElementById('totalEvents').textContent = 'N/A';
        document.getElementById('totalExams').textContent = 'N/A';
    }
}

// ============================================
// SECTION NAVIGATION
// ============================================
async function showSection(sectionId) {
    // Hide all sections
    document.getElementById('notificationsSection').classList.add('hidden');
    document.getElementById('eventsSection').classList.add('hidden');
    document.getElementById('examsSection').classList.add('hidden');
    document.getElementById('consistencySection').classList.add('hidden');

    // Show selected section
    const section = document.getElementById(sectionId + 'Section');
    section.classList.remove('hidden');

    const userDetails = JSON.parse(localStorage.getItem('currentUserDetails'));
    if (userDetails && userDetails.role === 'student') {
        if (sectionId === 'notifications') {
            const fetchedData = await fetchNotifications('general');
            renderNotifications(fetchedData);
            filterNotifications(
                document.querySelector('.filter-btn.active').dataset.audience,
                document.querySelector('.filter-btn.active')
            );
        } else if (sectionId === 'events') {
            const fetchedData = await fetchNotifications('event');
            renderEvents(fetchedData);
        } else if (sectionId === 'exams') {
            const fetchedData = await fetchNotifications('exam');
            renderExams(fetchedData);
        } else if (sectionId === 'consistency') {
            await fetchAndRenderTasks();
            await fetchAndRenderHeatmap();
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

// ============================================
// CONSISTENCY FEATURE
// ============================================

// Fetch and Render Tasks
async function fetchAndRenderTasks() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/consistency/tasks`, {
            headers: { 'x-auth-token': token }
        });
        const tasks = await response.json();

        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state"><span class="empty-state-icon">✨</span>No daily habits yet. Create one!</li>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox"
                        ${task.isCompletedToday ? 'checked' : ''}
                        onchange="toggleTask('${task._id}')"
                        aria-label="Mark ${escapeHtml(task.title)} as complete">
                    <span class="task-title ${task.isCompletedToday ? 'completed' : ''}">${escapeHtml(task.title)}</span>
                </div>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem;" onclick="deleteTask('${task._id}')" aria-label="Delete task: ${escapeHtml(task.title)}">Delete</button>
            `;
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Add New Task
addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('newTaskInput');
    const title = input.value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/consistency/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            input.value = '';
            showToast('Habit added!', 'success');
            fetchAndRenderTasks();
        }
    } catch (error) {
        showToast('Error creating task', 'error');
    }
});

// Toggle Task Completion
async function toggleTask(taskId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/consistency/tasks/${taskId}/toggle`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });

        if (response.ok) {
            fetchAndRenderTasks();
            fetchAndRenderHeatmap();
        }
    } catch (error) {
        showToast('Network error', 'error');
    }
}

// Delete Task
async function deleteTask(taskId) {
    if (!confirm('Delete this habit?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/consistency/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        if (response.ok) {
            showToast('Habit removed.', 'success');
            fetchAndRenderTasks();
            fetchAndRenderHeatmap();
        }
    } catch (error) {
        showToast('Error deleting task', 'error');
    }
}

// Render Heatmap
async function fetchAndRenderHeatmap() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/consistency/heatmap`, {
            headers: { 'x-auth-token': token }
        });
        const data = await response.json();
        generateHeatmapGrid(data);
    } catch (error) {
        console.error('Error fetching heatmap:', error);
    }
}

function generateHeatmapGrid(data) {
    heatmapGrid.innerHTML = '';
    const today = new Date();
    const daysToRender = 365;
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysToRender);

    for (let i = 0; i <= daysToRender; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = data[dateStr] || 0;

        const box = document.createElement('div');
        box.className = `heatmap-box level-${getLevel(count)}`;
        box.title = `${count} tasks on ${dateStr}`;
        heatmapGrid.appendChild(box);
    }
}

function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    const currentDashboard = studentDashboard.style.display === 'block' ? studentDashboard : adminDashboard;

    currentDashboard.classList.remove('visible');
    currentDashboard.classList.add('fade-out');

    currentDashboard.addEventListener('transitionend', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUserDetails');
        currentDashboard.style.display = 'none';
        currentDashboard.classList.remove('fade-out');
        showToast('Logged out successfully.', 'info');
        renderDashboards();
    }, { once: true });
}

// ============================================
// KEYBOARD SHORTCUTS & EVENTS
// ============================================

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNotificationModal();
        closeModal();
        closeMobileMenu();
    }
});

// Close modals on overlay click
overlay.addEventListener('click', () => {
    closeNotificationModal();
    closeModal();
});
