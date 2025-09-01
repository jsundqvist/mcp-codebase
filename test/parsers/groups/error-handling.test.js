import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import {
    errorHandlingPattern
} from '../../../src/parsers/javascript.js';
import { query, individual } from '../test-utils.js';

// Combine patterns for this group
const errorHandlingQuery = [
    errorHandlingPattern
].join('\n');

const run = function(parser) {
    describe('Error Handling', () => {
        describe('Try-Catch Blocks', () => {
            it('captures try-catch blocks', () => {
                const code = `try {
    riskyOperation();
} catch (error) {
    console.error(error);
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only error handling captures - exclude overlapping patterns from other groups
                const errorCaptures = captures.filter(c => 
                    ['error_handling', 'try_body', 'error_param', 'catch_body'].includes(c.name)
                );
                expect(errorCaptures.map(c => c.name)).to.deep.equal(['error_handling', 'try_body', 'error_param', 'catch_body']);

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

            it('captures try-catch-finally blocks', () => {
                const code = `try {
    riskyOperation();
} catch (error) {
    console.error(error);
} finally {
    cleanup();
}`;
                const captures = query(parser, code);
                expect(captures).to.be.ok;
                // Filter to only error handling captures - exclude overlapping patterns from other groups
                const errorCaptures = captures.filter(c => 
                    ['error_handling', 'try_body', 'error_param', 'catch_body'].includes(c.name)
                );
                expect(errorCaptures.map(c => c.name)).to.deep.equal(['error_handling', 'try_body', 'error_param', 'catch_body']);

                // Check that we still capture the main structure
                const errorCapture = captures.find(c => c.name === 'error_handling');
                expect(errorCapture).to.be.ok;
                expect(errorCapture.node.type).to.equal('try_statement');
            });
        });
    });
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(errorHandlingQuery);
    run(parser);
}

export default run;
