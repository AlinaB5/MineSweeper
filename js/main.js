'use strict'
// mineSweeper game 
// my globals
var MINE = '💣',
    FLAG = '🏁';

var gLevel = {
    size: 4
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 0,
    safeClicks: 0,
    hintMode: false,
    manualMode: true
}

var gBoard,
    gClockInterval = null,
    gStartTime,
    gUsedHintsCount,
    gBestBeginnerTime,
    gBestMediumTime,
    gBestExpertTime;

function initGame(size = gLevel.size) {
    gGame.isOn = true;
    setLevel(size)
    gGame.secsPassed = 0;
    gGame.lives = 3;
    gGame.safeClicks = 3;
    gUsedHintsCount = 0;
    buildBoard();
    renderBoard();
    clearInterval(gClockInterval);
    gClockInterval = null;
    generateLives();
    createHints();
    var elRestartButton = document.querySelector('.restart');
    elRestartButton.innerHTML = `<img class="smileyButton"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/smiling-face-with-open-mouth_1f603.png" />`;
    var elSafeClickButn = document.querySelector('.safeClickButn');
    elSafeClickButn.innerText = `You have ${gGame.safeClicks} safe clicks`
    elSafeClickButn.disabled = false;
}

function findPossibleMineLocs(firstI, firstJ) {
    var possibleMines = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (((i >= firstI - 1) && (i <= firstI + 1)) && ((j >= firstJ - 1) && (j <= firstJ + 1))) continue
            possibleMines.push(gBoard[i][j])
        }
    }
    return setMines(possibleMines)
}

function setMines(possibleMines) {
    for (var i = 0; i < gLevel.mines; i++) {
        var cell = getRandomLoc(possibleMines)
        cell.isMine = true;
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

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            cell.minesAroundCount = getMinesCount(i, j);
        }
    }
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
            className += (cell.isSafe) ? 'SAFE' : '';

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
                }
                // else if (cell.isSafe) {
                //     strHTML += `\t<td class="${className}" onmousedown="cellClicked(event,${i}, ${j})"></td>\n`
                // } 
                else {
                    strHTML += `\t<td class="${className}" onmousedown="cellClicked(event,${i}, ${j})"></td>\n`
                }
            }
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.boardContainer');
    elBoard.innerHTML = strHTML;
    var elNumOfminesToReveal = document.querySelector('.numOfminesToReveal');
    elNumOfminesToReveal.innerText = gLevel.mines
    var elClock = document.querySelector('.clock');
    elClock.innerText = gGame.secsPassed;
}

function cellClicked(event, cellI, cellJ) {
    if (gGame.isOn) {
        if (!gClockInterval) {
            gStartTime = Date.now();
            gClockInterval = setInterval(clock, 100);
            findPossibleMineLocs(cellI, cellJ);
            setMinesNegsCount();
        }
        if (event.button === 2) return cellMarked(cellI, cellJ);

        var cell = gBoard[cellI][cellJ];
        if (cell.isMarked) return;
        if (gGame.hintMode) {
            cell.tempShown = true;
        } else if (!cell.isShown) {
            cell.isShown = true;
        }

        if (cell.isMine && !gGame.hintMode) {
            gGame.lives--;
            generateLives();
            if (gGame.lives === 0) {
                gameOver(false);
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
                if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                    gBoard[i][j].isShown = true
                    if (gBoard[i][j].minesAroundCount === 0) expandShown(i, j);
                }
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
        gLevel.mines++;
    } else {
        gBoard[cellI][cellJ].isMarked = true;
        gLevel.mines--
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
        getAndSetBestTime();
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

function showSafeClick() {
    var elSafeClickButn = document.querySelector('.safeClickButn');
    gGame.safeClicks--;
    if (gGame.safeClicks >= 0) {
        elSafeClickButn.innerText = `You have ${gGame.safeClicks} safe clicks`
        if (gGame.safeClicks === 0) elSafeClickButn.disabled = true;
        var possibleSafeClicks = getSafeClicks();
        var randLocForSafeClick = getRandomLoc(possibleSafeClicks);
        randLocForSafeClick.isSafe = true;
        setTimeout(function () {
            randLocForSafeClick.isSafe = false;
            renderBoard();
        }, 500)
        renderBoard();
    }
}

function getSafeClicks() {
    var possibleSafeClicks = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) possibleSafeClicks.push(gBoard[i][j])
        }
    }
    return possibleSafeClicks;
}

function manualMode() {
    gGame.isManual = true;
}