


// Import Firebase modules
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection, // Add this
    addDoc,     // Add this
    getDocs,    // Add this
    query,      // Add this
    where,      // Add this
    orderBy,    // Add this
    onSnapshot,  // Add this
    updateDoc, // Add this
    deleteDoc  // Add this
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB7VAhpgtEnAbjUZGmMmUnAv2i8m6N_hO0",
    authDomain: "vishwaportal-8fe95.firebaseapp.com",
    projectId: "vishwaportal-8fe95",
    storageBucket: "vishwaportal-8fe95.firebasestorage.app",
    messagingSenderId: "1060321212945",
    appId: "1:1060321212945:web:030cd7f8b7370135ff0fb0",
    measurementId: "G-2K6ZBCCR1S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)


const adminEmails = ["aryanketkar02@gmail.com", "atharv.gaikwad241@vit.edu"];

// ADD AFTER Firebase initialization
const noticesCollection = collection(db, "notices");
let unsubscribeNotices = null;


window.onload = () => {
    document.getElementById('loginModal').style.display = 'flex';
    document.querySelector('.sidebar').classList.add('hidden');
    document.querySelector('.main-content').classList.add('hidden');
};
const pusher = new Pusher('93401a7627e2848b1167', {
    cluster: 'ap2',
});

// Subscribe to a channel
const channel = pusher.subscribe('notifications');

// Listen for events
channel.bind('new-notice', function (data) {
    console.log('New notice:', data.message);
    alert(`New Notice: ${data.message}`);
});


// Login button functionality
document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check user role in Firestore
        const userRef = doc(db, "roles", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'admin') {
                alert("Welcome Admin!");
                showAdminFeatures();
            } else {
                alert("Welcome Student!");
                showStudentFeatures();
            }
        } else {
            alert("Role not found for user.");
        }
    } catch (error) {
        console.error("Login error:", error); // Log the full error for debugging
        if (error.code === "auth/invalid-login-credentials") {
            alert("Invalid email or password. Please try again.");
        } else {
            alert(`Login failed: ${error.message}`);
        }
    }
});


// Logout button functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert("Logged out successfully.");
        resetUI();
    } catch (error) {
        alert(`Logout failed: ${error.message}`);
    }
});

// Reset UI on logout
function resetUI() {
    document.querySelector('.sidebar').classList.add('hidden');
    document.querySelector('.main-content').classList.add('hidden');
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('logoutSection').classList.add('hidden');
}

// Monitor auth state
// Monitor auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        if (adminEmails.includes(user.email)) {
            // User is an admin
            showAdminFeatures();
        } else {
            // User is a student
            showStudentFeatures();
        }
    } else {
        // User is signed out
        resetUI();
    }
});
// Show admin features
function showAdminFeatures() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('logoutSection').classList.remove('hidden');
    document.querySelector('.sidebar').classList.remove('hidden');
    document.querySelector('.main-content').classList.remove('hidden');
    document.getElementById('addNoticeBtn').style.display = 'block';
    setupRealTimeListener(); // Fetch and display notices
}

// Show student features
function showStudentFeatures() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('logoutSection').classList.remove('hidden');
    document.querySelector('.sidebar').classList.remove('hidden');
    document.querySelector('.main-content').classList.remove('hidden');
    document.getElementById('addNoticeBtn').style.display = 'none';
}

// Add notice functionality
document.getElementById('addNoticeBtn').addEventListener('click', () => {
    document.getElementById('addNoticeModal').style.display = 'flex';
});

document.getElementById('closeNoticeModalBtn').addEventListener('click', () => {
    document.getElementById('addNoticeModal').style.display = 'none';
});

// REPLACE THE DELETED POST NOTICE HANDLER
document.getElementById('postNoticeBtn').addEventListener('click', async () => {
    const title = document.getElementById('noticeTitle').value.trim();
    const content = document.getElementById('noticeContent').value.trim();
    const type = document.getElementById('noticeType').value;
    const priority = document.getElementById('noticePriority').value;
    const user = auth.currentUser;
    const files = document.getElementById('noticeAttachments').files;
    const storage = getStorage(app);
    const attachments = [];

    if (!title || !content || !type || !user) {
        alert('All fields are required!');
        return;
    }

    // Prompt for a Google Drive link for the PDF
    let pdfUrl = prompt("Paste the Google Drive link for the PDF (if any):");
    if (pdfUrl && !pdfUrl.startsWith("http")) {
        alert("Invalid link. Please enter a valid Google Drive link.");
        return;
    }

    // Upload attachments
    for (const file of files) {
        const storageRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        attachments.push({
            name: file.name,
            type: file.type,
            url: url,
        });
    }

    try {
        // Add the notice to Firestore
        await addDoc(noticesCollection, {
            title,
            content,
            type,
            priority,
            date: new Date().toISOString(),
            author: user.uid,
            authorEmail: user.email || 'anonymous',
            attachments: attachments,
            pdfUrl: pdfUrl || null, // Store the PDF link or null if not provided
        });

        // Trigger a Pusher event
        channel.trigger('new-notice', {
            message: `New Notice: ${title}`,
        });

        // Clear form fields
        document.getElementById('noticeTitle').value = '';
        document.getElementById('noticeContent').value = '';
        document.getElementById('noticeType').value = '';
        document.getElementById('addNoticeModal').style.display = 'none';
        alert('Notice added successfully!');
    } catch (error) {
        console.error("Error adding notice: ", error);
        alert('Error adding notice!');
    }
});

