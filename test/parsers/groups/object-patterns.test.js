import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    objectPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const objectPatternsQuery = [
    objectPattern
].join('\n');

const run = function(parser) {
    describe('Object Patterns', () => {
        describe('Object Properties', () => {
            it('captures object property definitions', () => {
                const code = `const obj = {
    name: 'John',
    age: 30,
    greet() {
        return 'Hello';
    }
};`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only object pattern captures - exclude overlapping patterns from other groups
                const objectCaptures = captures.filter(c =>
                    ['prop_name', 'object_prop', 'method_name', 'object_method'].includes(c.name)
                );
                expect(objectCaptures.map(c => c.name)).to.deep.equal(['object_prop', 'prop_name', 'object_prop', 'prop_name', 'object_method', 'method_name']);

                // Check property captures
                const propCaptures = captures.filter(c => c.name === 'prop_name');
                expect(propCaptures.map(c => c.node.text)).to.deep.equal(['name', 'age']);
            });
        });

        describe('Object Methods', () => {
            it('captures object method definitions', () => {
                const code = `const calculator = {
    add(a, b) {
        return a + b;
    },
    multiply(x, y) {
        return x * y;
    }
};`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only object pattern captures - exclude overlapping patterns from other groups
                const objectCaptures = captures.filter(c =>
                    ['prop_name', 'object_prop', 'method_name', 'object_method'].includes(c.name)
                );
                expect(objectCaptures.map(c => c.name)).to.deep.equal(['object_method', 'method_name', 'object_method', 'method_name']);

                // Check method captures
                const methodCaptures = captures.filter(c => c.name === 'method_name');
                expect(methodCaptures.map(c => c.node.text)).to.deep.equal(['add', 'multiply']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(objectPatternsQuery);
    run(parser);
}

export default run;
