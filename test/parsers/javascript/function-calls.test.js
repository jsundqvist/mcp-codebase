import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { callPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from './test-utils.js';

const run = function(parser) {
    describe('Function Calls', () => {
        it('captures direct function calls', () => {
            const code = `calculate(1, 2);
console.log('Hello');`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;
            expect(captures.length).to.be.greaterThan(0);

            // Check for direct function call captures
            const callCaptures = captures.filter(c => c.name === 'function_call');
            expect(callCaptures.length).to.be.greaterThan(0);
        });

        it('captures method calls', () => {
            const code = `obj.method(arg1, arg2);
array.push(item);`;
            const captures = query(parser, code);
            expect(captures).to.be.ok;
            expect(captures.length).to.be.greaterThan(0);

            // Check for method call captures
            const methodCaptures = captures.filter(c => c.name === 'method_call');
            expect(methodCaptures.length).to.be.greaterThan(0);
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(callPattern);
    run(parser);
}

export default run;
