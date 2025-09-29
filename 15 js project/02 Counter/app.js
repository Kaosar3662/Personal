let count = 0;

const value = document.querySelector('#value');
const btns = document.querySelectorAll('.btn');

btns.forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    const g = e.currentTarget.classList;

    if (g.contains('decrease')) {
      count--;
    } else if (g.contains('increase')) {
      count++;
    } else {
      count = 0;
    }
    value.textContent = count;

    if (count > 0) {
      value.style.color = 'green';
    }
    if (count < 0) {
      value.style.color = 'red';
    }
    if (count === 0) {
      value.style.color = 'black';
    }
  });
});
