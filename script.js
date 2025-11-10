function showPage(id) {
  // Приховати всі
  let pages = document.querySelectorAll(".page");
  pages.forEach(p => p.style.display = "none");
  // Показати лише потрібну
  document.getElementById(id).style.display = "block";
}

// При першому завантаженні показати головну
window.onload = function() {
  showPage('home');
};