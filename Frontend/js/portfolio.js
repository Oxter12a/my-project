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


form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


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