// UPDATE THIS FUNCTION
function createNoticeElement(notice) {
    const div = document.createElement('div');
    div.className = 'notice';
    div.dataset.id = notice.id; // Add notice ID as data attribute

    // Add admin controls (only if current user is admin)
    let adminControls = '';
    const user = auth.currentUser;
    if (user && adminEmails.includes(user.email)) {
        adminControls = `
            <div class="admin-controls">
                <button class="edit-btn">✏️ Edit</button>
                <button class="delete-btn">🗑️ Delete</button>
            </div>
        `;
    }

    // Create PDF link if URL exists
    const pdfLink = notice.pdfUrl 
        ? `<a href="${notice.pdfUrl}" target="_blank" class="pdf-link">📄 View PDF</a>`
        : '';

    // Add notice content with PDF link
    div.innerHTML = `
        <h3>${notice.title}</h3>
        <div class="notice-date">${new Date(notice.date).toLocaleDateString()}</div>
        <div class="notice-content">${notice.content}</div>
        <span class="notice-type ${notice.type}">${notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}</span>
        ${pdfLink}
        ${adminControls}
    `;

    // Add attachments if they exist
    if (notice.attachments && notice.attachments.length > 0) {
        const attachmentsDiv = document.createElement('div');
        attachmentsDiv.className = 'attachments';
        notice.attachments.forEach(attachment => {
            const attachmentLink = document.createElement('a');
            attachmentLink.href = attachment.url;
            attachmentLink.className = 'attachment-link';
            attachmentLink.target = '_blank';
            attachmentLink.innerHTML = `📎 ${attachment.name}`;
            attachmentsDiv.appendChild(attachmentLink);
        });
        div.appendChild(attachmentsDiv);
    }

    // Add event listeners if admin
    if (user && adminEmails.includes(user.email)) {
        div.querySelector('.edit-btn').addEventListener('click', () => openEditModal(notice));
        div.querySelector('.delete-btn').addEventListener('click', () => deleteNotice(notice.id));
    }

    return div;
}



function sortNotices(notices, sortType) {
    return [...notices].sort((a, b) => {
        switch (sortType) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
}



document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchQuery = e.target.value;
    const activeType = document.querySelector('.nav-btn.active').dataset.type;
    const sortType = document.getElementById('sortSelect').value;
    setupRealTimeListener(activeType, sortType, searchQuery);
});

document.getElementById('sortSelect').addEventListener('change', () => {
    const activeType = document.querySelector('.nav-btn.active').dataset.type;
    setupRealTimeListener(activeType, document.getElementById('sortSelect').value);
});

// Initial display of all notices when page loads







// List of admin emails



// Google Sign-In button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Google Sign-In button functionality
    document.getElementById('googleSignInBtn').addEventListener('click', async () => {
        const provider = new GoogleAuthProvider(); // Create a Google Auth provider

        try {
            const result = await signInWithPopup(auth, provider); // Sign in with Google using a popup
            const user = result.user;

            console.log("Google Sign-In successful. User:", user);

            // Check if the user's email is in the admin list
            if (adminEmails.includes(user.email)) {
                alert("Welcome Admin!");
                showAdminFeatures();
            } else {
                alert("Welcome Student!");
                showStudentFeatures();
            }
        } catch (error) {
            console.error("Google Sign-In error:", error);
            alert(`Google Sign-In failed: ${error.message}`);
        }
    });

    // Anonymous Login button functionality
    document.getElementById('anonymousLoginBtn').addEventListener('click', async () => {
        try {
            // Sign in anonymously
            const userCredential = await signInAnonymously(auth);
            const user = userCredential.user;

            // Set the student role for anonymous users
            const userRef = doc(db, "roles", user.uid);
            await setDoc(userRef, { role: "student" });

            alert("Welcome Student!");
            showStudentFeatures();
        } catch (error) {
            console.error("Anonymous login failed:", error);
            alert("Login failed. Please try again.");
        }
    });
});


