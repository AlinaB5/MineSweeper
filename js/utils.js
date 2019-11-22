'use strict'
function setLevel(size) {
  var elBestTime = document.querySelector('.bestTime')
  switch (size) {
    case 4:
      gLevel.size = 4
      gLevel.mines = 3
      gLevel.hints = 3
      gBestBeginnerTime = localStorage.getItem('Best Time Beginner')
      if (!gBestBeginnerTime) elBestTime.innerText = `Best time for this level: not set yet`;
      else elBestTime.innerText = `Best time for this level: ${gBestBeginnerTime}`;
      break;
    case 8:
      gLevel.size = 8
      gLevel.mines = 12
      gLevel.hints = 2
      gBestMediumTime = localStorage.getItem('Best Time Medium')
      if (!gBestMediumTime) elBestTime.innerText = `Best time for this level: not set yet`;
      else elBestTime.innerText = `Best time for this level: ${gBestMediumTime}`;
      break;
    case 12:
      gLevel.size = 12
      gLevel.mines = 30
      gLevel.hints = 1
      gBestExpertTime = localStorage.getItem('Best Time Expert')
      if (!gBestExpertTime) elBestTime.innerText = `Best time for this level: not set yet`;
      else elBestTime.innerText = `Best time for this level: ${gBestExpertTime}`;
      break;
  }
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
    tempShown: false,
    isSafe:false
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

function generateLives() {
  var elLivesDiv = document.querySelector('.lives');
  elLivesDiv.innerText = '';

  if (gGame.lives === 0) {
    elLivesDiv.innerText = '0 left';
  } else {
    for (var i = 1; i <= gGame.lives; i++) {
      elLivesDiv.innerHTML += `<span>❤️</span>`;
    }
  }
  renderBoard();
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomLoc(arr) {
  var i = getRandomNumber(0, arr.length);
  var cell = arr[i];
  arr.splice(i, 1);
  return cell;
}

function clock() {
  var timePassed = Date.now() - gStartTime;
  gGame.secsPassed = Math.floor(timePassed / 1000)
  var elClock = document.querySelector('.clock');
  elClock.innerText = gGame.secsPassed
}

function getAndSetBestTime() {
  var elBestTime = document.querySelector('.bestTime');
  switch (gLevel.size) {
    case 4:
      gBestBeginnerTime = localStorage.getItem('Best Time Beginner')
      if (!gBestBeginnerTime || gBestBeginnerTime > gGame.secsPassed) {
        localStorage.setItem('Best Time Beginner', gGame.secsPassed)
        gBestBeginnerTime = 1 * localStorage.getItem('Best Time Beginner')
        elBestTime.innerText = `Best time for this level: ${gBestBeginnerTime}`;
      }
      break;
    case 8:
      gBestMediumTime = localStorage.getItem('Best Time Medium')
      if (!gBestMediumTime || gBestMediumTime > gGame.secsPassed) {
        localStorage.setItem('Best Time Medium', gGame.secsPassed)
        gBestMediumTime = 1 * localStorage.getItem('Best Time Medium')
        elBestTime.innerText = `Best time for this level: ${gBestMediumTime}`;
      }
      break;
    case 12:
      gBestExpertTime = localStorage.getItem('Best Time Expert')
      if (!gBestExpertTime || gBestExpertTime > gGame.secsPassed) {
        localStorage.setItem('Best Time Expert', gGame.secsPassed)
        gBestExpertTime = 1 * localStorage.getItem('Best Time Expert')
        elBestTime.innerText = `Best time for this level: ${gBestExpertTime}`;
      }
      break;
  }
}

