const form =
    document.getElementById(
        "loginForm"
    );


form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "email"
            ).value;

        const password =
            document.getElementById(
                "password"
            ).value;


        try {

            const response =
                await fetch(
                    "/api/auth/login",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email,

                                password

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message
                );

                return;

            }


            localStorage.setItem(
                "token",
                data.token
            );


            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );


            if (
                data.user.role ===
                "admin"
            ) {

                window.location.href =
                    "admin.html";

            }

            else {

                window.location.href =
                    "dashboard.html";

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