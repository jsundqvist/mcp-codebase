import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    callPattern,
    errorHandlingPattern,
    operatorPattern
} from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

// Combine patterns for this group
const callsErrorHandlingQuery = [
    callPattern,
    errorHandlingPattern,
    operatorPattern
].join('\n');

const run = function(parser) {
    describe('Calls and Error Handling', () => {
        describe('Function Calls', () => {
            it('captures direct function calls', () => {
                const code = `calculate(1, 2);
console.log('Hello');`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.map(c => c.name).sort()).to.deep.equal(['function_call', 'function_name', 'member', 'method_call', 'object', 'property'].sort());

                // Check for direct function call captures
                const callCaptures = captures.filter(c => c.name === 'function_call');
                expect(callCaptures.map(c => c.node.type)).to.deep.equal(['call_expression']);
            });

            it('captures method calls', () => {
                const code = `obj.method(arg1, arg2);`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                expect(captures.map(c => c.name).sort()).to.deep.equal(['member', 'method_call', 'object', 'property'].sort());

                // Check for method call captures
                const methodCaptures = captures.filter(c => c.name === 'method_call');
                expect(methodCaptures.map(c => c.node.type)).to.deep.equal(['call_expression']);
            });
        });

        describe('Error Handling', () => {
            it('captures try-catch blocks', () => {
                const code = `try {
    riskyOperation();
} catch (error) {
    console.error(error);
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;

                // Check error handling structure
                const errorCapture = captures.find(c => c.name === 'error_handling');
                expect(errorCapture).to.be.ok;
                expect(errorCapture.node.type).to.equal('try_statement');

                // Check try block capture
                const tryCapture = captures.find(c => c.name === 'try_body');
                expect(tryCapture).to.be.ok;

                // Check catch parameter and body
                const errorParamCapture = captures.find(c => c.name === 'error_param');
                expect(errorParamCapture).to.be.ok;
                expect(errorParamCapture.node.text).to.equal('error');

                const catchBodyCapture = captures.find(c => c.name === 'catch_body');
                expect(catchBodyCapture).to.be.ok;
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(callsErrorHandlingQuery);
    run(parser);
}

export default run;
