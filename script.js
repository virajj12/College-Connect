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
let tasks = {};

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
// FOCUS TRAPPING (Accessibility)
// ============================================
let previouslyFocusedElement = null;

function trapFocus(modal) {
    previouslyFocusedElement = document.activeElement;
    const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll(focusableSelectors);
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Store handler so we can remove it later
    modal._focusTrapHandler = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    };

    modal.addEventListener('keydown', modal._focusTrapHandler);
    firstFocusable.focus();
}

function releaseFocus(modal) {
    if (modal._focusTrapHandler) {
        modal.removeEventListener('keydown', modal._focusTrapHandler);
        delete modal._focusTrapHandler;
    }
    if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
    }
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
                getTasks();
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
    trapFocus(forgotPasswordModal);
}

function closeModal() {
    forgotPasswordModal.style.display = 'none';
    overlay.style.display = 'none';
    releaseFocus(forgotPasswordModal);
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
    trapFocus(notificationModal);
}

function closeNotificationModal() {
    notificationModal.style.display = 'none';
    overlay.style.display = 'none';
    releaseFocus(notificationModal);
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
    document.getElementById('accountSection').classList.add('hidden');

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
        } else if (sectionId === 'account') {
            populateAccountSection(userDetails);
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

//Update on heatmap
const DAY_NAMES = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ymd(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function positionTooltip(e, el) {
    // 1. Get the exact position of the hovered box
    const boxRect = e.target.getBoundingClientRect();
    const tooltipRect = el.getBoundingClientRect();
    
    // 2. Calculate position to center it right ABOVE the box
    let x = boxRect.left + (boxRect.width / 2) - (tooltipRect.width / 2);
    let y = boxRect.top - tooltipRect.height - 8; // 8px gap above the box

    // 3. Fallback checks: Don't let it bleed off the screen
    if (x < 10) x = 10; // Keep it on the left edge
    if (x + tooltipRect.width > window.innerWidth - 10) {
        x = window.innerWidth - tooltipRect.width - 10; // Keep it on the right edge
    }
    if (y < 10) {
        y = boxRect.bottom + 8; // If it goes off the top, flip it to BELOW the box
    }

    // 4. Apply the coordinates
    el.style.left = x + 'px';
    el.style.top = y + 'px';
}

function generateHeatmapGrid(data) {
    const heatmapWrapper = document.getElementById('heatmapWrapper');
    const tooltip = document.getElementById('heatmapTooltip');
    heatmapWrapper.innerHTML = ''; // Clear previous

    // 1. Calculate Grid Dates (Aligning with Sunday & Saturday)
    const weeksToRender = 52;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endSat = new Date(today);
    endSat.setDate(today.getDate() + (6 - today.getDay()));

    const startSun = new Date(endSat);
    startSun.setDate(endSat.getDate() - (weeksToRender * 7 - 1));

    // 2. Set up HTML Structure
    const monthRow = document.createElement('div');
    monthRow.className = 'heatmap-month-labels';

    const bodyRow = document.createElement('div');
    bodyRow.className = 'heatmap-body';

    const dayCol = document.createElement('div');
    dayCol.className = 'heatmap-day-labels';
    
    // Inject Mon, Wed, Fri Labels
    for (let d = 0; d < 7; d++) {
        const lab = document.createElement('div');
        lab.className = 'day-label' + (DAY_NAMES[d] ? '' : ' day-label--empty');
        lab.textContent = DAY_NAMES[d] || '·';
        dayCol.appendChild(lab);
    }
    bodyRow.appendChild(dayCol);

    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    // 3. Render Weeks & Cells
    const CELL_WIDTH = 18; // 12px width + 3px gap
    let lastMonth = -1;

    for (let w = 0; w < weeksToRender; w++) {
        const weekEl = document.createElement('div');
        weekEl.className = 'heatmap-week';

        // Check month for labels
        const firstDayOfWeek = new Date(startSun);
        firstDayOfWeek.setDate(startSun.getDate() + w * 7);
        const month = firstDayOfWeek.getMonth();
        
        // Add month label if month changed
        if (month !== lastMonth) {
            const label = document.createElement('span');
            label.className = 'month-label';
            label.textContent = MONTH_NAMES[month];
            label.style.left = `${w * CELL_WIDTH}px`;
            monthRow.appendChild(label);
            lastMonth = month;
        }

        for (let d = 0; d < 7; d++) {
            const currentDay = new Date(startSun);
            currentDay.setDate(startSun.getDate() + w * 7 + d);

            const box = document.createElement('div');
            box.className = 'heatmap-box';

            if (currentDay > today) {
                // Invisible boxes for future days in the final week
                box.classList.add('empty'); 
            } else {
                const dateKey = ymd(currentDay);
                const count = data[dateKey] || 0;
                box.classList.add(`level-${getLevel(count)}`);

                // Tooltip Interaction
                box.addEventListener('mouseenter', (e) => {
                    const formattedDate = currentDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    tooltip.innerHTML = `<div class="t-date">${formattedDate}</div><div>${count} task${count === 1 ? '' : 's'} completed</div>`;
                    tooltip.hidden = false;
                    positionTooltip(e, tooltip);
                });
                
                box.addEventListener('mousemove', (e) => positionTooltip(e, tooltip));
                box.addEventListener('mouseleave', () => { tooltip.hidden = true; });
            }
            weekEl.appendChild(box);
        }
        grid.appendChild(weekEl);
    }

    bodyRow.appendChild(grid);
    heatmapWrapper.appendChild(monthRow);
    heatmapWrapper.appendChild(bodyRow);
    
    // Auto-scroll to the right so the current date is visible
    setTimeout(() => {
        const container = document.querySelector('.heatmap-container');
        if(container) container.scrollLeft = container.scrollWidth;
    }, 50);
}

// function generateHeatmapGrid(data) {
//     heatmapGrid.innerHTML = '';
//     const today = new Date();
//     const daysToRender = 365;
//     const startDate = new Date();
//     startDate.setDate(today.getDate() - daysToRender);

//     for (let i = 0; i <= daysToRender; i++) {
//         const currentDate = new Date(startDate);
//         currentDate.setDate(startDate.getDate() + i);
//         const dateStr = currentDate.toISOString().split('T')[0];
//         const count = data[dateStr] || 0;

//         const box = document.createElement('div');
//         box.className = `heatmap-box level-${getLevel(count)}`;
//         box.title = `${count} tasks on ${dateStr}`;
//         heatmapGrid.appendChild(box);
//     }
// }

async function getTasks(){
    const token = localStorage.getItem('token');
    try{
        const response = await fetch(`${API_BASE_URL}/consistency/tasks`, {
            headers: { 'x-auth-token': token }
        });
        tasks = await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
    
}

function getLevel(count) {
    let numTasks = 0;
    numTasks = tasks.length;
    let countRatio = count / (numTasks? numTasks:1);
    if(countRatio > 1){
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    } else if(countRatio === 0) return 0;
    else if(countRatio <= 0.25) return 1;
    else if(countRatio <= 0.5) return 2;
    else if(countRatio <= 0.75) return 3;
    else return 4;
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

// ============================================
// ACCOUNTS CENTER
// ============================================

// Branch code → full name mapping
const BRANCH_NAMES = {
    CSE: 'Computer Science',
    ECE: 'Electronics & Communication',
    ME: 'Mechanical Engineering',
    CE: 'Civil Engineering',
    EE: 'Electrical Engineering',
    NA: 'Not Applicable'
};

// Year number → ordinal
function getYearDisplay(year) {
    const ordinals = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };
    return ordinals[String(year)] || year || '—';
}

// Generate initials from name
function getInitials(name) {
    if (!name) return 'CC';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

// Populate the account section with user details
function populateAccountSection(user) {
    // Profile header
    document.getElementById('accountInitials').textContent = getInitials(user.name);
    document.getElementById('accountName').textContent = user.name || '—';
    document.getElementById('accountRoleBadge').textContent = (user.role || 'student').toUpperCase();

    const branchFull = BRANCH_NAMES[user.branch] || user.branch || '—';
    const yearFull = getYearDisplay(user.year);
    document.getElementById('accountSubtitle').textContent = `${branchFull} · ${yearFull}`;

    // Personal info grid
    document.getElementById('accountInfoName').textContent = user.name || '—';
    document.getElementById('accountInfoEmail').textContent = user.email || '—';
    document.getElementById('accountInfoBranch').textContent = branchFull;
    document.getElementById('accountInfoYear').textContent = yearFull;
    document.getElementById('accountInfoRole').textContent = (user.role || 'student').charAt(0).toUpperCase() + (user.role || 'student').slice(1);

    // Reset delete confirmation state
    cancelDeleteConfirm();
}

// --- Change Password ---
const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPasswordAccount').value;
        const confirmPassword = document.getElementById('confirmPasswordAccount').value;
        const btn = document.getElementById('changePasswordBtn');

        // Validation
        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters.', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match.', 'warning');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return logout();

        setButtonLoading(btn, true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.msg || 'Password changed successfully!', 'success');
                changePasswordForm.reset();
            } else {
                showToast(data.msg || 'Failed to change password.', 'error');
            }
        } catch (error) {
            showToast('Could not connect to the server.', 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });
}

