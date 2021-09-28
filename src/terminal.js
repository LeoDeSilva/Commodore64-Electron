const cmd = document.getElementById("cmd");
const commands = document.getElementById("commands");
const modeElement = document.getElementById("mode");
const screen = document.getElementById("screen");

let command = "";
let startup_commands = "<div class='cmd'>READY</div>";
commands.innerHTML += startup_commands;

function addCMD(cmd) {
    commands.innerHTML += `<div class="cmd"> ${cmd} </div>`;
}

function dataTheme(color) {
    document.documentElement.setAttribute("data-theme", color);
}

function findIndexFromKey(array, property) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].number == property) {
            return [true, i];
        }
    }
    return [false, -1];
}

class Terminal {
    constructor() {
        this.mode = "CMD";
        this.program = [];
    }

    evalCMD(command) {
        let cmd = command.trim()
        addCMD(command);

        if (this.mode == "CMD") {
            if (cmd == "NEW") {
                this.newProgram();
            } else if (cmd == "CLEAR") {
                this.clearScreen();
            } else if (cmd == "LIST") {
                this.list();
            } else if (cmd == "RUN") {
                this.runProgram();
            } else if (cmd == "CRT") {
                this.toggleScanlines();
            } else if (cmd.split(" ")[0] == "COLOR") {
                dataTheme(cmd.split(" ")[1].toLowerCase());
            } else {
                addCMD("<br>");
                addCMD("SYNTAX ERROR, COMMAND NOT FOUND");
                addCMD("READY");
            }
        } else if (this.mode == "WRITE") {
            this.addLine(command);
        }

        modeElement.innerHTML = `&#60;${this.mode}&#62;`;
    }

    newProgram() {
        this.program = [];
        this.mode = "WRITE";
        addCMD("<br>");
        addCMD("READY");
    }

    enterCMD() {
        this.mode = "CMD";
        addCMD("<br>");
        addCMD("READY");
    }

    runProgram() {
        let lex = new Lexer(this.program)
        let tokens = lex.lex()

        let parse = new Parser(tokens)
        let ast = parse.parse()

        this.enterCMD();
    }

    list() {
        for (let i = 0; i < this.program.length; i++) {
            let line = this.program[i];
            this.mode = "WRITE";
            let lineCMD = line.number.toString() + " " + line.line;
            addCMD(lineCMD);
        }
    }

    clearScreen() {
        commands.innerHTML = "";
    }

    checkLine(line) {
        let lineParts = line.split(" ");
        if (!isNaN(lineParts[0])) {
            return true;
        } else {
            return false;
        }
    }

    addLine(command) {
        if (command == "RUN") {
            this.runProgram();
        } else if (command == "NEW") {
            this.newProgram();
        } else if (command == "QUIT") {
            this.enterCMD();
        } else {
            if (this.checkLine(command)) {
                let line = {
                    number: parseInt(command.split(" ")[0]), // an integer of the line number
                    line: command.split(" ").slice(1).join(" "), // the code after the line number
                };

                let results = findIndexFromKey(this.program, line.number);
                let index = results[1];

                if (results[0]) {
                    // results[0] is whether the line number already exists
                    this.program.splice(index, 1);
                }

                if (line.line.trim() != "") {
                    this.program.push(line);
                }
                this.program.sort((a, b) => (a.number > b.number ? 1 : -1));
            } else {
                addCMD("SYNTAX ERROR, COMMAND NOT FOUND");
                addCMD("<br>");
            }
        }
    }

    toggleScanlines() {
        screen.classList.toggle("crt");
    }
}

const Prompt = new Terminal();

let test_program = [
    {number: 10, line: "VAR CT = 0"},
    {number: 15, line: 'PRINT("HELLO WORLD")'},
    {number: 20, line: "GOTO 10"}
]

//let test_lexer = new Lexer(test_program)
//let test_tokens = test_lexer.lex()

//let test_parser = new Parser(test_tokens)
//let ast = test_parser.parse()


cmd.onkeypress = function (e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        command = cmd.innerText;
        cmd.innerHTML = "";
        Prompt.evalCMD(command);
    }
};

setInterval(() => {
    cmd.focus();
}, 100);
