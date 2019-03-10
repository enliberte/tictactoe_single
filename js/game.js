class ObjMixin {
    constructor() {
        this.elm = null;
    }

    init(cls, args) {
        let objects = [];
        for (let num = 0; num < args.size; num++) {
            args.num = num;
            let obj = new cls(args);
            this.elm.appendChild(obj.elm);
            objects.push(obj);
        }
        return objects;
    }
}


class Cell extends ObjMixin {
    constructor(args) {
        super();
        this.elm = document.createElement('div');
        this.elm.classList.add('cell');
        this.elm.setAttribute('rowNum', `${args.rowNum}`);
        this.elm.setAttribute('cellNum', `${args.num}`);
        this.elm.id = `cell${args.rowNum}${args.num}`;
        let cellSize = document.documentElement.clientHeight / args.size;
        this.elm.style.height = `${cellSize}px`;
        this.elm.style.width = `${cellSize}px`;
        this.elm.style.lineHeight = `${cellSize}px`;
        this.elm.style.fontSize = `${cellSize * 0.8}px`;
    }
}


class Row extends ObjMixin {
    constructor(args) {
        super();
        this.elm = document.createElement('div');
        this.elm.classList.add('line');
        this.cells = this.init(Cell, {size: args.size, rowNum: args.num})
    }
}


class Div {
    constructor(text, id) {
        this.elm = document.createElement('div');
        this.elm.textContent = text;
        this.elm.id = id;
        document.body.appendChild(this.elm);
    }
}


class Input {
    constructor(placeholder, id) {
        this.elm = document.createElement('input');
        this.elm.type = 'text';
        this.elm.placeholder = placeholder;
        this.elm.id = id;
        document.body.appendChild(this.elm);
    }
}


class Button {
    constructor(text, id, onclick) {
        this.elm = document.createElement('div');
        this.elm.id = id;
        this.elm.textContent = text;
        this.elm.addEventListener('click', onclick);
        document.body.appendChild(this.elm);
    }
}


class Gamefield extends ObjMixin {
    constructor(size) {
        super();
        this.elm = document.createElement('div');
        this.elm.classList.add('field');
        this.elm.addEventListener('click', changeState);
        this.elm.addEventListener('mouseover', borderCell);
        this.elm.addEventListener('mouseout', borderCell);
        this.rows = this.init(Row, {size: size});
        document.body.appendChild(this.elm);
    }
}

class Game {
    constructor(size) {
        this.gameField = new Gamefield(size);
    }
}


class Menu {
    constructor() {
        this.sizeInp = new Input('Укажите размер поля', 'size_inp').elm;
        this.winInp = new Input('Клеток для выигрыша', 'win_inp').elm;
        this.startGameBtn = new Button('ИГРАТЬ', 'start_game_btn', startGame).elm;
    }
}


function startGame(event) {
    let sizeInp = document.querySelector('#size_inp');
    let winInp = document.querySelector('#win_inp');
    let startGameBtn = document.querySelector('#start_game_btn');

    let size = (sizeInp.value && isNaN(sizeInp.value) && +sizeInp.value < DEFAULT_SIZE) ? DEFAULT_SIZE : +sizeInp.value;
    toWin = (winInp.value && isNaN(winInp.value) && +winInp.value > size) ? DEFAULT_TO_WIN : +winInp.value;

    document.body.removeChild(sizeInp);
    document.body.removeChild(winInp);
    document.body.removeChild(startGameBtn);

    new Game(size);
}


function borderCell(event) {
    if (event.target.classList.contains('cell')) {
        if (event.type === 'mouseover') {
            event.target.style.border = '3px green solid';
        } else if (event.type === 'mouseout') {
            event.target.style.border = '1px white solid';
        }
    }
}

function changeState(event) {
    function setState(target, state) {
        if (!target.textContent) {
            target.textContent = state;
            return true;
        }
        return false;
    }

    function checkWinner(target) {

        function showResult(figure) {
            console.log('showResult');
            let endGameDiv;
            let field = document.querySelector('.field');
            field.removeEventListener('click', changeState);
            if (figure) {
                endGameDiv = new Div(`Выиграли: ${figure}`, 'endgame').elm;
            } else {
                endGameDiv = new Div('Ничья', 'endgame').elm;
            }
            endGameDiv.style.left = `${field.clientHeight / 2 - endGameDiv.clientWidth / 2}px`;
            endGameDiv.style.top = `-${field.clientHeight / 2 + endGameDiv.clientHeight / 2}px`;
        }

        function calcSum(id, figure, currentSum) {
            let sum = currentSum;
            let cell = document.querySelector(id);
            if (cell) {
                if (cell.textContent === figure) {
                    sum++;
                } else {
                    sum = 0;
                }
            }
            return sum;
        }

        function checkGameIsOver(targetRow, targetCln, figure) {
            let cells = [].slice.call(document.querySelectorAll('.cell'));
            let sumInRow = 0;
            let sumInCln = 0;
            let sumInLR = 0;
            let sumInRL = 0;

            //ничья
            if (cells.every(function (cell) {return !!cell.textContent;})) {
                showResult();
                return;
            }

            for (let offset = -toWin + 1; offset < toWin; offset++) {
                sumInRow = calcSum(`#cell${targetRow}${targetCln + offset}`, figure, sumInRow); //ряд
                sumInCln = calcSum(`#cell${targetRow + offset}${targetCln}`, figure, sumInCln); //колонка
                sumInRL = calcSum(`#cell${targetRow + offset}${targetCln + offset}`, figure, sumInRL); //диагональ справа-налево
                sumInLR = calcSum(`#cell${targetRow - offset}${targetCln + offset}`, figure, sumInLR); //диагональ слева-направо
                if (sumInRow === toWin || sumInCln === toWin || sumInRL === toWin || sumInLR === toWin) {
                    showResult(figure);
                    return;
                }
            }
        }

        let figure = current ? 'X' : 'O';
        let targetRow = +target.getAttribute('rowNum');
        let targetCln = +target.getAttribute('cellNum');
        checkGameIsOver(targetRow, targetCln, figure);
    }

    if (event.target.classList.contains('cell')) {
        let figure = current ? 'X' : 'O';
        let cell = event.target;
        let result = setState(cell, figure);
        if (result) {
            checkWinner(cell);
            current = !current;
        }
    }
}


const DEFAULT_SIZE = 3;
const DEFAULT_TO_WIN = 3;
var current = true;
var toWin;
new Menu();