// --- Delete Account ---
function showDeleteConfirm() {
    document.getElementById('deleteAccountSection').classList.add('hidden');
    document.getElementById('deleteConfirmSection').classList.remove('hidden');
    document.getElementById('deleteConfirmInput').value = '';
    document.getElementById('deleteConfirmInput').focus();
}

function cancelDeleteConfirm() {
    const deleteSection = document.getElementById('deleteAccountSection');
    const confirmSection = document.getElementById('deleteConfirmSection');
    if (deleteSection) deleteSection.classList.remove('hidden');
    if (confirmSection) confirmSection.classList.add('hidden');
}

async function deleteAccount() {
    const input = document.getElementById('deleteConfirmInput');
    if (input.value.trim() !== 'DELETE') {
        showToast('Please type "DELETE" to confirm.', 'warning');
        input.focus();
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) return logout();

    const btn = document.getElementById('confirmDeleteBtn');
    setButtonLoading(btn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Account deleted. Goodbye!', 'info');
            localStorage.removeItem('token');
            localStorage.removeItem('currentUserDetails');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showToast(data.msg || 'Failed to delete account.', 'error');
        }
    } catch (error) {
        showToast('Could not connect to the server.', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}


const publicVapidKey = 'BPwQ7CRpVqA2ktHQCnUJ8tcpppZRIc1Qt46wloDmNubtK9KEUIqEpjy8tVGyh_uVp6wjGvysrkXXAgjsyyWKqNE';

async function subscribeToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      // 1. Ask for permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permission denied');

      // 2. Get the Service Worker registration
      const register = await navigator.serviceWorker.ready;

      // 3. Subscribe to Push
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // 4. Send the subscription object to your Node backend
      await fetch('${API_BASE_URL}/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'content-type': 'application/json'
        }
      });

      console.log('Push Subscribed successfully!');
    } catch (err) {
      console.error('Push subscription failed:', err);
    }
  }
}

// Helper function required to convert the VAPID key for the browser
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}