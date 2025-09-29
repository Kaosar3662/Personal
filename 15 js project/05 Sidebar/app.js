const t00 = document.querySelector('.sidebar-toggle');
const s = document.querySelector(".sidebar");
const c = document.querySelector(".close-btn")

t00.addEventListener("click", function () {
  s.classList.toggle("show-sidebar")
})
c.addEventListener("click", function () {
  s.classList.toggle("show-sidebar")
})
