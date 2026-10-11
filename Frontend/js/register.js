const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const button = form.querySelector("button[type=submit]");

    const payload = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        password: document.getElementById("password").value,
        department: document.getElementById("department").value.trim(),
        semester: document.getElementById("semester").value.trim(),
        category: document.getElementById("category").value
    };

    button.disabled = true;

    try {

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);
            button.disabled = false;
            return;
        }

        alert("Registration successful! Please login.");

        window.location.href = "login.html";

    } catch (error) {

        console.error("Registration error:", error);

        alert("Server connection failed");

        button.disabled = false;
    }
});
