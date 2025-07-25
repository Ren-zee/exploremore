document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("mobileSidebarToggle");
  const sidebar = document.querySelector(".sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("show");
    });
  }

  // Close sidebar when clicking outside of it on mobile
  document.addEventListener("click", function (event) {
    if (window.innerWidth <= 768) {
      // Only on mobile
      const isClickInsideSidebar = sidebar && sidebar.contains(event.target);
      const isClickOnToggleBtn = toggleBtn && toggleBtn.contains(event.target);

      if (
        !isClickInsideSidebar &&
        !isClickOnToggleBtn &&
        sidebar &&
        sidebar.classList.contains("show")
      ) {
        sidebar.classList.remove("show");
      }
    }
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    if (
      window.innerWidth > 768 &&
      sidebar &&
      sidebar.classList.contains("show")
    ) {
      sidebar.classList.remove("show");
    }
  });
});
