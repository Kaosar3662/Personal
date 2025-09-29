//using selectors inside the element
// traversing the dom

const btns = document.querySelectorAll('.question');
btns.forEach(function (wow) {
  const click = wow.querySelector('.question-btn');
  click.addEventListener('click', function () {


    btns.forEach(function (n) {
      if (n !== wow) {
        n.classList.remove("show-text")
      }
    });
    wow.classList.toggle('show-text');
  });
});

// const btns = document.querySelectorAll(".question-btn");

// btns.forEach(function (g) {
//   g.addEventListener("click", function (e) {
//    const o = e.currentTarget.parentElement.parentElement;
//     console.log(o);
//     o.classList.toggle('show-text');
//   })

// })
