const { parse } = require('acorn');
const { getFileCoverageDataByName } = require('istanbul-spy');

// Istanbul.js, why did you make me do this, I trusted you...
// This would have probably been a whole lot easier with regex, maybe, but probably not as clear.
// Also, this is PURELY for testing

// hah! damn...

class Recurse {
  constructor(settings) {
    this.settings = settings;
  }

  into(ast) {
    if (!ast) return;
    if (Array.isArray(ast)) {
      for (let i = 0; i < ast.length; i++) {
        this.into(ast[i]);
      }
      return;
    }
    switch (ast.type) {
      case 'Program':
        this.into(ast.body);
        break;
      case 'BlockStatement':
        this.into(ast.body);
        break;
      case 'AssignmentExpression':
      case 'LogicalExpression':
        this.into(ast.left);
        this.into(ast.right);
        break;
      case 'BinaryExpression':
        this.into(ast.left);
        this.into(ast.right);
        break;
      case 'ForInStatement':
        this.into(ast.left);
        this.into(ast.right);
        this.into(ast.body);
        break;
      case 'UpdateExpression':
      case 'UnaryExpression':
        this.into(ast.argument);
        break;
      case 'VariableDeclaration':
        this.into(ast.declarations);
        break;
      case 'VariableDeclarator':
        this.into(ast.id);
        this.into(ast.init);
        break;
      case 'FunctionExpression':
      case 'FunctionDeclaration':
        this.into(ast.body);
        break;
      case 'IfStatement':
        this.into(ast.test);
        this.into(ast.consequent);
        if (ast.alternate) this.into(ast.alternate);
        break;
      case 'ForStatement':
        this.into(ast.init);
        this.into(ast.test);
        this.into(ast.update);
        this.into(ast.body);
        break;
      case 'DoWhileStatement':
      case 'WhileStatement':
        this.into(ast.body);
        this.into(ast.test);
        break;
      case 'Identifier':
        break;
      case 'ThrowStatement':
      case 'ReturnStatement':
        this.into(ast.argument);
        break;
      case 'MemberExpression':
        if (ast.object.name && ast.object.name.match(/cov_[0-9a-z]+/)) {
          this.settings.onIstanbulCoverageVariable(ast.object.name);
        }
        this.into(ast.object);
        this.into(ast.property);
        break;
      case 'ObjectPattern':
      case 'ObjectExpression':
        this.into(ast.properties);
        break;
      case 'ExpressionStatement':
        this.into(ast.expression);
        break;
      case 'SequenceExpression':
        this.into(ast.expressions);
        break;
      case 'NewExpression':
      case 'CallExpression':
        this.into(ast.arguments);
        this.into(ast.callee);
        break;
      case 'ArrayExpression':
        this.into(ast.elements);
        break;
      case 'ConditionalExpression':
        this.into(ast.test);
        this.into(ast.alternate);
        this.into(ast.consequent);
        break;
      case 'SwitchStatement':
        this.into(ast.discriminant);
        this.into(ast.cases);
        break;
      case 'SwitchCase':
        this.into(ast.test);
        this.into(ast.consequent);
        break;
      case 'Property':
        this.into(ast.key);
        this.into(ast.value);
        break;
      case 'TemplateLiteral':
        this.into(ast.expressions);
        break;
      case 'ThisExpression':
      case 'Literal':
      case 'DebuggerStatement':
      case 'EmptyStatement':
      case 'BreakStatement':
      case 'ContinueStatement':
        break;
      default:
        throw new Error(`unhandled type "${ast.type}"`);
    }
  }
}

module.exports = function (fn) {
  const source = fn.toString();
  const links = new Set();
  const ast = parse(`function fakeFunction() {${source}}`);
  const recurse = new Recurse({
    onIstanbulCoverageVariable: (name) => {
      const data = getFileCoverageDataByName(name);
      if (!data) {
        throw new Error(`Could not find istanbul identifier ${name}`);
      }
      const { path } = data;
      const variable = `const ${name} = __coverage__['${path}'];\n`;
      links.add(variable);
    },
  });
  recurse.into(ast);
  return Array.from(links).join('') + source;
};
