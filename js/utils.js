'use strict'

//create board function 
function createBoard(num) {
  var board = [];
  for (var i = 0; i < num; i++) {
    board.push([]);
    for (var j = 0; j < num; j++) {
      board[i][j] = '';
    }
  }
  return board;
}

//countNeighbors

function countMinesAround(pos) {
  var neighborsCount = 0;
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    // if i is out of boundaries - go to the next i
    if (i < 0 || i >= gBoard.length) continue; //continue to the next i

    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      // if j is out of boundaries - go to the next j:
      if (j < 0 || j >= gBoard[0].length) continue; // continue to the next j.

      if (i === pos.i && j === pos.j) continue;
      if (gBoard[i][j] === 'X') neighborsCount++;
    }
  }
  return neighborsCount;
}


// generate random number 
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// get random location from board
function getRandomLocation() {
  var location = {
      i: getRandomNumber(0, gLevel.size - 1),
      j: getRandomNumber(0, gLevel.size - 1)
  };
  return location
}


function clock() {
  var timePassed = Date.now() - gStartTime;
  // timePassed = Math.floor(timePassed/1000)
  gGame.secsPassed = Math.floor(timePassed / 1000)
  var elClock = document.querySelector('.clock');
  elClock.innerText = gGame.secsPassed
}
