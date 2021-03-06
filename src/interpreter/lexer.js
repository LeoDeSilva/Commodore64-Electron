const commands = document.getElementById("commands")
const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
const DIGITS = "0123456789"

let TT_INT = "INT"
let TT_STRING = "STRING"
let TT_IDENTIFIER = "IDENTIFIER"
let TT_KEYWORD = "KEYWORD"
let TT_ADD = "ADD"
let TT_MINUS = "MINUS"
let TT_MUL = "MUL"
let TT_DIV = "DIV"
let TT_POW = "POW"
let TT_EQ = "EQ"
let TT_LPAREN = "LPAREN"
let TT_RPAREN = "RPAREN"
let TT_LSQUARE = "LSQUARE"
let TT_RSQUARE = "RSQUARE"
let TT_EE = "EE"
let TT_NE = "NE"
let TT_LT = "LT"
let TT_GT = "GT"
let TT_LTE = "LTE"
let TT_GTE = "GTE"
let TT_NOT = "NOT"
let TT_COMMA = "COMMA"
let TT_EOF = "EOF"
let TT_EOL = "EOL"
let TT_TMP = "TMP"

let TT_COMPS = [TT_EE,TT_NE,TT_LT,TT_GT,TT_LTE,TT_GTE] 

let KEYWORDS = [
    "VAR",
    "IF",
    "THEN",
    "AND",
    "OR",
    "FOR",
    "TO",
    "STEP",
    "NEXT",
    "GOTO",
    "END",
    "ENDIF",
    "FUNC",
    "ENDFUNC",
    "RETURN",
    "BREAK",
    "CONTINUE"
]


function output(cmd) {
    commands.innerHTML += `<div class="cmd"> ${cmd} </div>`;
}

class Token {
    constructor(type_, value_ = null) {
        this.type = type_;
        this.value = value_;
    }

    matches(type_, value_) {
        return this.type === type_ && this.value === value_;
    }

    print() {
        output(this.type + ":" + this.value);
        console.log(this.type + ":" + this.value)
    }
}

class Lexer {
    constructor(program) {
        this.program = program
        this.formattedProgram = this.formatProgram(program);
        this.index = 0
        this.lineIndex = 0
        this.lineNumber = this.program[this.lineIndex].number
        this.line = this.program[this.lineIndex].line

        this.prevChar = null
        this.currentChar = this.formattedProgram[this.index];
        this.nextChar = this.formattedProgram[this.index + 1]
    }

    formatProgram(program) {
        let code = program.map(a => a.line)
        return code.join(":")
    }

    advance() {
        this.index++;
        try {this.currentChar = this.line[this.index];}
        catch {this.currentChar = null;}
    }

    advanceLine() {
        this.lineIndex++;
        try {
            this.lineNumber = this.program[this.lineIndex].number
            this.line = this.program[this.lineIndex].line
            this.index = 0;
            this.currentChar = this.line[this.index]
        }
        catch {
            this.index = null;
            this.currentChar = null
            this.lineNumber = null
            this.line = null
        }
    }

    retreat() {
        this.index--;
        try {this.currentChar = this.line[this.index];}
        catch {this.currentChar = null;}
    }

    lex() {
        let program = []
        while (this.line != null) {
            let lineProg = {
                number: this.lineNumber,
                tokens: []
            }
            while (this.currentChar != null) {
                if (this.currentChar == " ") {this.advance(); continue;}
                let token = this.lexToken()
                lineProg.tokens.push(token)
                this.advance()
            }

            lineProg.tokens.push(new Token(TT_EOL, ":"))

            // program[this.lineNumber] = lineProg
            program.push(lineProg)
            this.advanceLine()
        }

        return program
    }

