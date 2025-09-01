import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    functionPattern,
    variablePattern,
    classPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const coreDeclarationsQuery = [
    functionPattern,
    variablePattern,
    classPattern
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
                // Filter to only core declaration captures
                const declCaptures = captures.filter(c => 
                    ['function', 'name', 'class', 'class_name', 'method', 'method_name', 'variable', 'var_name'].includes(c.name)
                );
                expect(declCaptures.map(c => c.name)).to.deep.equal(['function', 'name']);

                // Check that we have both the function and name captures
                const functionCapture = captures.find(c => c.name === 'function');
                expect(functionCapture).to.be.ok;
                expect(functionCapture.node.type).to.equal('function_declaration');

                const nameCapture = captures.find(c => c.name === 'name');
                expect(nameCapture).to.be.ok;
                expect(nameCapture.node.text).to.equal('add');
            });
        });

        describe('Variables', () => {
            it('captures variable declarations', () => {
                const code = `const x = 1;
let y = 2;
var z = 3;`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.map(c => c.name)).to.deep.equal(['variable', 'var_name', 'variable', 'var_name', 'variable', 'var_name']);

                // Check variable captures
                const varCaptures = captures.filter(c => c.name === 'variable');
                expect(varCaptures.map(c => c.node.type)).to.deep.equal(['variable_declarator', 'variable_declarator', 'variable_declarator']);
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
                // Filter to only core declaration captures - exclude overlapping patterns
                const declCaptures = captures.filter(c => 
                    ['function', 'name', 'class', 'class_name', 'method', 'method_name', 'variable', 'var_name'].includes(c.name) &&
                    !['object_method'].includes(c.name) // Exclude overlapping patterns from other groups
                );
                expect(declCaptures.map(c => c.name)).to.deep.equal(['class', 'class_name', 'method', 'method_name']);

                // Check that we have both the class and name captures
                const classCapture = captures.find(c => c.name === 'class');
                expect(classCapture).to.be.ok;
                expect(classCapture.node.type).to.equal('class_declaration');

                const nameCapture = captures.find(c => c.name === 'class_name');
                expect(nameCapture).to.be.ok;
                expect(nameCapture.node.text).to.equal('User');
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(coreDeclarationsQuery);
    run(parser);
}

export default run;
