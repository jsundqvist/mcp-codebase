import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { errorHandlingPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from '../test-utils.js';

const run = function(parser) {
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
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(errorHandlingPattern);
    run(parser);
}

export default run;
