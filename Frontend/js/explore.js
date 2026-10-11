const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");


async function searchStudents() {

    const skill = searchInput.value.trim();

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `/api/portfolio/search?skill=${encodeURIComponent(skill)}`,
            {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            }
        );

        const portfolios = await response.json();

        if (!response.ok) {
            results.innerHTML = `<p class="empty-note">${esc(portfolios.message || "Unable to search.")}</p>`;
            return;
        }

        if (portfolios.length === 0) {

            results.innerHTML = `<p class="empty-note">No students found.</p>`;
            return;
        }

        results.innerHTML =
            portfolios
                .map(p => renderStudentCard(p, { full: true }))
                .join("");

    } catch (error) {

        console.log(error);

        results.innerHTML = `<p class="empty-note">Unable to search.</p>`;
    }
}


searchBtn.addEventListener("click", searchStudents);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") searchStudents();
});


// explore.html?skill=Video%20Editing  (from the home page category cards)
const presetSkill = new URLSearchParams(window.location.search).get("skill");

if (presetSkill) searchInput.value = presetSkill;

searchStudents();
