//TODO add in IF and FOR nodes

class Node {
  printToken() {
    output(this.type + ":" + this.tok)
    console.log(this.type + ":" + this.tok)
  }
}

class ProgramNode {
  constructor(exprs = null) {
    this.type = "PROGRAM"
    this.exprs = exprs;
  }

  printToken() {
    output(this.type)
    console.log(this.type)
    for (let i = 0; i < this.exprs.length; i++) {
      output(this.exprs[i].print())
      console.log(this.exprs[i].print())
    }
  }
}

class NumberNode extends Node {
  constructor(tok) {
    this.type = "INT"
    this.tok = tok
  }
}

class StringNode extends Node {
  constructor(tok) {
    this.type = "STRING"
    this.tok = tok
  }
}

class VarAccessNode extends Node {
  constructor(var_name_tok) {
    this.type = "VAR_ACCESS"
    this.var_name_tok = var_name_tok
  }
}

class VarAssignNode extends Node {
  constructor(var_name_tok, value_node) {
    this.type == "VAR_ASSIGN"
    this.var_name_tok = var_name_tok;
    this.value_node = value_node;
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
    output(this.type + ":" + this.left_node.printToken() + this.op_tok + this.right_node.printToken())
    console.log(this.type + ":" + this.left_node.printToken() + this.op_tok + this.right_node.printToken())
  }
}

class UnaryOpNode {
  constructor(op_tok, node) {
    this.type = "UNARY_OP"
    this.op_tok = op_tok;
    this.node = node
  }

  printToken() {
    output(this.type + ":" + this.op_tok + this.node.printToken())
  }
}
