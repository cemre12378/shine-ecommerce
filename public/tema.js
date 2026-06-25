// ✨ TEMA YÖNETİM DOSYASI - TÜM SAYFALARDA KULLANILIR

function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    toggle.setAttribute("title", theme === "dark" ? "Açık Tema" : "Koyu Tema");
  }
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
}

// Sayfa yüklendiğinde tema başlat
document.addEventListener("DOMContentLoaded", initTheme);