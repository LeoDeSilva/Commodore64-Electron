class Parser {
    constructor(program) {
        this.program = program;
        this.i = 0;
        this.currentNode = this.program[this.i]
    }

    advance() {
        this.i++;
        try {this.currentNode = this.program[this.i]}
        catch {this.currentNode = null}
    }

    retreat() {
        this.i--
        try {this.currentNode = this.program[this.i]}
        catch {this.currentNode = null}
    }


    parse() {
        let ast = new ProgramNode([])

        while (this.currentNode != null) {
            let curExpr = this.parseExpr()
            ast.exprs.push(curExpr)

            this.advance()
        }

        ast.printToken()
        return ast
    }

    parseExpr() {
        while (this.currentNode != null && this.currentNode.type != TT_EOL) {

            if (this.currentNode.matches(TT_KEYWORD, "VAR")) {
                this.advance()

                if (this.currentNode.type != TT_IDENTIFIER) {
                    output("EXPECTED IDENTIFIER VAR ASSIGNMENT")
                    return null
                }

                let var_name = this.currentNode

                this.advance()

                if (this.currentNode.type != TT_EQ) {
                    output("EXPECTED EQUALS VAR ASSIGNMENT")
                    return null
                }

                this.advance()

                let var_expr = this.parseArith()
                return new VarAssignNode(var_name, var_expr)
            }
            else {
                let arith = this.parseArith()
                return arith

            }
        }
    }

    parseArith() {
        let termA = this.parseTerm()
        if (this.currentNode != null && this.currentNode.type != TT_EOL) {
            if (this.currentNode.type == TT_ADD) {
                this.advance()
                let termB = this.parseTerm()
                let binary_op = new BinOpNode(termA, TT_ADD, termB)
                return binary_op
            }
            else if (this.currentNode.type == TT_MINUS) {
                this.advance()
                let termB = this.parseTerm()
                let binary_op = new BinOpNode(termA, TT_MINUS, termB)
                return binary_op
            } else {
                return termA
            }

        }
        else {
            return termA
        }
    }

    parseTerm() {
        let factorA = this.parseFactor()
        this.advance()
        if (this.currentNode != null && this.currentNode.type != TT_EOL) {
            if (this.currentNode.type == TT_MUL) {
                this.advance()
                let factorB = this.parseFactor()
                this.advance()
                let binary_op = new BinOpNode(factorA, TT_MUL, factorB)
                return binary_op
            }
            else if (this.currentNode.type == TT_DIV) {
                this.advance()
                let factorB = this.parseFactor()
                this.advance()
                let binary_op = new BinOpNode(factorA, TT_DIV, factorB)
                return binary_op
            }
            else {
                return factorA
            }

        }
        return factorA
    }

    parseFactor() {
        while (this.currentNode != null && this.currentNode.type != TT_EOL) {
            if (this.currentNode.type == TT_IDENTIFIER) {
                return new VarAccessNode(this.currentNode.value)
            }
            else if (this.currentNode.type == TT_INT) {
                return new NumberNode(this.currentNode.value)
            }
            else if (this.currentNode.type == TT_STRING) {
                return new StringNode(this.currentNode.value)
            }
            else if (this.currentNode.type == TT_LPAREN) {
                this.advance()
                let expr = this.parseArith()
                if (this.currentNode.type == TT_RPAREN) {
                    this.advance()
                    return expr
                }
            }
            else if (this.currentNode.type == TT_MINUS) {
                this.advance()
                return new UnaryOpNode(TT_MINUS, this.parseFactor())
            }

        }

    }
}



