import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { callPattern } from '../../../src/parsers/javascript.js';
import { individual } from './test-utils.js';

function query(parser, code) {
    const tree = parser.parser.parse(code);
    return parser.query.captures(tree.rootNode);
}

const run = function(parser) {
    describe('Function Calls', () => {
        it('captures direct function calls', () => {
            const code = `calculate();
doSomething(arg1, arg2);`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            // Check function call captures
            const callCaptures = captures.filter(c => c.name === 'function_call');
            expect(callCaptures.map(c => c.node.text)).to.deep.equal(['calculate()', 'doSomething(arg1, arg2)']);

            // Check function names
            const nameCaptures = captures.filter(c => c.name === 'function_name');
            expect(nameCaptures.length).to.equal(2);
            expect(nameCaptures.map(c => c.node.text)).to.deep.equal(['calculate', 'doSomething']);
        });

        it('captures method calls', () => {
            const code = `console.log("test");
object.method(arg);`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;

            // Check method call captures
            const callCaptures = captures.filter(c => c.name === 'method_call');
            expect(callCaptures.map(c => c.node.text)).to.deep.equal(['console.log("test")', 'object.method(arg)']);

            // Check object and property names
            const objectCaptures = captures.filter(c => c.name === 'object');
            expect(objectCaptures.length).to.equal(2);
            expect(objectCaptures.map(c => c.node.text)).to.deep.equal(['console', 'object']);

            const propertyCaptures = captures.filter(c => c.name === 'property');
            expect(propertyCaptures.length).to.equal(2);
            expect(propertyCaptures.map(c => c.node.text)).to.deep.equal(['log', 'method']);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(callPattern);
    run(parser);
}

export default run;
