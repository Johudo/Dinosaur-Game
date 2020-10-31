'use strict'
let player = $('#player');

let state = null;
let commands = [];

let duration = 500;
let frame = 50; // px

let distance = 9;
let height = 5;

let currentCommandNum = 0
let counter;

let wallCount = 0;

let timeoutOpen;


generateWalls()

$('#run-code').on('click', () => {
    let code = $('#coding-textarea').val();
    
    if (createCommandArray(code)) {
        //console.log(commands);
        newGame();
    }
});





// ----------- Coding Window Validation ----------- //

function createCommandArray(code) {
    code = code.split('\n');

    commands = [];

    for (let i = 0; i < code.length; i++) {
        if (code[i].slice(0,4) === 'Run(' && code[i][5] === ')') {
            if(Number(code[i][4]) < 1 || Number(code[i][4]) > 9) {
                alert('Parametr Error (from 1 to 9): String#' + (i + 1) + ' \"' + code[i] + '\"');
                //console.log('Parametr Error (from 1 to 4): String#' + (i + 1), code[i]);
                return false;
            }

            commands.push({
                type: 'running',
                data: Number(code[i][4])
            });
        }
        
        else if (code[i].slice(0,4) === 'Sit(' && code[i][5] === ')') {
            if(Number(code[i][4]) < 1 || Number(code[i][4]) > 9) {
                alert('Parametr Error (from 1 to 9): String#' + (i + 1) + ' \"' + code[i] + '\"');
                //console.log('Parametr Error (from 1 to 4): String#' + (i + 1), code[i]);
                return false;
            }

            commands.push({
                type: 'sitting',
                data: Number(code[i][4])
            });
        } 
        
        else if (code[i].slice(0,5) === 'Jump(' && code[i][6] === ')') {
            if(Number(code[i][5]) < 1 || Number(code[i][5]) > 4) {
                alert('Parametr Error (from 1 to 4): String#' + (i + 1) + ' \"' + code[i] + '\"');
                //console.log('Parametr Error (from 1 to 4): String#' + (i + 1), code[i]);
                return false;
            }

            commands.push({
                type: 'jumping',
                data: Number(code[i][5])
            });
        }

        else {
            alert('Error: String#' + (i + 1) + ' \"' + code[i] + '\"');
            //console.log('Error: String #' + (i + 1), code[i]);
            return false;
        }
    }

    return true;
}



// ----------- Game Logic ----------- //

function gameStep() {
    if (state) {
        state = doAction(state, commands[currentCommandNum].data);
        checkWallTouch();
        checkWin();

        if (timeoutOpen) {
            setTimeout(gameStep, duration);  
        }
    }
    else {
        currentCommandNum = counter();
        let currentCommand = commands[currentCommandNum];

        if(currentCommand) {
            state = doAction(commands[currentCommandNum].type, commands[currentCommandNum].data);
            checkWallTouch();
            checkWin();

            if (timeoutOpen) 
                setTimeout(gameStep, duration); 
        }
    }
}


function doAction(state, data = null) {
    let currentAction = state.slice(0,7);
    if (currentAction === 'jumping')
        return playerJump(state, data);
    else if (currentAction === 'sitting')
        return playerSit(state);
    else if (currentAction === 'running')
        return playerRun(state);
}


function newGame() {
    counter = makeCounter();

    player.css('bottom', '0px');
    player.css('left', '0px');
    player.css('height', (2 * frame) + 'px');
    player.css('width', frame + 'px');

    timeoutOpen = true;

    if (timeoutOpen)
        setTimeout(gameStep, duration);
}


function generateWalls() {
    let currentDistance = 2

    while (currentDistance < distance) {
        let holeHeight = getRandomInt(0, height + 1);

        $('#game-window').prepend('<div class=\"wall-block\" id=\"wall' + wallCount + '\"></div>');
        $('#wall' + wallCount).css('left', (currentDistance * frame) + 'px');

        $('#wall' + wallCount).prepend('<div class=\"wall\" id=\"wall' + wallCount + '__bot\"></div>');
        $('#wall' + wallCount + '__bot').css('height', ((height - holeHeight) * frame) + 'px');

        $('#wall' + wallCount).prepend('<div class=\"wall\" id=\"wall' + wallCount + '__top\"></div>');
        $('#wall' + wallCount + '__top').css('height', (holeHeight * frame) + 'px');
        $('#wall' + wallCount + '__top').css('margin-bottom', (2 * frame) + 'px');
        

        let randomDistance = getRandomInt(2,4);
        currentDistance += randomDistance;
        wallCount++;
    }
}


function checkWin() {
    if ( getAbsoluteParametr(player, 'left') === (distance * frame) ) {
        gameOver('You WIN!');
    }
}


function checkWallTouch() {
    for (let i = 0; i < wallCount; i++) {
        let thisWall = $('#wall' + i);

        let wall_Left = getAbsoluteParametr(thisWall, 'left');
        let player_Left = getAbsoluteParametr(player, 'left');
        
        if (wall_Left === player_Left) {      
            let thisWallTop = $('#wall' + i + '__top');
            let wallTop_Bottom = ((height + 1) * frame) - getAbsoluteParametr(thisWallTop, 'height');
    
            let player_Bottom = getAbsoluteParametr(player, 'bottom');
            let playerHeight = commands[currentCommandNum].type === 'sitting' ? frame : 2 * frame;
                  
            if (wallTop_Bottom < (player_Bottom + playerHeight) || (wallTop_Bottom - 2 * frame) > player_Bottom) {
                gameOver('You LOSE!');
            }
        }
    }
}


function gameOver(message) {
    alert(message);
    timeoutOpen = false;
    state = null;
    commands = [];
}


// ----------- Control Functions ----------- //

function playerRun(state) { 
    let left = getAbsoluteParametr(player, 'left');
    player.css('left', (left + frame) + 'px');

    if (--commands[currentCommandNum].data)
        return state;
    
    return null;
}


function playerSit(state) { 
    if (state === 'sitting') {
        player.height(frame);
        player.width(2 * frame);
        return 'sitting-move';
    }

    else if (state === 'sitting-move') {
        let left = getAbsoluteParametr(player, 'left');
        player.css('left', (left + frame) + 'px');

        if (--commands[currentCommandNum].data)
            return state;
        
        return 'sitting-end'
    }

    else if (state === 'sitting-end') {
        player.height(2 * frame);
        player.width(frame);

        let left = getAbsoluteParametr(player, 'left');
        player.css('left', (left + frame) + 'px');

        return null;
    }
}


function playerJump(state, jumpHeight) {
    if (state === 'jumping') {
        let bottom = getAbsoluteParametr(player, 'bottom');
        player.css('bottom', (bottom + jumpHeight * frame) + 'px');

        let left = getAbsoluteParametr(player, 'left');
        player.css('left', (left + frame) + 'px');

        return 'jumping-end';
    }

    else if (state === 'jumping-end') {
        let bottom = getAbsoluteParametr(player, 'bottom');
        player.css('bottom', (bottom - jumpHeight * frame) + 'px');

        let left = getAbsoluteParametr(player, 'left');
        player.css('left', (left + frame) + 'px');

        return null;
    }
}



// ----------- Helping functions ----------- //

function getAbsoluteParametr (jQ, parametr) { 
    return Number( jQ.css(parametr).slice(0, -2) );
}

function makeCounter() {
    let counter = 0
    return function () {
        return counter++;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * max) + min;
}