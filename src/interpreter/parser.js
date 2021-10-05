class Parser {
    constructor(program) {
        this.program = program;
        this.parsedProgram = []

        this.ifStatements = []

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
          if (this.currentNode.type == TT_EOL){break}

          let curExpr = this.parseExpr()
          parsedLine.tokens.push(curExpr)

          if (this.currentNode != null) {
            if(this.currentNode.type != TT_EOL){
              parsedLine.tokens.push(...this.parseMultiline())
            }
          }
        }
        this.parsedProgram.push(parsedLine) 
        this.advanceLine()
      }

      return this.parsedProgram
    }

    parseMultiline(){
      let tokens = []
      while(this.currentNode != null && this.currentNode.type != TT_EOL){
        if (this.currentNode.type != TT_TMP){
          let expr = this.parseExpr()
          tokens.push(expr)
        } else{
          this.advance()
        }
      } 
      return tokens
    }

    parseExpr() {
        while (this.currentNode != null && this.currentNode.type != TT_EOL) {
            if (this.currentNode.type == TT_KEYWORD) {
                if (this.currentNode.matches(TT_KEYWORD, "VAR")) {
                    this.advance()
                    return this.parseAssignment()
                }

                else if (this.currentNode.matches(TT_KEYWORD, "GOTO")) {
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

                else if (this.currentNode.matches(TT_KEYWORD, "IF")) {
                  this.advance()
                  let IfStatement = this.parseIf()
                  // ONLY PUSH IF PROG = NULL
                  this.ifStatements.push(IfStatement)
                  return IfStatement
                }

                else if(this.currentNode.matches(TT_KEYWORD, "ENDIF")){
                  this.ifStatements.pop().end = this.lineNumber
                  this.advance()
                  return new EmptyNode("ENDIF")
                }

                else if(this.currentNode.matches(TT_KEYWORD, "END")){
                  this.advance()
                  return new EmptyNode("END")
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
      let start = this.lineNumber
      let conditions = this.parseConditions()
      this.advance()

      if (!this.currentNode.matches(TT_KEYWORD, "THEN")){
        output("EXPECTED THEN FOLLOWING IF STATEMENT, LINE " + this.lineNumber)
        return null
      }
      this.advance()

      if(this.currentNode != null && this.currentNode.type != TT_EOL){
        let prog = new ProgramNode(this.parseMultiline())
        return new IfNode(start, start, conditions, prog)
      }

      return new IfNode(start, null, conditions)
    } 

    parseConditions() {
        let conditions = new ConditionNode([])
        let seperators = ["AND","OR"]
        this.advance()

        if (this.currentNode.type == TT_RPAREN) {
            return conditions
        }

        conditions.conditions.push(
          {
            seperator: "AND",
            conditions: this.parseComp()
          }
        )

        let compExpr = null
        let currentSeperator = null

        if(this.currentNode == null){
          while (this.currentNode != null && this.currentNode.type != TT_RPAREN && this.currentNode.type != TT_EOL) {
              let isSeperator =  seperators.includes(this.currentNode.value)

              if (!isSeperator) {
                  conditions.conditions.push({
                    seperator: currentSeperator,
                    conditions: this.parseComp()
                  })

              } else {
                  currentSeperator = this.currentNode.value
                  this.advance()
              }
          }

        }

        return conditions

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
        this.advance()
        return new UnaryOpNode(TT_NOT, this.parseComp())
      }else{
        let arithA = this.parseArith()

        let isComp = TT_COMPS.includes(this.currentNode.type)
        if (!isComp){
          return null
        }
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