    lexToken() {
        if (this.currentChar == "+") {
            return new Token(TT_ADD, this.currentChar)
        }
        else if (this.currentChar == "-") {
            return new Token(TT_MINUS, this.currentChar)
        }
        else if (this.currentChar == "*") {
            return new Token(TT_MUL, this.currentChar)
        }
        else if (this.currentChar == "/") {
            return new Token(TT_DIV, this.currentChar)
        }
        else if (this.currentChar == "(") {
            return new Token(TT_LPAREN, this.currentChar)
        }
        else if (this.currentChar == ")") {
            return new Token(TT_RPAREN, this.currentChar)
        }
        else if (this.currentChar == "[") {
            return new Token(TT_LSQUARE, this.currentChar)
        }
        else if (this.currentChar == "]") {
            return new Token(TT_RSQUARE, this.currentChar)
        }
        else if (this.currentChar == "!") {
            return this.makeComparison("!")       }
        else if (this.currentChar == ">") {
            return this.makeComparison(">")
        }
        else if (this.currentChar == "<") {
            return this.makeComparison("<")
        }
        else if (this.currentChar == "=") {
            return this.makeComparison("=")
        }
        else if (this.currentChar == "^") {
            return new Token(TT_POW, this.currentChar)
        }
        else if (this.currentChar == ",") {
            return new Token(TT_COMMA, this.currentChar)
        }
        else if (this.currentChar == ":") {
            this.advanceLine()
            return new Token(TT_EOL, ":")
        }
        else if (this.currentChar == ";"){
            return new Token(TT_TMP,";")
        }

        else if (this.currentChar == '"' || this.currentChar == "'") {
            return new Token(TT_STRING, this.makeString())
        }
        else if (LETTERS.includes(this.currentChar)) {
            let tok_name = this.make(LETTERS)
            if (KEYWORDS.includes(tok_name)) {
                return new Token(TT_KEYWORD, tok_name)
            } else {
                return new Token(TT_IDENTIFIER, tok_name)
            }
        }
        else if (DIGITS.includes(this.currentChar)) {
            return new Token(TT_INT, parseInt(this.make(DIGITS)))
        }

    }

    lexNoLINE() {
        let tokens = []
        while (this.currentChar != null) {
            if (this.currentChar == "+") {
                tokens.push(new Token(TT_ADD, this.currentChar))
            }
            else if (this.currentChar == "-") {
                tokens.push(new Token(TT_MINUS, this.currentChar))
            }
            else if (this.currentChar == "*") {
                tokens.push(new Token(TT_MUL, this.currentChar))
            }
            else if (this.currentChar == "/") {
                tokens.push(new Token(TT_DIV, this.currentChar))
            }
            else if (this.currentChar == "(") {
                tokens.push(new Token(TT_LPAREN, this.currentChar))
            }
            else if (this.currentChar == ")") {
                tokens.push(new Token(TT_RPAREN, this.currentChar))
            }
            else if (this.currentChar == "[") {
                tokens.push(new Token(TT_LSQUARE, this.currentChar))
            }
            else if (this.currentChar == "]") {
                tokens.push(new Token(TT_RSQUARE, this.currentChar))
            }
            else if (this.currentChar == "!") {
                tokens.push(new Token(TT_NOT, this.currentChar))
            }
            else if (this.currentChar == ">") {
                tokens.push(this.makeComparison(">"))
            }
            else if (this.currentChar == "<") {
                tokens.push(this.makeComparison("<"))
            }
            else if (this.currentChar == "=") {
                tokens.push(this.makeComparison("="))
            }
            else if (this.currentChar == "^") {
                tokens.push(new Token(TT_POW, this.currentChar))
            }
            else if (this.currentChar == ",") {
                tokens.push(new Token(TT_COMMA, this.currentChar))
            }
            else if (this.currentChar == ":") {
                this.advanceLine()
                tokens.push(new Token(TT_EOL, ":"))
            }

            else if (this.currentChar == '"' || this.currentChar == "'") {
                tokens.push(new Token(TT_STRING, this.makeString()))
            }
            else if (LETTERS.includes(this.currentChar)) {
                let tok_name = this.make(LETTERS)
                if (KEYWORDS.includes(tok_name)) {
                    tokens.push(new Token(TT_KEYWORD, tok_name))
                } else {
                    tokens.push(new Token(TT_IDENTIFIER, tok_name))
                }
            }
            else if (DIGITS.includes(this.currentChar)) {
                tokens.push(new Token(TT_INT, parseInt(this.make(DIGITS))))
            }

            this.advance()
        }

        tokens.push(new Token(TT_EOL, ":"))

        //tokens.push(new Token(TT_EOF))
        return tokens
    }

    makeString() {
        this.advance()
        let string = ""
        while (this.currentChar != '"') {
            string += this.currentChar
            this.advance()
        }
        return string
    }

    make(chars) {
        let string = ""
        while (chars.includes(this.currentChar)) {
            string += this.currentChar
            this.advance()
        }
        this.retreat()
        return string
    }

    makeComparison(char) {
        if (this.line[this.index+1] == "=") {
            this.advance()
            if (char == ">") {return new Token(TT_GTE, ">=")}
            else if (char == "<") {return new Token(TT_LTE, "<=")}
            else if (char == "=") {return new Token(TT_EE, "==")}
            else if (char == "!") {return new Token(TT_NE, "!=")}
        } else {
            if (char == ">") {return new Token(TT_GT, ">")}
            else if (char == "<") {return new Token(TT_LT, "<")}
            else if (char == "=") {return new Token(TT_EQ, "=")}
            else if (char == "!") {return new Token(TT_NOT, "!")}
        }
    }

    printTokens(tokens) {
        for (let i = 0; i < tokens.length; i++) {
            tokens[i].print()
        }
    }
}


