import { parseAndQuery } from './test-utils.js';

describe('JavaScript', () => {
  describe('Error Handling', () => {
    // const jsParser = createTestParser();

    it('captures try-catch blocks', () => {
        const code = `try {
    riskyOperation();
} catch (error) {
    console.error(error);
}`;
        const captures = parseAndQuery(code);
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
