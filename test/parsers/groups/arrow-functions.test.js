import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    arrowFunctionPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const arrowFunctionsQuery = [
    arrowFunctionPattern
].join('\n');

const run = function(parser) {
    describe('Arrow Functions', () => {
        describe('Basic Arrow Functions', () => {
            it('captures arrow functions', () => {
                const code = `const add = (a, b) => a + b;
const greet = name => \`Hello, \${name}!\`;
const complex = (x, y) => {
    return x * y;
};`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only arrow function captures - exclude overlapping patterns from other groups
                const arrowCaptures = captures.filter(c =>
                    ['arrow_function', 'param_name'].includes(c.name)
                );
                expect(arrowCaptures.map(c => c.name)).to.deep.equal(['arrow_function', 'arrow_function', 'param_name', 'param_name', 'arrow_function', 'arrow_function', 'arrow_function', 'param_name', 'param_name']);

                // Check arrow function captures
                const arrowFunctionCaptures = captures.filter(c => c.name === 'arrow_function');
                expect(arrowFunctionCaptures.map(c => c.node.type)).to.deep.equal(['arrow_function', 'arrow_function', 'arrow_function', 'arrow_function', 'arrow_function']);
            });
        });

        describe('Arrow Functions with Parameters', () => {
            it('captures parameter names in arrow functions', () => {
                const code = `const add = (a, b) => a + b;
const greet = name => \`Hello!\`;
const none = () => 'hello';
const complex = (x, y, z) => {
    return x + y + z;
};`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only arrow function captures - exclude overlapping patterns from other groups
                const arrowCaptures = captures.filter(c =>
                    ['arrow_function', 'param_name'].includes(c.name)
                );
                expect(arrowCaptures.map(c => c.name)).to.deep.equal(['arrow_function', 'arrow_function', 'param_name', 'param_name', 'arrow_function', 'arrow_function', 'arrow_function', 'arrow_function', 'arrow_function', 'param_name', 'param_name', 'param_name']);

                // Check parameter captures
                const paramCaptures = captures.filter(c => c.name === 'param_name');
                expect(paramCaptures.map(c => c.node.text)).to.deep.equal(['a', 'b', 'x', 'y', 'z']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(arrowFunctionsQuery);
    run(parser);
}

export default run;
