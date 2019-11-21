'use strict'
function setLevel(elLevelButton) {
  var level = elLevelButton.innerText
  if (level === 'Beginner') initGame(4, 3, 3);
  if (level === 'Medium') initGame(8, 12, 2);
  if (level === 'Expert') initGame(12, 30, 1);
}


function buildBoard() {
  gBoard = [];
  for (var i = 0; i < gLevel.size; i++) {
    gBoard.push([])
    for (var j = 0; j < gLevel.size; j++) {
      gBoard[i][j] = createCell();
    }
  }
  return gBoard;
}

function createCell() {
  var cellObj = {
    isShown: false,
    isMine: false,
    isMarked: false,
    tempShown: false
  }
  return cellObj;
}

function createHints() {
  var elHintsDiv = document.querySelector('.hints');
  elHintsDiv.innerText = '';
  for (var i = 1; i <= gLevel.hints; i++) {
    elHintsDiv.innerHTML += `<span class='hint${i}' onclick='activateHintMode(this)'>💡</span>`;
  }
}

function createLives() {
  var elLivesDiv = document.querySelector('.lives');
  elLivesDiv.innerText = '';
  for (var i = 0; i < gGame.lives; i++) {
    elLivesDiv.innerHTML += `<span>❤️</span>`;
  }
  renderBoard();
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomLocation() {
  var location = {
    i: getRandomNumber(0, gLevel.size - 1),
    j: getRandomNumber(0, gLevel.size - 1)
  };
  return location
}

function clock() {
  var timePassed = Date.now() - gStartTime;
  gGame.secsPassed = Math.floor(timePassed / 1000)
  var elClock = document.querySelector('.clock');
  elClock.innerText = gGame.secsPassed
}