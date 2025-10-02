let display = document.getElementById('display');
let currentValue = '';

function appendValue(value) {
  currentValue += value;
  display.value = currentValue;
}

function clearDisplay() {
  currentValue = '';
  display.value = '';
}

function calculateResult() {
  try {
    currentValue = eval(currentValue).toString();
    display.value = currentValue;
  } catch (error) {
    display.value = 'Error';
    currentValue = '';
  }
}
