const token =
    localStorage.getItem(
        "token"
    );


const user =
    JSON.parse(
        localStorage.getItem(
            "user"
        )
    );


if (
    !token ||
    !user ||
    user.role !== "admin"
) {

    window.location.href =
        "login.html";

}


async function loadAdmin() {

    try {

        const statsResponse =
            await fetch(
                "/api/admin/stats",
                {

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const stats =
            await statsResponse.json();


        document.getElementById(
            "stats"
        ).innerHTML = `

            <div class="skill-card">

                <h3>
                    Total Users
                </h3>

                <h2>
                    ${stats.users}
                </h2>

            </div>


            <div class="skill-card">

                <h3>
                    Portfolios
                </h3>

                <h2>
                    ${stats.portfolios}
                </h2>

            </div>


            <div class="skill-card">

                <h3>
                    Video Editing
                </h3>

                <h2>
                    ${stats.categories.videoEditing}
                </h2>

            </div>


            <div class="skill-card">

                <h3>
                    UI/UX
                </h3>

                <h2>
                    ${stats.categories.uiux}
                </h2>

            </div>

        `;


        const usersResponse =
            await fetch(
                "/api/admin/users",
                {

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const users =
            await usersResponse.json();


        const usersContainer =
            document.getElementById(
                "users"
            );


        usersContainer.innerHTML = "";


        users.forEach(
            currentUser => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "student-card";


                card.innerHTML = `

                    <h3>
                        ${currentUser.name}
                    </h3>

                    <p>
                        ${currentUser.email}
                    </p>

                    <p>
                        ${currentUser.department || ""}
                    </p>

                    <p>
                        ${currentUser.semester || ""}
                    </p>

                    <p>
                        Role:
                        ${currentUser.role}
                    </p>

                `;


                usersContainer.appendChild(
                    card
                );

            }
        );

    }

    catch (error) {

        console.log(error);

        alert(
            "Unable to load admin dashboard"
        );

    }

}


document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    function() {

        localStorage.clear();

        window.location.href =
            "index.html";

    }
);


loadAdmin();