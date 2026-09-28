const user =
    JSON.parse(
        localStorage.getItem("user")
    );


if (!user) {

    window.location.href =
        "login.html";

}


document.getElementById(
    "welcome"
).textContent =
    `Welcome, ${user.name} 👋`;


document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    function() {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "index.html";

    }
);