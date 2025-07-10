// Data storage - using memory with session persistence simulation
let users = [];
let posts = [];
let comments = [];
let currentUser = null;
let editingPostId = null;
let currentPostId = null;

// Memory-based storage functions (simulating localStorage)
// const memoryStorage = {
//     data: {},
//     getItem: function(key) {
//         return this.data[key] || null;
//     },
//     setItem: function(key, value) {
//         this.data[key] = value;
//     },
//     removeItem: function(key) {
//         delete this.data[key];
//     }
// };

const memoryStorage = {
  getItem: function(key) {
      return localStorage.getItem(key);
  },
  setItem: function(key, value) {
      localStorage.setItem(key, value);
  },
  removeItem: function(key) {
      localStorage.removeItem(key);
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromMemory();
    loadSampleData();
    
    // Check for saved user session
    const savedUser = memoryStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserNav();
        showSection('dashboard');
    }
    
    // Load theme preference
    const savedTheme = memoryStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        updateThemeButtons('☀️ Light Mode');
    }
    
    loadPublicBlogs();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('postForm').addEventListener('submit', handlePost);
    document.getElementById('commentForm').addEventListener('submit', handleComment);
    
    // Theme toggle - handle both buttons
    setupThemeToggle();
}

function setupThemeToggle() {
    // Remove existing event listeners and add new ones
    document.querySelectorAll('#toggleTheme').forEach(button => {
        button.removeEventListener('click', toggleTheme);
        button.addEventListener('click', toggleTheme);
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    
    if (isDark) {
        updateThemeButtons('☀️ Light Mode');
        memoryStorage.setItem('theme', 'dark');
    } else {
        updateThemeButtons('🌙 Dark Mode');
        memoryStorage.setItem('theme', 'light');
    }
}

function updateThemeButtons(text) {
    document.querySelectorAll('#toggleTheme').forEach(button => {
        button.textContent = text;
    });
}

function saveDataToMemory() {
    memoryStorage.setItem('users', JSON.stringify(users));
    memoryStorage.setItem('posts', JSON.stringify(posts));
    memoryStorage.setItem('comments', JSON.stringify(comments));
}

function loadDataFromMemory() {
    const savedUsers = memoryStorage.getItem('users');
    const savedPosts = memoryStorage.getItem('posts');
    const savedComments = memoryStorage.getItem('comments');
    
    if (savedUsers) users = JSON.parse(savedUsers);
    if (savedPosts) posts = JSON.parse(savedPosts);
    if (savedComments) comments = JSON.parse(savedComments);
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'dashboard' && currentUser) {
        loadUserBlogs();
    } else if (sectionId === 'home') {
        loadPublicBlogs();
    } else if (sectionId === 'create') {
        resetPostForm();
    }
}

function showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert ${type} show`;
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
}

async function handleRegister(e) {
    e.preventDefault();
    clearFormErrors();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    // Validation
    let hasError = false;
    if (!name) {
        document.getElementById('registerNameError').textContent = 'Name is required.';
        hasError = true;
    }
    if (!email) {
        document.getElementById('registerEmailError').textContent = 'Email is required.';
        hasError = true;
    }
    if (!password || password.length < 6) {
        document.getElementById('registerPasswordError').textContent = 'Password must be at least 6 characters.';
        hasError = true;
    }
    
    if (hasError) return;

    if (users.find(user => user.email === email)) {
        showAlert('Email already registered!', 'error');
        return;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
        id: Date.now(),
        name,
        email,
        password: hashedPassword,
        joinDate: new Date().toISOString()
    };

    users.push(newUser);
    saveDataToMemory();
    showAlert('Registration successful! Please login.');
    showSection('login');
    document.getElementById('registerForm').reset();
}

async function handleLogin(e) {
    e.preventDefault();
    clearFormErrors();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    let hasError = false;
    if (!email) {
        document.getElementById('loginEmailError').textContent = 'Email is required.';
        hasError = true;
    }
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Password is required.';
        hasError = true;
    }
    
    if (hasError) return;

    const hashedInput = await hashPassword(password);
    const user = users.find(u => u.email === email && u.password === hashedInput);

    if (user) {
        currentUser = user;
        memoryStorage.setItem('currentUser', JSON.stringify(user));
        showUserNav();
        showSection('dashboard');
        showAlert(`Welcome back, ${user.name}!`);
        document.getElementById('loginForm').reset();
    } else {
        showAlert('Invalid email or password!', 'error');
    }
}

function logout() {
    currentUser = null;
    memoryStorage.removeItem('currentUser');
    showGuestNav();
    showSection('home');
    showAlert('Logged out successfully!');
}

function showUserNav() {
    document.getElementById('guestNav').classList.add('hidden');
    document.getElementById('userNav').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    
    // Re-setup theme toggle for user nav
    setupThemeToggle();
}

function showGuestNav() {
    document.getElementById('guestNav').classList.remove('hidden');
    document.getElementById('userNav').classList.add('hidden');
    
    // Re-setup theme toggle for guest nav
    setupThemeToggle();
}

function handlePost(e) {
    e.preventDefault();
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const category = document.getElementById('postCategory').value.trim();

    if (!title || !content) {
        showAlert('Title and content are required!', 'error');
        return;
    }

    if (editingPostId) {
        // Update existing post
        const postIndex = posts.findIndex(p => p.id === editingPostId);
        if (postIndex !== -1) {
            posts[postIndex] = {
                ...posts[postIndex],
                title,
                content,
                category,
                updatedAt: new Date().toISOString()
            };
            showAlert('Post updated successfully!');
        }
        editingPostId = null;
    } else {
        // Create new post
        const newPost = {
            id: Date.now(),
            title,
            content,
            category,
            authorId: currentUser.id,
            authorName: currentUser.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        posts.push(newPost);
        showAlert('Post published successfully!');
    }

    saveDataToMemory();
    resetPostForm();
    showSection('dashboard');
}

function resetPostForm() {
    document.getElementById('postForm').reset();
    document.getElementById('createTitle').textContent = 'Create New Post';
    document.getElementById('postSubmitBtn').textContent = 'Publish Post';
    editingPostId = null;
}

function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post && post.authorId === currentUser.id) {
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postContent').value = post.content;
        document.getElementById('postCategory').value = post.category || '';
        document.getElementById('createTitle').textContent = 'Edit Post';
        document.getElementById('postSubmitBtn').textContent = 'Update Post';
        editingPostId = postId;
        showSection('create');
    }
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(p => p.id !== postId);
        comments = comments.filter(c => c.postId !== postId);
        saveDataToMemory();
        loadUserBlogs();
        loadPublicBlogs();
        showAlert('Post deleted successfully!');
    }
}

function cancelEdit() {
    resetPostForm();
    showSection('dashboard');
}

function viewPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        currentPostId = postId;
        displayPost(post);
        loadComments(postId);
        showSection('viewPost');
    }
}

function displayPost(post) {
    const postDetails = document.getElementById('postDetails');
    postDetails.innerHTML = `
        <div class="blog-card">
            <div class="blog-card-header">
                <h2>${post.title}</h2>
                <div class="blog-meta">
                    By ${post.authorName} • ${formatDate(post.createdAt)}
                    ${post.category ? ` • ${post.category}` : ''}
                </div>
            </div>
            <div class="blog-card-content">
                <div class="blog-content">${post.content.replace(/\n/g, '<br>')}</div>
            </div>
        </div>
    `;
}

function handleComment(e) {
    e.preventDefault();
    if (!currentUser) {
        showAlert('Please login to comment!', 'error');
        return;
    }

    const content = document.getElementById('commentContent').value.trim();
    if (!content) {
        showAlert('Comment cannot be empty!', 'error');
        return;
    }

    const newComment = {
        id: Date.now(),
        postId: currentPostId,
        content,
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    saveDataToMemory();
    document.getElementById('commentContent').value = '';
    loadComments(currentPostId);
    showAlert('Comment added successfully!');
}

function loadComments(postId) {
    const postComments = comments.filter(c => c.postId === postId);
    const commentsList = document.getElementById('commentsList');
    
    if (postComments.length === 0) {
        commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }

    commentsList.innerHTML = postComments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.authorName}</span>
                <span class="comment-date">${formatDate(comment.createdAt)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

function loadUserBlogs() {
    if (!currentUser) return;
    
    const userPosts = posts.filter(p => p.authorId === currentUser.id);
    const userBlogsContainer = document.getElementById('userBlogs');
    
    if (userPosts.length === 0) {
        userBlogsContainer.innerHTML = '<p>You haven\'t written any posts yet. <a href="#" onclick="showSection(\'create\')">Create your first post!</a></p>';
        return;
    }

    userBlogsContainer.innerHTML = userPosts.map(post => createBlogCard(post, true)).join('');
}

function loadPublicBlogs() {
    const publicBlogsContainer = document.getElementById('publicBlogs');
    
    if (posts.length === 0) {
        publicBlogsContainer.innerHTML = '<p>No blog posts yet. Be the first to share your thoughts!</p>';
        return;
    }

    const sortedPosts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    publicBlogsContainer.innerHTML = sortedPosts.map(post => createBlogCard(post, false)).join('');
}

function createBlogCard(post, isOwner) {
    const postComments = comments.filter(c => c.postId === post.id);
    const actions = isOwner ? 
        `<button onclick="editPost(${post.id})" class="btn btn-secondary">Edit</button>
         <button onclick="deletePost(${post.id})" class="btn btn-danger">Delete</button>` : '';

    return `
        <div class="blog-card">
            <div class="blog-card-header">
                <h3>${post.title}</h3>
                <div class="blog-meta">
                    By ${post.authorName} • ${formatDate(post.createdAt)}
                    ${post.category ? ` • ${post.category}` : ''}
                </div>
            </div>
            <div class="blog-card-content">
                <div class="blog-content">${truncateText(post.content, 150)}</div>
                <div class="blog-actions">
                    <button onclick="viewPost(${post.id})" class="btn btn-primary">Read More</button>
                    <span class="comment-count">${postComments.length} Comments</span>
                    ${actions}
                </div>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function truncateText(text, limit) {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
}

function loadSampleData() {
    // Only load sample data if no posts exist
    if (posts.length === 0) {
        const samplePosts = [
            {
                id: 1,
                title: "Welcome to BlogSphere",
                content: "This is your new favorite blogging platform! Here you can share your thoughts, stories, and connect with other writers. The platform features a clean, modern design with full responsiveness across all devices.",
                category: "Announcement",
                authorId: 0,
                authorName: "BlogSphere Team",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 2,
                title: "Tips for Better Writing",
                content: "Writing is an art that improves with practice. Here are some tips: 1) Write regularly, even if it's just for 15 minutes a day. 2) Read widely to expand your vocabulary and understanding of different styles. 3) Edit ruthlessly - first drafts are meant to be improved. 4) Write about what you're passionate about.",
                category: "Writing",
                authorId: 0,
                authorName: "BlogSphere Team",
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        
        posts = samplePosts;
        saveDataToMemory();
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
}

// Optional: close on outside click
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('userDropdown');
    const toggle = document.querySelector('.username-dropdown-toggle');
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});
