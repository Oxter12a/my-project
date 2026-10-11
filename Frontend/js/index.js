// =====================================================
// Home page: real counts, real students, real nav
// =====================================================

// category name -> id of the number on the page
const COUNT_IDS = {
    "Video Editing": "video-editing-count",
    "UI/UX Design": "uiux-count",
    "Web Development": "web-development-count",
    "Photography": "photography-count",
    "Content Writing": "content-writing-count",
    "Marketing": "marketing-count"
};


// ---------- category counts ----------
async function loadCounts() {

    try {

        const response = await fetch("/api/categories/counts");
        const data = await response.json();

        data.forEach(category => {

            const element = document.getElementById(COUNT_IDS[category._id]);

            if (element) element.textContent = category.count;
        });

    } catch (error) {

        console.error("Error loading category counts:", error);
    }
}


// ---------- hero card + featured students ----------
function renderHeroCard(top) {

    const box = document.getElementById("heroCard");

    if (!top) {

        box.innerHTML = `
            <div class="profile-preview">
                <div class="profile-image">🎓</div>
                <h3>Your name here</h3>
                <p>Be the first student to join Campus Connect</p>
                <div class="profile-bottom">
                    <a href="register.html" class="available">Create your portfolio →</a>
                </div>
            </div>`;

        return;
    }

    const student = top.user;

    box.innerHTML = `
        <div class="profile-preview">
            <div class="profile-image">👨‍💻</div>
            <h3>${esc(student.name)}</h3>
            <p>${esc(student.department || "")} ${student.semester ? "• " + esc(student.semester) : ""}</p>
            <div class="skills">
                <span>${esc(top.category)}</span>
                ${(top.skills || []).slice(0, 2).map(s => `<span>${esc(s)}</span>`).join("")}
            </div>
            <div class="profile-bottom">
                <span>${top.ratingCount ? "⭐ " + top.averageRating : "New"}</span>
                <span class="available">${top.availability ? "● Available" : "● Unavailable"}</span>
            </div>
        </div>`;
}

async function loadStudents() {

    const grid = document.getElementById("featuredStudents");

    try {

        const response = await fetch("/api/portfolio?limit=3&sort=top", {
            headers: authHeader()
        });

        const students = await response.json();

        renderHeroCard(students[0]);

        if (students.length === 0) {

            grid.innerHTML = `<p class="empty-note">No students have joined yet. Be the first to create a portfolio!</p>`;
            return;
        }

        grid.innerHTML = students.map(s => renderStudentCard(s)).join("");

    } catch (error) {

        console.error("Error loading students:", error);
        grid.innerHTML = `<p class="empty-note">Unable to load students.</p>`;
    }
}

function authHeader() {

    const token = localStorage.getItem("token");

    return token ? { "Authorization": `Bearer ${token}` } : {};
}


// ---------- navbar: show Dashboard / Logout when logged in ----------
function setupNav() {

    const nav = document.querySelector(".nav-buttons");

    if (!nav || !localStorage.getItem("token")) return;

    const user = getLoggedInUser();
    const home = user && user.role === "admin" ? "admin.html" : "dashboard.html";

    nav.innerHTML = `
        <a href="${home}" class="login-btn">Dashboard</a>
        <a href="#" id="navLogout" class="register-btn">Logout</a>`;

    document.getElementById("navLogout").addEventListener("click", event => {

        event.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });
}


setupNav();
loadCounts();
loadStudents();
