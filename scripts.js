const sprite = document.getElementById("sprite");
const bg = document.getElementById("bg");
const medal_display = document.getElementById('medal-count');
const start_button = document.getElementById('start');
const game_over = document.getElementById('game-over-controls');
const game_over_button = document.getElementById('game-over');
const floor = document.getElementById('floor');
let in_flight = false;
let medal_count = 0;
let interval = null;
let moving_floor = null;

//Jump when we hit the space bar
document.addEventListener('keydown', (e) => {
  if (!in_flight && e.code === 'Space') {
    jump();
  }
});

//When the start button is clicked, start the game
start_button.addEventListener('click', startGame);
game_over_button.addEventListener('click', startGame);


function startGame() {
  start_button.style.display = 'none';
  game_over.style.display = 'none';
  medal_count = 0;
  medal_display.innerHTML = medal_count;

  //Show the instructions for 3 seconds
  const instructions = document.getElementById('instructions');
  instructions.style.display = 'block';
  setTimeout(() => {
    instructions.style.display = 'none';
    sprite.classList.remove('stopped');


    //send a medal immediately so it's clear something is happeneing
    sendMedal();

    //Start moving the floor with tweenmax, repeat forever
    moving_floor = TweenMax.to(floor, 8, {
      left: '-100%',
      ease: Power0.easeNone,
      repeat: -1
    });

    interval = setInterval(() => {

      //Only send the hurdle/medal if the tab has focus
      // if (!document.hasFocus()) return;

      //30% of the time send a hurdle
      if (Math.random() > .7) {
        sendHurdle();
      }
      //30% of the time send a medal
      else if (Math.random() < .15) {
        sendMedal();
      }
      //40% of the time, do nothing
    }, 500);

  }, 3000);
}

//Jump up in the air
function jump() {
  in_flight = true;
  TweenMax.to(sprite, .2, {
    bottom: '100px',
    ease:Power3.easeOut,
    onComplete: land
  })
}

//After jumping in the air, land on the ground
function land() {
  TweenMax.to(sprite, .2, {
    bottom: 0,
    ease: Power1.easeIn,
    onComplete: () => {
      in_flight = false;
    }
  })
}

function gameOver() {
  game_over.style.display = 'block';
  sprite.classList.add('stopped');
  moving_floor.kill();
  clearInterval(interval);
  clearAll();
}

/**
 * Find any dom elements with the classname 'medal' or 'hurdle' and remove them
 */
function clearAll() {
  const medals = document.querySelectorAll('.medal');
  const hurdles = document.querySelectorAll('.hurdle');
  medals.forEach(medal => medal.remove());
  hurdles.forEach(hurdle => hurdle.remove());
}

//Send a hurdle the player must jump over
function sendHurdle() {
  const hurdle = document.createElement('div');
  hurdle.classList.add('hurdle');
  bg.appendChild(hurdle);
  TweenMax.to(hurdle, 8, {
    left: '-100%',
    ease: Power0.easeNone,
    onComplete: () => {
      hurdle.remove();
    },
    onUpdate: () => {
      //If the player touches a hurdle, end the game
      if (isOverlapping(hurdle, sprite, 50)) {
        gameOver();
      }
    }
  })
}

/**
 * Send a single individual medal from the right of the screen to the left
 */
function sendMedal() {
  const medal = document.createElement('div');
  medal.classList.add('medal');
  bg.appendChild(medal);
  TweenMax.to(medal, 8, {
    left: '-100%',
    ease: Power0.easeNone,
    onComplete: () => {
      medal.remove();
    },
    onUpdate: () => {
      if (isOverlapping(medal, sprite, 50)) {
        medal_count++;
        medal_display.innerHTML = medal_count;
        medal.remove();
      }
    }
  })
}

/**
 * Check if two elements are overlapping by at least N pixels (e.g. if threshold
 * is 50, then the elements must overlap by 50 pixels)
 */
function isOverlapping(element1, element2, threshold) {
  threshold = threshold || 50;
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  return !(rect1.right < rect2.left + threshold ||
           rect1.left > rect2.right - threshold ||
           rect1.bottom < rect2.top + threshold ||
           rect1.top > rect2.bottom - threshold);
}
