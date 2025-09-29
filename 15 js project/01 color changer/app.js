const colors = ['green', 'red', 'rgba(103,122,200)', '#f15025'];
const btn = document.getElementById('btn');
const color = document.querySelector('.color');
btn.addEventListener('click', function () {
  //  Generate Random number beetween 0 - 3
  const randomNumber = getRandomNumber();
  document.body.style.backgroundColor = colors[randomNumber];
  color.textContent = colors[randomNumber];
  console.log(randomNumber)
});
function getRandomNumber() {
  return Math.floor(Math.random()* colors.length);
}