class Parser {
    constructor(program) {
        this.program = program;
        this.parsedProgram = []

        this.lineIndex = 0
        this.i = 0;

        this.lineNumber = this.program[this.lineIndex].number
        this.lineTokens = this.program[this.lineIndex].tokens
        
        this.currentNode = this.lineTokens[this.i]
    }

    advance() {
        this.i++;
        try {this.currentNode = this.lineTokens[this.i]}
        catch {this.currentNode = null}
    }

    retreat() {
        this.i--
        try {this.currentNode = this.lineTokens[this.i]}
        catch {this.currentNode = null}
    }

    advanceLine(){
      this.lineIndex ++;
      try{
        this.lineNumber = this.program[this.lineIndex].number 
        this.lineTokens = this.program[this.lineIndex].tokens 
        this.i = 0
        this.currentNode = this.lineTokens[this.i]
      }catch{
        this.lineNumber = null
        this.lineTokens = null
        this.i = null
        this.currentNode = null
      }
    }

    parse() {
      while (this.lineTokens != null){
        let parsedLine = {
          number: this.lineNumber,
          tokens:[]
        } 
        while(this.currentNode != null){
          let curExpr = this.parseExpr()
          parsedLine.tokens.push(curExpr)
          this.advance()
        }
        this.parsedProgram.push(parsedLine) 
        this.advanceLine()
      }

      return this.parsedProgram
    }

    parseExpr() {
        while (this.currentNode != null && this.currentNode.type != TT_EOL) {
            if (this.currentNode.type == TT_KEYWORD) {
                if (this.currentNode.matches(TT_KEYWORD, "VAR")) {
                    this.advance()
                    return this.parseAssignment()
                }

                if (this.currentNode.matches(TT_KEYWORD, "GOTO")) {
                    let parameters = []
                    this.advance()

                    if (this.currentNode.type == TT_LPAREN) {
                        parameters = this.parseParameters()
                    } else {
                        parameters = new ProgramNode([this.parseArith()])
                    }

                    this.advance()
                    return new FunctionCallNode("GOTO", parameters)
                }

                if (this.currentNode.matches(TT_KEYWORD, "IF")) {
                  this.advance()
                  return this.parseIf()
                }
            }
            else {
                if (this.currentNode.type == TT_IDENTIFIER) {
                    if (this.lineTokens[this.i + 1].type == TT_EQ) {
                        return this.parseAssignment()
                    }
                }

                return this.parseArith()

            }
        }
    }

    parseIf(){

    }

    parseAssignment() {

        if (this.currentNode.type != TT_IDENTIFIER) {
            output("EXPECTED IDENTIFIER VAR ASSIGNMENT")
            return null
        }

        let var_name = this.currentNode.value

        this.advance()

        if (this.currentNode.type != TT_EQ) {
            output("EXPECTED EQUALS VAR ASSIGNMENT")
            return null
        }

        this.advance()

        let expr = null
        if(this.isComp()){
           expr = this.parseComp()
        }else{
          expr = this.parseArith()
        }
        return new VarAssignNode(var_name, expr)

    }

    isComp(){
      // 1*3+2 > 2+2 :
      // loop through statemnt if find TT_COMP before LPARENT OF EOL then it must be a comparison 
      for (let i = this.i; i < this.lineTokens.length; i++){
        let curToken = this.lineTokens[i]
        if (TT_COMPS.includes(curToken.type)){
          return true
        }
      }
      return false
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

    parseComp(){
      if (this.currentNode.type == TT_NOT){
        console.log("NOT")
        this.advance()
        return new UnaryOpNode(TT_NOT, this.parseComp())
      }else{
        let arithA = this.parseArith()

        let isComp = TT_COMPS.includes(this.currentNode.type)
        if (!isComp){
          console.log("NOT COMP")
          return null
        }
        console.log(this.currentNode.type)
        let op = this.currentNode.type

        this.advance()
        let arithB = this.parseArith()
        return new BinOpNode(arithA, op,arithB)
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
                //let binary_op = new BinOpNode(factorA, TT_DIV, factorB)
                return binary_op
            }
            else {
                return factorA
            }

        }
        return factorA
    }

    parseParameters() {
        let parameters = new ProgramNode([])
        this.advance()

        if (this.currentNode.type == TT_RPAREN) {
            return parameters
        }
        while (this.currentNode != null && this.currentNode.type != TT_RPAREN && this.currentNode.type != TT_EOL) {
            if (this.currentNode.type != TT_COMMA) {
                parameters.exprs.push(this.parseExpr())

            } else {

                this.advance()
            }

        }


        return parameters

    }

    parseFactor() {
        while (this.currentNode != null && this.currentNode.type != TT_EOL) {
            if (this.currentNode.type == TT_IDENTIFIER) {
                let ID = this.currentNode.value
                let next = this.lineTokens[this.i + 1]
                if (next != null && next.type == TT_LPAREN) {
                    this.advance()
                    let parameters = this.parseParameters()
                    return new FunctionCallNode(ID, parameters)

                } else {
                    return new VarAccessNode(ID)
                }
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



