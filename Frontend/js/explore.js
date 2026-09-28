const searchInput =
    document.getElementById(
        "searchInput"
    );


const searchBtn =
    document.getElementById(
        "searchBtn"
    );


const results =
    document.getElementById(
        "results"
    );


async function searchStudents() {

    const skill =
        searchInput.value;


    try {

        const response =
            await fetch(
                `/api/portfolio/search?skill=${encodeURIComponent(skill)}`
            );


        const portfolios =
            await response.json();


        results.innerHTML = "";


        if (portfolios.length === 0) {

            results.innerHTML =
                "<p>No students found.</p>";

            return;

        }


        portfolios.forEach(
            portfolio => {

                const student =
                    portfolio.user;


                const skills =
                    portfolio.skills
                        .map(
                            skill =>
                                `<span>${skill}</span>`
                        )
                        .join("");


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "student-card";


                card.innerHTML = `

                    <div class="student-top">

                        <div class="student-avatar">
                            👨‍💻
                        </div>

                        <span class="status">

                            ${
                                portfolio.availability
                                ? "Available"
                                : "Unavailable"
                            }

                        </span>

                    </div>


                    <h3>
                        ${student.name}
                    </h3>


                    <p class="department">

                        ${student.department || ""}
                        •
                        ${student.semester || ""}

                    </p>


                    <h4>
                        ${portfolio.category}
                    </h4>


                    <div class="student-skills">

                        ${skills}

                    </div>


                    <p>

                        ${portfolio.description}

                    </p>


                    <br>


                    ${
                        portfolio.portfolioLink
                        ?
                        `<a
                            href="${portfolio.portfolioLink}"
                            target="_blank"
                            class="profile-btn">
                            View Portfolio
                        </a>`
                        :
                        ""
                    }


                    <br>


                    <a
                        href="mailto:${student.email}"
                        class="profile-btn">

                        Contact

                    </a>

                `;


                results.appendChild(card);

            }
        );

    }

    catch (error) {

        console.log(error);

        results.innerHTML =
            "<p>Unable to search.</p>";

    }

}


searchBtn.addEventListener(
    "click",
    searchStudents
);


searchStudents();