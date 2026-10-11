// =====================================================
// Shared helpers (used by index.html and explore.html)
// =====================================================

// Escape text before putting it inside innerHTML
function esc(value) {

    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[ch]));
}


// Only allow http / https links (blocks javascript: links)
function safeUrl(url) {

    const value = String(url || "").trim();

    return /^https?:\/\//i.test(value) ? value : "";
}


function getLoggedInUser() {

    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        return null;
    }
}


// "★★★★☆" style text for an average rating
function starText(average) {

    const full = Math.round(average || 0);

    return "★".repeat(full) + "☆".repeat(5 - full);
}


function ratingLine(average, count) {

    if (!count) return "No ratings yet";

    return `⭐ ${average} (${count} ${count === 1 ? "rating" : "ratings"})`;
}


// -----------------------------------------------------
// One student card. options.full = true shows description + contact
// -----------------------------------------------------
function renderStudentCard(p, options = {}) {

    const student = p.user || {};
    const me = getLoggedInUser();
    const isMine = me && String(me.id) === String(student._id);

    const skills = (p.skills || [])
        .map(skill => `<span>${esc(skill)}</span>`)
        .join("");

    const link = safeUrl(p.portfolioLink);

    const rateRow = isMine
        ? `<p class="rate-note">This is your portfolio</p>`
        : `<div class="rate-row">
               <span class="rate-label">Rate:</span>
               <span class="rate-stars" data-id="${esc(p._id)}" data-mine="${p.myRating || 0}">
                   ${[1, 2, 3, 4, 5].map(v =>
                       `<span data-v="${v}" class="${v <= (p.myRating || 0) ? "on" : ""}">★</span>`
                   ).join("")}
               </span>
           </div>`;

    return `
        <div class="student-card">

            <div class="student-top">
                <div class="student-avatar">👨‍💻</div>
                <span class="status">
                    ${p.availability ? "Available" : "Unavailable"}
                </span>
            </div>

            <h3>${esc(student.name)}</h3>

            <p class="department">
                ${esc(student.department || "")}
                ${student.semester ? "• " + esc(student.semester) : ""}
            </p>

            <h4 class="card-category">${esc(p.category)}</h4>

            <div class="student-skills">${skills}</div>

            ${options.full && p.description
                ? `<p class="card-description">${esc(p.description)}</p>`
                : ""}

            <p class="rating-line">${ratingLine(p.averageRating, p.ratingCount)}</p>

            ${rateRow}

            ${link
                ? `<a href="${esc(link)}" target="_blank" rel="noopener" class="profile-btn">View Portfolio</a>`
                : ""}

            ${options.full && !isMine
                ? `<button type="button" class="profile-btn contact-btn" data-contact="${esc(p._id)}">Contact</button>`
                : ""}

        </div>
    `;
}


// -----------------------------------------------------
// Star rating clicks (works for every card on the page)
// -----------------------------------------------------
function paintStars(box, upTo) {

    box.querySelectorAll("span").forEach(star => {
        star.classList.toggle("on", Number(star.dataset.v) <= upTo);
    });
}

document.addEventListener("mouseover", event => {

    if (!event.target.matches(".rate-stars span")) return;

    paintStars(event.target.parentElement, Number(event.target.dataset.v));
});

document.addEventListener("mouseout", event => {

    if (!event.target.matches(".rate-stars span")) return;

    const box = event.target.parentElement;

    paintStars(box, Number(box.dataset.mine));
});

document.addEventListener("click", async event => {

    if (!event.target.matches(".rate-stars span")) return;

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login to rate a student.");
        window.location.href = "login.html";
        return;
    }

    const box = event.target.parentElement;
    const stars = Number(event.target.dataset.v);

    try {

        const response = await fetch(`/api/portfolio/${box.dataset.id}/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ stars })
        });

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                alert("Your session expired. Please login again.");
                window.location.href = "login.html";
                return;
            }

            alert(data.message);
            return;
        }

        box.dataset.mine = data.myRating;
        paintStars(box, data.myRating);

        const line = box.closest(".student-card").querySelector(".rating-line");

        line.textContent = ratingLine(data.averageRating, data.ratingCount);

    } catch (error) {

        console.log(error);
        alert("Server connection failed");
    }
});



// -----------------------------------------------------
// Contact popup: shows the student's email + phone
// -----------------------------------------------------
function closeContactModal() {

    const old = document.getElementById("contactModal");

    if (old) old.remove();
}

function showContactModal(info) {

    closeContactModal();

    const phoneDigits = String(info.phone || "").replace(/[^\d+]/g, "");

    const overlay = document.createElement("div");

    overlay.id = "contactModal";
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
        <div class="modal-box">

            <button type="button" class="modal-close" aria-label="Close">×</button>

            <h3>Contact ${esc(info.name)}</h3>

            <div class="contact-item">
                <span>📧 Email</span>
                <a href="mailto:${esc(info.email)}">${esc(info.email)}</a>
            </div>

            <div class="contact-item">
                <span>📞 Phone</span>
                ${info.phone
                    ? `<a href="tel:${esc(phoneDigits)}">${esc(info.phone)}</a>`
                    : `<em>Not provided yet</em>`}
            </div>

        </div>`;

    document.body.appendChild(overlay);
}

document.addEventListener("keydown", event => {

    if (event.key === "Escape") closeContactModal();
});

document.addEventListener("click", async event => {

    // close button, or click outside the box
    if (event.target.matches(".modal-close") || event.target.matches(".modal-overlay")) {

        closeContactModal();
        return;
    }

    const button = event.target.closest("[data-contact]");

    if (!button) return;

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login to see contact details.");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(`/api/portfolio/${button.dataset.contact}/contact`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                alert("Your session expired. Please login again.");
                window.location.href = "login.html";
                return;
            }

            alert(data.message);
            return;
        }

        showContactModal(data);

    } catch (error) {

        console.log(error);
        alert("Server connection failed");
    }
});
