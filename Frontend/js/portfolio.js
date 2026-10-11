const form =
    document.getElementById(
        "portfolioForm"
    );


const token =
    localStorage.getItem(
        "token"
    );


if (!token) {

    window.location.href =
        "login.html";

}


// Fill the form with the portfolio that was created at registration
async function loadMyPortfolio() {

    try {

        const response = await fetch("/api/portfolio/mine", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        const mine = await response.json();

        if (!mine) return;

        document.getElementById("phone").value = (mine.user && mine.user.phone) || "";
        document.getElementById("category").value = mine.category || "";
        document.getElementById("skills").value = (mine.skills || []).join(", ");
        document.getElementById("description").value = mine.description || "";
        document.getElementById("portfolioLink").value = mine.portfolioLink || "";
        document.getElementById("availability").checked = mine.availability !== false;

    } catch (error) {

        console.log(error);
    }
}

loadMyPortfolio();


form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const phone =
            document.getElementById(
                "phone"
            ).value.trim();


        const category =
            document.getElementById(
                "category"
            ).value;


        const skillsText =
            document.getElementById(
                "skills"
            ).value;


        const description =
            document.getElementById(
                "description"
            ).value;


        const portfolioLink =
            document.getElementById(
                "portfolioLink"
            ).value;


        const availability =
            document.getElementById(
                "availability"
            ).checked;


        const skills =
            skillsText
                .split(",")
                .map(
                    skill =>
                        skill.trim()
                )
                .filter(
                    skill =>
                        skill !== ""
                );


        try {

            const response =
                await fetch(
                    "/api/portfolio",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                phone,

                                category,

                                skills,

                                description,

                                portfolioLink,

                                availability

                            })

                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                alert(
                    "Portfolio saved successfully!"
                );

                window.location.href =
                    "dashboard.html";

            }

            else {

                alert(
                    data.message
                );

            }

        }

        catch (error) {

            console.log(error);

            alert(
                "Server connection failed"
            );

        }

    }
);