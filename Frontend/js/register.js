const form =
    document.getElementById(
        "registerForm"
    );


form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "name"
            ).value;

        const email =
            document.getElementById(
                "email"
            ).value;

        const password =
            document.getElementById(
                "password"
            ).value;

        const department =
            document.getElementById(
                "department"
            ).value;

        const semester =
            document.getElementById(
                "semester"
            ).value;


        try {

            const response =
                await fetch(
                    "/api/auth/register",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                name,

                                email,

                                password,

                                department,

                                semester

                            })

                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                alert(
                    "Registration successful!"
                );

                window.location.href =
                    "login.html";

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