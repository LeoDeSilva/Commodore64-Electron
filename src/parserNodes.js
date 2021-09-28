//TODO add in IF and FOR nodes

class ProgramNode {
    constructor(exprs = null) {
        this.type = "PROGRAM"
        this.exprs = exprs;
    }

    printToken() {
        console.log(this.type, this.exprs)
        //for (let i = 0; i < this.exprs.length; i++) {
        //try {
        //this.exprs[i].printToken()
        //}
        //catch {

        //}
        //}
    }
}

class NumberNode {
    constructor(tok) {
        this.type = "INT"
        this.tok = tok
    }
    printToken() {
        console.log(this.type, this.tok)
    }
}

class StringNode {
    constructor(tok) {
        this.type = "STRING"
        this.tok = tok
    }
    printToken() {
        console.log(this.type, this.tok)
    }
}

class VarAccessNode {
    constructor(var_name_tok) {
        this.type = "VAR_ACCESS"
        this.var_name_tok = var_name_tok
    }

    printToken() {
        console.log(this.type, this.var_name_tok)
    }
}

class VarAssignNode {
    constructor(var_name_tok, value_node) {
        this.type = "VAR_ASSIGN"
        this.var_name_tok = var_name_tok;
        this.value_node = value_node;
    }

    printToken() {
    }
}

class BinOpNode {
    constructor(left_node, op_tok, right_node) {
        this.type = "BIN_OP"
        this.left_node = left_node;
        this.op_tok = op_tok;
        this.right_node = right_node;
    }

    printToken() {
        console.log(this.type, this.left_node, this.op_tok, this.right_node);
    }
}

class UnaryOpNode {
    constructor(op_tok, node) {
        this.type = "UNARY_OP"
        this.op_tok = op_tok;
        this.node = node
    }

    printToken() {
        console.log(this.type + ":" + this.op_tok + this.node)
    }
}
