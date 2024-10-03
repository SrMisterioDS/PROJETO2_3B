const sidebarToggle = document.querySelector('.sidebar-toggle');

// Add an event listener to the sidebar toggle
sidebarToggle.addEventListener('click', () => {
  // Toggle the active class on the sidebar toggle
  sidebarToggle.classList.toggle('active');
});