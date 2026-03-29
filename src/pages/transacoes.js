const themeToggle = document.getElementById("theme-toggle");
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

function toggleMenu() {
  navbar.classList.toggle("nav-open");
}

themeToggle.addEventListener("click", toggleTheme);
menuToggle.addEventListener("click", toggleMenu);
