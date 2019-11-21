'use strict'
// mineSweeper game 
// my globals
var MINE = '💣';
var FLAG = '🏁';


var gLevel = {
    size: 4,
    mines: 2,
    hints: 3,
    lives: 3
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hintMode: false
}

var gBoard; //Matrix contains cell objects  
var gNumOfminesToReveal;
var gClockInterval = null;
var gStartTime;
var gUsedHintsCount = 0;

function initGame(size = gLevel.size, mines = gLevel.mines, hints = gLevel.hints) {
    gGame.isOn = true;
    gGame.secsPassed = 0;
    gLevel.size = size;
    gLevel.mines = mines;
    gLevel.hints = hints;
    gNumOfminesToReveal = gLevel.mines
    buildBoard();
    renderBoard();
    clearInterval(gClockInterval);
    gClockInterval = null;
    var elHintsDiv = document.querySelector('.hints');
    elHintsDiv.innerText = '';

    var elRestartButton = document.querySelector('.restart');
    elRestartButton.innerHTML = `<img class="smileyButton"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/smiling-face-with-open-mouth_1f603.png" />`;
    createHints();
}

function buildBoard() { // TODO putting it in utils.
    gBoard = [];
    for (var i = 0; i < gLevel.size; i++) {
        gBoard.push([])
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j] = createCell();
        }
    }
    return gBoard;
}

function createCell() {  // TODO move to utils maybe 
    var cellObj = {
        isShown: false,
        isMine: false,
        isMarked: false,
        tempShown: false
    }
    return cellObj;
}

function plantMines(firstCellI, firstCellJ) {
    for (var i = 0; i < gLevel.mines; i++) {
        var mineLocation = getRandomLocation();
        //if it wasn't a mine before put it there and is not the first clicked 
        if (!gBoard[mineLocation.i][mineLocation.j].isMine && gBoard[mineLocation.i][mineLocation.j] !== gBoard[firstCellI][firstCellJ]) {
            gBoard[mineLocation.i][mineLocation.j].isMine = true
        } else {
            i--;
        }
    }
}

function setMinesNegsCount() {// Count mines around each cell and set the cell's minesAroundCount //TODO move to utils maybe 
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            cell.minesAroundCount = countMinesAround(i, j);
        }
    }
}

// cell.minesAroundCount = setMinesNegsCount()
function countMinesAround(cellI, cellJ) {
    var minesCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;

            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isMine) minesCount++;
        }
    }
    return minesCount;
}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            var className = (cell.isShown) ? 'SHOWN' : '';
            className += (cell.tempShown) ? 'TEMP_SHOWN' : '';
            className += (cell.isMine) ? ' MINE' : '';
            className += (cell.isMarked) ? ' MARKED' : '';

            if (cell.isShown || cell.tempShown) {
                if (cell.isMine) {
                    strHTML += `\t<td data-i=${i}  data-j=${j} class="${className}" >${MINE}</td>\n`
                } else {
                    if (cell.minesAroundCount > 0) {
                        strHTML += `\t<td data-i=${i}  data-j=${j} class="${className}">${cell.minesAroundCount}</td>\n`
                    } else {
                        strHTML += `\t<td data-i=${i}  data-j=${j} class="${className}"></td>\n`
                    }
                }
            } else {
                if (cell.isMarked) {
                    strHTML += `\t<td data-i=${i}  data-j=${j} class="${className}" onmousedown="cellClicked(event,${i}, ${j})">${FLAG}</td>\n`
                } else {
                    strHTML += `\t<td data-i=${i}  data-j=${j} class="${className}" onmousedown="cellClicked(event,${i}, ${j})"></td>\n`
                }
            }
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.boardContainer');
    elBoard.innerHTML = strHTML;
    var elNumOfminesToReveal = document.querySelector('.numOfminesToReveal');
    elNumOfminesToReveal.innerText = gNumOfminesToReveal
    var elClock = document.querySelector('.clock');
    elClock.innerText = gGame.secsPassed;
}

function cellClicked(event, cellI, cellJ) {
    if (gGame.isOn) {
        if (!gClockInterval) {
            gStartTime = Date.now();
            gClockInterval = setInterval(clock, 100);
            plantMines(cellI, cellJ);
            setMinesNegsCount();
        }
        if (event.button === 2) return cellMarked(cellI, cellJ);

        var cell = gBoard[cellI][cellJ];
        if (cell.isMarked) return;
        if (gGame.hintMode) {
            cell.tempShown = true;
        } else {
            cell.isShown = true;
        }

        if (cell.isMine) gameOver();
        if (cell.minesAroundCount === 0 || gGame.hintMode) expandShown(cellI, cellJ);
        checkGameOver()
        renderBoard()
    }
}

function expandShown(cellI, cellJ) {
    // When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
    // NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {

            if (j < 0 || j >= gBoard[0].length) continue;

            if (i === cellI && j === cellJ) continue;
            if (!gBoard[i][j].isMine && !gGame.hintMode) gBoard[i][j].isShown = true//cellClicked(i, j);

            if (gGame.hintMode) {
                gBoard[i][j].tempShown = true;
                hideRevealedByHint(cellI, cellJ)
            }
        }
    }
}



function cellMarked(cellI, cellJ) {
    if (gBoard[cellI][cellJ].isMarked) {
        gBoard[cellI][cellJ].isMarked = false;
        gNumOfminesToReveal++;
    } else {
        gBoard[cellI][cellJ].isMarked = true;
        gNumOfminesToReveal--
    }
    checkGameOver()
    renderBoard();
}

function checkGameOver() {
    if (gGame.isOn) {
        var gameWon = true
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                //if there are not shown
                if (!gBoard[i][j].isShown) {
                    //if its a mine and not marked game is still on
                    if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) gameWon = false;
                    //if its not a mine and not shown game is still on
                    else gameWon = false;
                }
            }
        }
        if (gameWon) gameOver(gameWon);
    }
}

function gameOver(won) {
    if (gGame.hintMode) return
    console.log('gameOver')
    gGame.isOn = false;
    clearInterval(gClockInterval);
    var elRestartButton = document.querySelector('.restart');
    if (won) {
        elRestartButton.innerHTML = `<img class="smileyButton"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/smiling-face-with-sunglasses_1f60e.png" />`;
    } else {
        revealMines();
        elRestartButton.innerHTML = `<img class="smileyButton"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/dizzy-face_1f635.png" />`;
    }
}

function revealMines() {
    if (!gGame.isOn) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                //if its a mine that isn't shown  isShown = true 
                if (!gBoard[i][j].isShown && gBoard[i][j].isMine) gBoard[i][j].isShown = true;
            }
        }
        renderBoard();
    }
}

function activateHintMode(elHint) {
    gGame.hintMode = true;
    gUsedHintsCount++;
    var elHintsDiv = document.querySelector('.hints');
    if (gGame.isOn) elHint.innerText = '';
    if (gUsedHintsCount === gLevel.hints) elHintsDiv.innerText = '0 left'
}

function hideRevealedByHint(cellI, cellJ) {
    setTimeout(function () { // hide what hint revealed
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[0].length) continue;
                if (gBoard[i][j].tempShown) {

                    gBoard[i][j].tempShown = false;
                }
            }
        }
        gGame.hintMode = false;
        renderBoard()
    }, 1000);
}

function createHints() {
    var elHintsDiv = document.querySelector('.hints');
    for (var i = 1; i <= gLevel.hints; i++) {
        elHintsDiv.innerHTML += `<span class='hint${i}' onclick='activateHintMode(this)'>💡</span>`;
    }
}