function toggleNotices(category) {
    const allNotices = document.querySelectorAll('.notices');
    allNotices.forEach(notice => {
        notice.style.display = 'none';
    });

    const selectedNotices = document.querySelectorAll('.' + category);
    selectedNotices.forEach(notice => {
        notice.style.display = 'block';
    });
}

function toggleNotice(element) {
    const notice = element.closest('.notice');
    notice.classList.toggle('active');
}

function showAdminSection() {
    document.getElementById('admin-section').style.display = 'block';
    document.querySelectorAll('.notices').forEach(section => section.style.display = 'none');
}

function addNotice() {
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    if (title && description && date) {
        const newNotice = document.createElement('div');
        newNotice.className = 'notice';
        newNotice.innerHTML = `
            <p class="notice-heading" onclick="toggleNotice(this)">${title}</p>
            <div class="notice-content">
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Date:</strong> ${date}</p>
            </div>
        `;

        document.querySelector(`.notices.${category}`).appendChild(newNotice);
        alert('Notice added successfully!');
        document.getElementById('add-notice-form').reset();
    } else {
        alert('Please fill out all fields.');
    }
}

function showAdminSection() {
    document.getElementById('admin-section').style.display = 'block';
    document.querySelectorAll('.notices').forEach(section => section.style.display = 'none');
}


function toggleNotices(category) {
    // Hide the admin section when switching to a notice category
    document.getElementById('admin-section').style.display = 'none';

    // Hide all notice categories
    const allNotices = document.querySelectorAll('.notices');
    allNotices.forEach(notice => {
        notice.style.display = 'none';
    });

    // Show the selected notice category
    const selectedNotices = document.querySelectorAll('.' + category);
    selectedNotices.forEach(notice => {
        notice.style.display = 'block';
    });
}

function addNotice() {
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    if (title && description && date) {
        const newNotice = document.createElement('div');
        newNotice.className = 'notice';
        newNotice.innerHTML = `
            <p class="notice-heading" onclick="toggleNotice(this)">${title}</p>
            <div class="notice-content">
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Date:</strong> ${date}</p>
            </div>
        `;

        newNotice.style.animation = "fadeIn 0.5s ease"; // Smooth animation
        document.querySelector(`.notices.${category}`).appendChild(newNotice);

        alert('Notice added successfully!');
        document.getElementById('add-notice-form').reset();
    } else {
        alert('Please fill out all fields.');
    }
}


