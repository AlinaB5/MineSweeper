'use strict'
// mineSweeper game 
// my globals
var MINE = '💣';
var FLAG = '🏁';
// var EMPTY = '';


var gLevel = {
    size: 4,
    mines: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard; //Matrix contains cell objects  
var gMines = [];
var gNumOfminesToReveal = gLevel.mines

function initGame(size=gLevel.size, mines=gLevel.mines) {
    //create the board, all cells are hidden 
    gGame.isOn = true;
    gLevel.size = size
    gLevel.mines = mines
    buildBoard();
    renderBoard();
    plantMines();
    setMinesNegsCount();
    var elRestartButton = document.querySelector('.restart');
    elRestartButton.innerHTML = `<img class="smiley"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/smiling-face-with-open-mouth_1f603.png" />`;
}

function buildBoard() { // TODO putting it in utils.

    //Builds the board (gets size from gLevel.size )
    // Set mines at random locations (gets numOfMines from gLevel.mines)
    // Call setMinesNegsCount()
    // Return the created board
    gBoard = [];
    for (var i = 0; i < gLevel.size; i++) {
        gBoard.push([])
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j] = createCell(i, j);
        }
    }
    console.table(gBoard);
    // gBoard[0][1].isMine = true;
    // gBoard[0][3].isMine = true;

    return gBoard;
}

function plantMines() {
    for (var i = 0; i < gLevel.mines; i++) {
        var mineLocation = getRandomLocation();
        //if it wasn't a mine before put it there 
        if (!gBoard[mineLocation.i][mineLocation.j].isMine) {
            gBoard[mineLocation.i][mineLocation.j].isMine = true
            gMines.push(mineLocation);

        } else {
            i--
        }
    }
}
console.log(gMines)


function createCell(i, j) {  // TODO move to utils maybe 
    var cellObj = {
        location: { i, j },
        isShown: false,
        isMine: false,
        isMarked: false,
    }
    return cellObj;
}


function setMinesNegsCount() {// Count mines around each cell and set the cell's minesAroundCount //TODO move to utils maybe 
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            cell.minesAroundCount = countMinesAround(cell);
        }
    }
}
// cell.minesAroundCount = setMinesNegsCount()
function countMinesAround(cell) {
    var minesCount = 0;
    for (var i = cell.location.i - 1; i <= cell.location.i + 1; i++) {
        // if i is out of boundaries - go to the next i
        if (i < 0 || i >= gBoard.length) continue; //continue to the next i

        for (var j = cell.location.j - 1; j <= cell.location.j + 1; j++) {
            // if j is out of boundaries - go to the next j:
            if (j < 0 || j >= gBoard[0].length) continue; // continue to the next j.

            if (i === cell.location.i && j === cell.location.j) continue;
            if (gBoard[i][j].isMine) minesCount++;
        }
    }
    return minesCount;
}

function renderBoard(board) {     // Render the board as a <table> to the page 
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            var className = (cell.isShown) ? 'SHOWN' : '';
            className += (cell.isMine) ? ' MINE' : '';
            className += (cell.isMarked) ? ' MARKED' : '';

            if (cell.isShown) {
                if (cell.isMine) {
                    strHTML += `\t<td data-i=${i}  data-j=${j} class="${className}" >${MINE}</td>\n`
                } else {
                    if(cell.minesAroundCount>0){
                    strHTML += `\t<td data-i=${i}  data-j=${j} class="${className}">${cell.minesAroundCount}</td>\n`
                    }else {
                        strHTML +=  `\t<td data-i=${i}  data-j=${j} class="${className}"></td>\n`
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
}

function cellClicked(event, cellI, cellJ) {
    if (gGame.isOn) {
        if (event.button === 2) return cellMarked(cellI, cellJ);
        // gFirstClick = true 
        // if(gFirstClick) {
        //     plantMines();
        //     setMinesNegsCount();
        // }
        // Called when a cell (td) is clicked
        var cell = gBoard[cellI][cellJ];
        cell.isShown = true;
        if (cell.isMine) gameOver();
        if (cell.minesAroundCount === 0) expandShown(cellI, cellJ);
        checkGameOver()
        renderBoard()
    }
}

function expandShown(cellI, cellJ) {
    // When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
    // NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        // if i is out of boundaries - go to the next i
        if (i < 0 || i >= gBoard.length) continue; //continue to the next i

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // if j is out of boundaries - go to the next j:
            if (j < 0 || j >= gBoard[0].length) continue; // continue to the next j.

            if (i === cellI && j === cellJ) continue;
            if (!gBoard[i][j].isMine) gBoard[i][j].isShown = true//cellClicked(i, j);

        }
    }

}


function cellMarked(cellI, cellJ) { //Called on right click to mark a cell (suspected to be a mine) 
    //if the cell was marked before, remove the mark
    if (gBoard[cellI][cellJ].isMarked) {
        gBoard[cellI][cellJ].isMarked = false;
    } else {
        gBoard[cellI][cellJ].isMarked = true;
        if (gBoard[cellI][cellJ].isMine && gNumOfminesToReveal>0) gNumOfminesToReveal--
    }
    checkGameOver()
    renderBoard();
}

function checkGameOver() {
    //     Game ends when all mines are marked and all the other cells are shown.
    if (gGame.isOn) {
        var gameWon = true
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                //if there is a cell that is not shown check if its a mine, if its a mine check if its marked
                if (!gBoard[i][j].isShown) {
                    if (gBoard[i][j].isMine) {
                        if (!gBoard[i][j].isMarked) gameWon = false;
                    }
                }
            }
        }
        console.log('gameWon', gameWon);
        //if all mines are marked and all cells that are not mines are shown gameover 
        if (gameWon) gameOver(gameWon);
    }
}

function gameOver(won) {
    console.log('gameOver')
    var elRestartButton = document.querySelector('.restart');
    if (won) {
        elRestartButton.innerHTML = `<img class="smiley"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/smiling-face-with-sunglasses_1f60e.png" />`;
    } else {
        gGame.isOn = false;
        revealMines();
        gNumOfminesToReveal = 0;
        elRestartButton.innerHTML = `<img class="smiley"
    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/232/dizzy-face_1f635.png" />`;
    }
}

function revealMines() {
    if (!gGame.isOn) {
        for (var i = 0; i < gMines.length; i++) {
            var mineLocation = gMines[i];
            gBoard[mineLocation.i][mineLocation.j].isShown = true;
        }
    }
}