import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    callPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const functionCallsQuery = [
    callPattern
].join('\n');

const run = function(parser) {
    describe('Function Calls', () => {
        describe('Direct Function Calls', () => {
            it('captures direct function calls', () => {
                const code = `calculate(1, 2);
console.log('Hello');`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only function call captures - exclude overlapping patterns from other groups
                const filteredCallCaptures = captures.filter(c => 
                    ['function_call', 'function_name', 'method_call', 'object', 'property'].includes(c.name)
                );
                expect(filteredCallCaptures.map(c => c.name)).to.deep.equal(['function_call', 'function_name', 'method_call', 'object', 'property']);

                // Check for direct function call captures
                const callCaptures = captures.filter(c => c.name === 'function_call');
                expect(callCaptures.map(c => c.node.type)).to.deep.equal(['call_expression']);
            });
        });

        describe('Method Calls', () => {
            it('captures method calls', () => {
                const code = `obj.method(arg1, arg2);
array.push(item);`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only function call captures - exclude overlapping patterns from other groups
                const filteredMethodCaptures = captures.filter(c => 
                    ['function_call', 'function_name', 'method_call', 'object', 'property'].includes(c.name)
                );
                expect(filteredMethodCaptures.map(c => c.name)).to.deep.equal(['method_call', 'object', 'property', 'method_call', 'object', 'property']);

                // Check for method call captures
                const methodCaptures = captures.filter(c => c.name === 'method_call');
                expect(methodCaptures.map(c => c.node.type)).to.deep.equal(['call_expression', 'call_expression']);
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(functionCallsQuery);
    run(parser);
}

export default run;
