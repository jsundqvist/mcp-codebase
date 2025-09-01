import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    functionPattern,
    classPattern,
    variablePattern,
    arrowFunctionPattern,
    objectPattern,
    destructurePattern,
    asyncPattern,
    templatePattern,
    spreadPattern,
    statementPattern,
    operatorPattern,
    callPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const coreDeclarationsQuery = [
    functionPattern,
    classPattern,
    variablePattern,
    arrowFunctionPattern,
    objectPattern,
    destructurePattern,
    asyncPattern,
    templatePattern,
    spreadPattern,
    statementPattern,
    operatorPattern,
    callPattern
].join('\n');

const run = function(parser) {
    describe('Core Declarations', () => {
        describe('Functions', () => {
            it('captures function declaration', () => {
                const code = `function add(a, b) {
  return a + b;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.map(c => c.name)).to.deep.equal(['function', 'name', 'return', 'binary']);

                // Check that we have both the function and name captures
                const functionCapture = captures.find(c => c.name === 'function');
                expect(functionCapture).to.be.ok;
                expect(functionCapture.node.type).to.equal('function_declaration');

                const nameCapture = captures.find(c => c.name === 'name');
                expect(nameCapture).to.be.ok;
                expect(nameCapture.node.text).to.equal('add');
            });
        });

        describe('Classes', () => {
            it('captures class declarations', () => {
                const code = `class User {
    constructor(name) {
        this.name = name;
    }
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.map(c => c.name)).to.deep.equal(['class', 'class_name', 'method', 'method_name', 'object_method', 'method_name', 'member']);

                // Check that we have both the class and name captures
                const classCapture = captures.find(c => c.name === 'class');
                expect(classCapture).to.be.ok;
                expect(classCapture.node.type).to.equal('class_declaration');

                const nameCapture = captures.find(c => c.name === 'class_name');
                expect(nameCapture).to.be.ok;
                expect(nameCapture.node.text).to.equal('User');
            });

            it('captures class method', () => {
                const code = `class Calculator {
    add(a, b) {
        return a + b;
    }
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.map(c => c.name)).to.deep.equal(['class', 'class_name', 'method', 'method_name', 'object_method', 'method_name', 'return', 'binary']);

                // Check for method capture
                const methodCapture = captures.find(c => c.name === 'method');
                expect(methodCapture).to.be.ok;
                expect(methodCapture.node.type).to.equal('method_definition');

                // Check for method name capture
                const nameCapture = captures.find(c => c.name === 'method_name');
                expect(nameCapture).to.be.ok;
                expect(nameCapture.node.text).to.equal('add');
            });
        });

        describe('Variables', () => {
            it('captures variable declarations', () => {
                const code = `const name = 'John';
let age = 30;
var city = 'New York';`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.map(c => c.name)).to.deep.equal(['variable', 'var_name', 'variable', 'var_name', 'variable', 'var_name']);

                // Check for variable captures
                const variableCaptures = captures.filter(c => c.name === 'variable');
                expect(variableCaptures.map(c => c.node.type)).to.deep.equal(['variable_declarator', 'variable_declarator', 'variable_declarator']);

                // Check for name captures
                const nameCaptures = captures.filter(c => c.name === 'var_name');
                expect(nameCaptures.map(c => c.node.text)).to.deep.equal(['name', 'age', 'city']);
            });
        });

        describe('Arrow Functions', () => {
            it('captures arrow functions', () => {
                const code = `
const simple = () => {};
const withParam = (x) => x * 2;
const withBlock = (value) => {
    return value * 2;
};`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check arrow function captures
                const arrowCaptures = captures.filter(c => c.name === 'arrow_function');
                expect(arrowCaptures.map(c => c.node.text)).to.deep.equal(['() => {}', '(x) => x * 2', '(value) => {\n    return value * 2;\n}']);

                // Check parameter captures
                const paramCaptures = captures.filter(c => c.name === 'param_name');
                expect(paramCaptures.map(c => c.node.text)).to.deep.equal(['x', 'value']);
            });
        });

        describe('Objects', () => {
            it('captures object properties and methods', () => {
                const code = `
const obj = {
    name: "test",
    value: 42,
    method() {
        return this.value;
    }
};`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check property captures
                const propCaptures = captures.filter(c => c.name === 'prop_name');
                expect(propCaptures.map(c => c.node.text)).to.deep.equal(['name', 'value']);

                // Check method capture
                const methodCapture = captures.find(c => c.name === 'method_name');
                expect(methodCapture).to.be.ok;
                expect(methodCapture.node.text).to.equal('method');
            });
        });

        describe('Destructuring', () => {
            it('captures object and array destructuring', () => {
                const code = `
const { x, y } = point;
const [first, second] = array;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check object and array destructuring patterns exist
                const objDestructures = captures.filter(c => c.name === 'obj_destruct');
                expect(objDestructures.map(c => c.node.type)).to.deep.equal(['object_pattern']);

                const arrayDestructures = captures.filter(c => c.name === 'array_destruct');
                expect(arrayDestructures.map(c => c.node.type)).to.deep.equal(['array_pattern']);
            });
        });

        describe('Async/Await', () => {
            it('captures async functions and await expressions', () => {
                const code = `async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.map(c => c.name).sort()).to.deep.equal(['function', 'async_function', 'async_keyword', 'name', 'async_name', 'variable', 'var_name', 'await_expr', 'function_call', 'function_name', 'variable', 'var_name', 'await_expr', 'method_call', 'object', 'member', 'property', 'return'].sort());

                // Check for async function captures
                const asyncCaptures = captures.filter(c => c.name === 'async_function');
                expect(asyncCaptures.map(c => c.node.type)).to.deep.equal(['function_declaration']);

                // Check for await captures
                const awaitCaptures = captures.filter(c => c.name === 'await_expr');
                expect(awaitCaptures.map(c => c.node.type)).to.deep.equal(['await_expression', 'await_expression']);
            });
        });

        describe('Template Literals', () => {
            it('captures template strings and expressions', () => {
                const code = `
const name = "world";
const greeting = \`Hello \${name}!\`;
const multiline = \`
line 1
\${value}
line 2
\`;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check template strings
                const templates = captures.filter(c => c.name === 'template');
                expect(templates.map(c => c.node.text)).to.deep.equal(['`Hello ${name}!`', '`\nline 1\n${value}\nline 2\n`']);

                // Check template expressions
                const expressions = captures.filter(c => c.name === 'template_expr');
                expect(expressions.map(c => c.node.text)).to.deep.equal(['${name}', '${value}']);

                // Check template variables
                const vars = captures.filter(c => c.name === 'template_var');
                expect(vars.map(c => c.node.text)).to.deep.equal(['name', 'value']);
            });
        });

        describe('Rest and Spread', () => {
            it('captures rest parameters and spread elements', () => {
                const code = `
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
const array = [1, 2, 3];
const combined = [...array, 4, 5];`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check rest parameter
                const restParams = captures.filter(c => c.name === 'rest_param');
                expect(restParams.map(c => c.node.text)).to.deep.equal(['numbers']);

                // Check spread element
                const spreadVars = captures.filter(c => c.name === 'spread_var');
                expect(spreadVars.map(c => c.node.text)).to.deep.equal(['array']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(coreDeclarationsQuery);
    run(parser);
}

export default run;
