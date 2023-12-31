import { set_key, get_key } from "./webstorage.js";
let start = null;
let duration = 2000; // duration of animation in milliseconds
const car = document.getElementsByClassName('car')[0]
const way = document.getElementsByClassName('way')[0]
let collidedCount = 0
let totalHeight = way.offsetHeight; // Total height of the element
let currentPosition = 0; // Start position
let speed = 5; // Speed of the animation in pixels per frame
let scoreCache = 0
let speedChange = 0
let topScore = 0
const e = document.createElement("div");
e.style.position = 'absolute';
e.style.width = '80px';
e.style.height = '71px';
e.style.backgroundSize = '100% auto';
e.style.backgroundImage = "url('/assets/barrier.png')";
e.style.left = Math.random() < 0.5 ? '196px' : '85px';
e.style.top = '0';
let isSigned = true
const name = document.querySelector("#gameover > div > input")
document.querySelector("#gameover > div > button").addEventListener('click', () => {
  let id = null
  console.log(!get_key('id'))
  if (!isSigned) {
    if (!name.value) {
      return
    } else {
      id = name.value
    }
  } else {
    id = get_key('id')
  }
  const url = 'http://localhost:8080/score';
  const data = new FormData();

  data.append('name', id);
  data.append('score', topScore);
  fetch(url, {
    method: 'POST',
    body: data
  }).then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    scoreCache = 0
    collidedCount = 0
    let hearts = document.querySelector("body > div > div.gameBoard > div.heart > div:nth-child(2)")
    hearts.textContent = 100
    document.querySelector("body > div > div.gameBoard > div.score > div:nth-child(4)")
        .textContent = 0
    for (let i = 0; i < speedChange; i++) {
      duration = duration * 2
      speed = speed / 2
      speedChange = speedChange - 1
    }
    document.querySelector("body > div > div.gameBoard > div.car > img")
            .setAttribute('src', '/assets/car.png')
    set_key('id', id)
    document.getElementById('gameover').style.display = 'none';
    window.requestAnimationFrame(wayStep)
    window.requestAnimationFrame(stepProvider())
})
.catch(error => {
    console.log('There was a problem with the fetch operation: ' + error.message);
});
  


})
const board = document.getElementsByClassName('gameBoard')[0]
board.appendChild(e)
document.querySelector("#start > div > button").addEventListener('click', startGame)
function isCollide(a, b) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();
  return !(
    ((aRect.top + aRect.height) < (bRect.top)) ||
    (aRect.top > (bRect.top + bRect.height)) ||
    ((aRect.left + aRect.width) < bRect.left) ||
    (aRect.left > (bRect.left + bRect.width))
  );
}


function switchCarDirection(car) {
  // Apply a CSS transform to the image
  if (car.getAttribute('d') == 'right') {
    car.style.transform = 'translateX(110px) rotate(15deg)';
    setTimeout(function () {
      car.style.transform = 'translateX(110px) rotate(0deg)';
    }, 250);
    car.setAttribute('d', 'left')
  } else {
    car.style.transform = 'translateX(0px) rotate(-15deg)';
    setTimeout(function () {
      car.style.transform = 'translateX(0px) rotate(0deg)';
    }, 250);
    car.setAttribute('d', 'right')
  }
}

document.addEventListener('keydown', function (event) {
  switch (event.key) {
    case 'ArrowLeft':
      console.log('Left key pressed');
      if (car.getAttribute('d') == 'left') {
        switchCarDirection(car)
      }
      break;
    case 'ArrowUp':
      console.log('Up key pressed');
      break;
    case 'ArrowRight':
      console.log('Right key pressed');
      if (car.getAttribute('d') == 'right') {
        switchCarDirection(car)
      }
      break;
    case 'ArrowDown':
      console.log('Down key pressed');
      break;
  }
});

function wayStep() {
  // Move the background
  currentPosition += speed;
  way.style.backgroundPosition = `center ${currentPosition}%`;
  // Check if we've moved 100px
  if (currentPosition % 100 === 0) {
    const count = document.querySelector("body > div > div.gameBoard > div.score > div:nth-child(4)")
    count.textContent = parseInt(count.textContent) + 1
    scoreCache = parseInt(scoreCache) + 1
    if (parseInt(scoreCache) == 120 && speedChange < 4) {
      duration = duration / 2
      speed = speed * 2
      speedChange = speedChange + 1
    }
  }
  if (collidedCount >= 5) {

  }
  // If the animation hasn't finished, keep going
  else if (currentPosition < totalHeight) {
    requestAnimationFrame(wayStep);
  } else {
    // Reset the position and start again for infinite animation
    currentPosition = 0;
    requestAnimationFrame(wayStep);
  }
}
function stepProvider() {
  try {
    console.log(e)
  }
  catch {

  }
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  console.log(hours + ":" + minutes + ":" + seconds);
  const step = (timestamp) => {
    if (!start) start = timestamp;
    if (collidedCount >= 5) {
      document.querySelector("body > div > div.gameBoard > div.score > div:nth-child(2)")
        .textContent = topScore
      topScore = scoreCache > topScore ? scoreCache:topScore
      if (!get_key('id')) {
        isSigned = false
        name.style.display = 'initial'
      }
      document.getElementById('gameover').style.display = 'flex';
      return
    }
    const progress = timestamp - start;
    const fraction = Math.min(progress / duration, 1);
    setInterval(() => { }, 3000)
    e.style.top = `${fraction * 100}%`;


    if (isCollide(e, car)) {
      if (collidedCount < 5) {
        collidedCount = collidedCount + 1
        if (collidedCount == 1) {
          document.querySelector("body > div > div.gameBoard > div.car > img")
            .setAttribute('src', '/assets/car-crashed.png')
        }
        e.style.animation = "explode 0.005s linear"
        e.style.top = '0%'
        e.style.left = Math.random() < 0.5 ? '196px' : '85px';
        start = null; // Reset the start time
        window.requestAnimationFrame(step);
        let hearts = document.querySelector("body > div > div.gameBoard > div.heart > div:nth-child(2)")
        hearts.textContent = parseInt(hearts.textContent) - 20
      }
      else {

      }
    }
    if (e.style.top == '100%') {
      e.style.left = Math.random() < 0.5 ? '196px' : '85px';
      start = null; // Reset the start time
      window.requestAnimationFrame(step); // Restart the animation
    }
    else if (progress < duration) {
      window.requestAnimationFrame(step);
    } else {
      start = null;
      window.requestAnimationFrame(step);
    }
  }
  return step
}


function startGame() {
  if (get_key('id')) {
    let pp = fetch('http://localhost:8080/score/' + encodeURIComponent(get_key('id')))
        .then(response => response.json()).then(data => {
          document.querySelector("body > div > div.gameBoard > div.score > div:nth-child(2)")
        .textContent = data[0].score  // Access your data here
      });
  }
  document.getElementById('start').style.display = 'none'
  window.requestAnimationFrame(wayStep)
  window.requestAnimationFrame(stepProvider())
}






