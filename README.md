# 📝 BlogSphere – A Dynamic Blogging Platform

BlogSphere is a modern, responsive single-page blogging platform built with **HTML**, **CSS**, and **JavaScript**. It supports user registration, login, post creation, commenting, theme toggling (dark/light), and session persistence using `localStorage`.

---

## 🚀 Features

- ✅ User Registration with Validation
- ✅ Secure Login with SHA-256 Password Hashing
- ✅ Persistent User Sessions (via `localStorage`)
- ✅ Create, Edit, and Delete Posts
- ✅ Add Comments to Posts
- ✅ Real-Time Alert Notifications
- ✅ Dark/Light Mode Toggle
- ✅ Responsive UI with Modern Gradients
- ✅ User Avatar with Dropdown Logout Menu
- ✅ Footer with Quick Links & Social Icons

---

## 🔧 Tech Stack

| Layer       | Tech Used         |
|-------------|--------------------|
| Frontend    | HTML5, CSS3, JavaScript (Vanilla) |
| UI Styling  | Custom CSS, Flexbox, Grid |
| Persistence | Browser `localStorage` |
| Security    | Password Hashing via `crypto.subtle` (SHA-256) |
| Icons       | Font Awesome |

---

## 📁 Folder Structure

/
├── index.html
├── style.css
├── script.js
├── README.md


---

## 🛠 How to Run Locally

1. Clone or Download this repository.
2. Open `index.html` directly in your browser (no server required).
3. Start registering and blogging instantly!

---

## ⚙️ Developer Notes

- All data is stored in `localStorage`. No backend or database required.
- On logout, user session is removed from storage.
- The UI automatically adjusts to dark/light theme preference.
- Passwords are never stored in plain text — SHA-256 hashed before saving.

---

## 📌 Future Improvements (Optional Ideas)

- Replace `localStorage` with Firebase or MongoDB for real backend support.
- Add user profile editing.
- Add post image support and rich-text formatting.
- Filter/sort by category or date.
- Deploy on GitHub Pages or Netlify.

---

