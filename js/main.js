'use strict'
// mineSweeper game 
// my globals
var MINE = '💣',
    FLAG = '🏁';

var gLevel = {
    size: 4,
    mines: 3,
    hints: 3,
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hintMode: false,
    lives: 0
}

var gBoard,
    gNumOfminesToReveal,
    gClockInterval = null,
    gStartTime,
    gUsedHintsCount;


function initGame(size = gLevel.size, mines = gLevel.mines, hints = gLevel.hints) {
    gGame.isOn = true;
    gGame.secsPassed = 0;
    gGame.lives = 3;
    gLevel.size = size;
    gLevel.mines = mines;
    gLevel.hints = hints;
    gNumOfminesToReveal = gLevel.mines
    gUsedHintsCount = 0;
    buildBoard();
    renderBoard();
    clearInterval(gClockInterval);
    gClockInterval = null;

    var elRestartButton = document.querySelector('.restart');
    elRestartButton.innerHTML = `<img class="smileyButton"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/smiling-face-with-open-mouth_1f603.png" />`;
    generateLives();
    createHints();
}

function plantMines(firstClickedI, firstClickedJ) {
    for (var i = 0; i < gLevel.mines; i++) {
        var mineLocation = getRandomLocation();
        //if it wasn't a mine before and if its not the first clicked put it there 
        if (!gBoard[mineLocation.i][mineLocation.j].isMine && gBoard[mineLocation.i][mineLocation.j] !== gBoard[firstClickedI][firstClickedJ]) {
            gBoard[mineLocation.i][mineLocation.j].isMine = true;
        } else {
            i--;
        }
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            cell.minesAroundCount = getMinesCount(i, j);
        }
    }
}

function getMinesCount(cellI, cellJ) {
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
                    strHTML += `\t<td class="${className}" >${MINE}</td>\n`
                } else {
                    if (cell.minesAroundCount > 0) {
                        strHTML += `\t<td class="${className}">${cell.minesAroundCount}</td>\n`
                    } else {
                        strHTML += `\t<td class="${className}"></td>\n`
                    }
                }
            } else {
                if (cell.isMarked) {
                    strHTML += `\t<td class="${className}" onmousedown="cellClicked(event,${i}, ${j})">${FLAG}</td>\n`
                } else {
                    strHTML += `\t<td class="${className}" onmousedown="cellClicked(event,${i}, ${j})"></td>\n`
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

        if (cell.isMine && !gGame.hintMode) {
            gGame.lives--;
            generateLives();
            if (gGame.lives === 0) {
                gameOver();
            }
        }

        if ((cell.minesAroundCount === 0 && !cell.isMine) || gGame.hintMode) expandShown(cellI, cellJ);

        checkGameOver();
        renderBoard();
    }
}

function expandShown(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {

            if (j < 0 || j >= gBoard[0].length) continue;

            if (i === cellI && j === cellJ) continue;
            if (!gGame.hintMode) {
                if (!gBoard[i][j].isMine) gBoard[i][j].isShown = true
            } else {
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
                    if (gBoard[i][j].isMine) {
                        if (!gBoard[i][j].isMarked) gameWon = false;
                    } else gameWon = false;
                    //if its not a mine and not shown game is still on
                }
            }
        }
        if (gameWon) gameOver(gameWon);
    }
}

function gameOver(isWon) {
    if (gGame.hintMode) return
    gGame.isOn = false;
    var elRestartButton = document.querySelector('.restart');
    if (isWon) {
        localStorageMang();
        var audioWon = new Audio('/sounds/Cheering.mp3');
        audioWon.play();
        elRestartButton.innerHTML = `<img class="smileyButton" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/smiling-face-with-sunglasses_1f60e.png" />`;
    } else {
        revealMines();
        var audioLost = new Audio('/sounds/Bomb.mp3');
        audioLost.play();
        elRestartButton.innerHTML = `<img class="smileyButton" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/dizzy-face_1f635.png" />`;
    }
    clearInterval(gClockInterval);
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
    if (gUsedHintsCount === gLevel.hints) elHintsDiv.innerText = '0 left';
}

function hideRevealedByHint(cellI, cellJ) {
    setTimeout(function () {
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

function localStorageMang() {
    switch (gLevel.size) {
        case 4:
            localStorage.setItem(`Best Time Beginner`, gGame.secsPassed)
            break;
        case 8:
            localStorage.setItem(`Best Time Medium`, gGame.secsPassed)
            break;
        case 12:
            localStorage.setItem(`Best Time Expert`, gGame.secsPassed)
            break;
        default:
            break;
    }
}