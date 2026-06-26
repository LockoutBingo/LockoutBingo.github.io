document.addEventListener("DOMContentLoaded", () => {
    const menuContainer = document.querySelector(".nav-menu-container");
    const dropdown = document.getElementById("menu-dropdown");
    const menuButton = document.getElementById("menu-button");

    menuButton.addEventListener("click", () => {
        dropdown.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
        if (!menuContainer.contains(event.target)) {
            dropdown.classList.remove("show");
        }
    });
});