// ADD THIS NEW FUNCTION
function setupRealTimeListener(selectedType = 'all', sortType = 'date-desc', searchQuery = '') {
    if (unsubscribeNotices) unsubscribeNotices();

    let q = query(noticesCollection);

    // Type filter
    if (selectedType !== 'all') {
        q = query(q, where('type', '==', selectedType));
    }

    // Sorting
    const [sortField, sortDirection] = sortType.split('-');
    q = query(q, orderBy(
        sortField === 'date' ? 'date' : 'title',
        sortDirection === 'desc' ? 'desc' : 'asc'
    ));

    unsubscribeNotices = onSnapshot(q, (querySnapshot) => {
        const noticeBoard = document.getElementById('noticeBoard');
        noticeBoard.innerHTML = '';

        if (querySnapshot.empty) {
            noticeBoard.innerHTML = '<div class="no-results">No notices found</div>';
            return;
        }

        // Convert query snapshot to array and filter
        const notices = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(notice => {
                const query = searchQuery.toLowerCase();
                return notice.title.toLowerCase().includes(query) ||
                    notice.content.toLowerCase().includes(query) ||
                    notice.type.toLowerCase().includes(query);
            });

        if (notices.length === 0) {
            noticeBoard.innerHTML = '<div class="no-results">No notices found</div>';
            return;
        }

        notices.forEach(notice => {
            noticeBoard.appendChild(createNoticeElement(notice));
        });
    });
}

// Navigation buttons
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', function() {
        const searchQuery = document.getElementById('searchInput').value;
        setupRealTimeListener(
            button.dataset.type,
            document.getElementById('sortSelect').value,
            searchQuery
        );

        // Close the mobile menu if in mobile view
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            sidebar.classList.add('hidden');
        }
    });
});


// Sort select
document.getElementById('sortSelect').addEventListener('change', () => {
    const searchQuery = document.getElementById('searchInput').value;
    const activeType = document.querySelector('.nav-btn.active').dataset.type;
    setupRealTimeListener(activeType, document.getElementById('sortSelect').value, searchQuery);
});

// Initialize with default view
// At the bottom of your script.js
setupRealTimeListener('all', 'date-desc', '');

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

// Toggle theme on click
themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 Dark Mode";
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const sidebar = document.querySelector('.sidebar');

    mobileMenuButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent click event from bubbling up

        if (sidebar.classList.contains('hidden')) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('active');
        } else {
            sidebar.classList.remove('active');
            sidebar.classList.add('hidden');
        }
    });

    // Close sidebar when clicking outside of it
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(event.target) && 
            !mobileMenuButton.contains(event.target)) {
            sidebar.classList.remove('active');
            sidebar.classList.add('hidden');
        }
    });
    // Update CSS classes on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('hidden');
            mainContent.classList.remove('hidden');
        }
    });
});
let currentEditingNoticeId = null;

// Open edit modal with existing data
function openEditModal(notice) {
    currentEditingNoticeId = notice.id;
    document.getElementById('editNoticeTitle').value = notice.title;
    document.getElementById('editNoticeContent').value = notice.content;
    document.getElementById('editNoticeType').value = notice.type;
    document.getElementById('editNoticePriority').value = notice.priority;
    document.getElementById('editPdfUrl').value = notice.pdfUrl || '';
    document.getElementById('editNoticeModal').style.display = 'flex';
    const noticeDate = new Date(notice.date).toISOString().split('T')[0]; // Format as YYYY-MM-DD
    document.getElementById('editNoticeDate').value = noticeDate;
    
    document.getElementById('editNoticeModal').style.display = 'flex';
}

// Update notice in Firestore
document.getElementById('updateNoticeBtn').addEventListener('click', async () => {
    const title = document.getElementById('editNoticeTitle').value.trim();
    const content = document.getElementById('editNoticeContent').value.trim();
    const type = document.getElementById('editNoticeType').value;
    const priority = document.getElementById('editNoticePriority').value;
    const date = document.getElementById('editNoticeDate').value;
    const pdfUrl = document.getElementById('editPdfUrl').value.trim();

    try {
        await updateDoc(doc(db, "notices", currentEditingNoticeId), {
            title,
            content,
            type,
            priority,
            date: new Date(date).toISOString(),
            pdfUrl: pdfUrl || null,
            lastUpdated: new Date().toISOString()
        });
        document.getElementById('editNoticeModal').style.display = 'none';
        alert('Notice updated!');
    } catch (error) {
        alert('Error updating notice: ' + error.message);
    }
});

// Delete notice from Firestore
async function deleteNotice(noticeId) {
    if (confirm('Are you sure you want to delete this notice?')) {
        try {
            await deleteDoc(doc(db, "notices", noticeId));
            alert('Notice deleted!');
        } catch (error) {
            alert('Error deleting notice: ' + error.message);
        }
    }
}

// Close edit modal
document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('editNoticeModal').style.display = 'none';
});

    
   
    
