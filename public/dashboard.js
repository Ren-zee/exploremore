document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("mobileSidebarToggle");
  const sidebar = document.querySelector(".sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("show");
    });
  }
});