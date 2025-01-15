const userRoles = {
    student: {
        username: 'student',
        password: 'student123',
        role: 'student',
        favorites: new Set(),
        readNotices: new Set()
    },
    faculty: {
        username: 'faculty',
        password: 'faculty123',
        role: 'faculty',
        favorites: new Set(),
        readNotices: new Set()
    }
};

let currentUser = null;

window.onload = () => {
    // Initially hide the sidebar and main content, show login modal
    document.getElementById('loginModal').style.display = 'flex';
    document.querySelector('.sidebar').classList.add('hidden');
    document.querySelector('.main-content').classList.add('hidden');
};

document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    for (let user in userRoles) {
        if (userRoles[user].username === username && userRoles[user].password === password) {
            currentUser = userRoles[user];
            alert(Welcome ${currentUser.role}!);

            // Hide login modal and show the main content after login
            document.getElementById('loginModal').style.display = 'none';
            document.querySelector('.sidebar').classList.remove('hidden');
            document.querySelector('.main-content').classList.remove('hidden');

            // Show the "Add Notice" button for faculty
            if (currentUser.role === 'faculty') {
                document.getElementById('addNoticeBtn').style.display = 'block';
            }
            return;
        }
    }

    alert('Invalid credentials');
});

document.getElementById('addNoticeBtn').addEventListener('click', () => {
    if (currentUser && currentUser.role === 'faculty') {
        document.getElementById('addNoticeModal').style.display = 'flex';
    } else {
        alert('Access Denied!');
    }
});

document.getElementById('closeNoticeModalBtn').addEventListener('click', () => {
    document.getElementById('addNoticeModal').style.display = 'none';
});

document.getElementById('postNoticeBtn').addEventListener('click', () => {
    const title = document.getElementById('noticeTitle').value.trim();
    const content = document.getElementById('noticeContent').value.trim();
    const type = document.getElementById('noticeType').value;

    if (!title || !content || !type) {
        alert('All fields are required!');
        return;
    }

    notices.push({
        title,
        content,
        type,
        date: new Date().toISOString().split('T')[0]
    });

    document.getElementById('addNoticeModal').style.display = 'none';
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeContent').value = '';
    document.getElementById('noticeType').value = '';
    filterAndDisplayNotices();
    alert('Notice added successfully!');
});

const notices = [
    {
        title: "Semester Registration",
        date: "2025-01-03",
        content: "All students must complete their semester registration by January 15th, 2025.",
        type: "academic"
        
    },
    {
        title: "Annual Cultural Fest",
        date: "2025-01-05",
        content: "Join us for the annual cultural festival 'Rhythms 2025' starting next week.",
        type: "events"
    },
    {
        title: "Inter-College Basketball Tournament",
        date: "2025-01-04",
        content: "Basketball team selections for the upcoming inter-college tournament.",
        type: "sports"
    },
    {
        title: "Mid-Semester Examination Schedule",
        date: "2025-01-06",
        content: "Mid-semester examinations will commence from January 20th, 2025.",
        type: "examination"
    },
    {
        title: "Library Timings Update",
        date: "2025-01-03",
        content: "Library will remain open till 10 PM during examination period.",
        type: "academic"
    }
];


function createNoticeElement(notice) {
    const div = document.createElement('div');
    div.className = 'notice';
    div.innerHTML = `
    <h3>${notice.title}</h3>
    <div class="notice-date">${new Date(notice.date).toLocaleDateString()}</div>
    <div class="notice-content">${notice.content}</div>
    <span class="notice-type ${notice.type}">${notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}</span>
`;
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

function filterAndDisplayNotices(type = 'all', searchQuery = '', sortType = 'date-desc') {
    const noticeBoard = document.getElementById('noticeBoard');
    noticeBoard.innerHTML = '';

    let filteredNotices = type === 'all'
        ? notices
        : notices.filter(notice => notice.type === type);

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredNotices = filteredNotices.filter(notice =>
            notice.title.toLowerCase().includes(query) ||
            notice.content.toLowerCase().includes(query) ||
            notice.type.toLowerCase().includes(query)
        );
    }

    filteredNotices = sortNotices(filteredNotices, sortType);

    if (filteredNotices.length === 0) {
        noticeBoard.innerHTML = '<div class="no-results">No notices found</div>';
        return;
    }

    filteredNotices.forEach(notice => {
        noticeBoard.appendChild(createNoticeElement(notice));
    });
}

document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        filterAndDisplayNotices(
            button.dataset.type,
            document.getElementById('searchInput').value,
            document.getElementById('sortSelect').value
        );
    });
});

document.getElementById('searchInput').addEventListener('input', () => {
    filterAndDisplayNotices(
        document.querySelector('.nav-btn.active').dataset.type,
        document.getElementById('searchInput').value,
        document.getElementById('sortSelect').value
    );
});

document.getElementById('sortSelect').addEventListener('change', () => {
    filterAndDisplayNotices(
        document.querySelector('.nav-btn.active').dataset.type,
        document.getElementById('searchInput').value,
        document.getElementById('sortSelect').value
    );
});

// Initial display of all notices when page loads
filterAndDisplayNotices();


