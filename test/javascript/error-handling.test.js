import { parseAndQuery } from './test-utils.js';

describe('JavaScript Error Handling', () => {
    // const jsParser = createTestParser();

    it('captures try-catch blocks', () => {
        const code = `try {
    riskyOperation();
} catch (error) {
    console.error(error);
}`;
        const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        
        // Check error handling structure
        const errorCapture = captures.find(c => c.name === 'error_handling');
        expect(errorCapture).toBeTruthy();
        expect(errorCapture.node.type).toBe('try_statement');
        
        // Check try block capture
        const tryCapture = captures.find(c => c.name === 'try_body');
        expect(tryCapture).toBeTruthy();
        
        // Check catch parameter and body
        const errorParamCapture = captures.find(c => c.name === 'error_param');
        expect(errorParamCapture).toBeTruthy();
        expect(errorParamCapture.node.text).toBe('error');
        
        const catchBodyCapture = captures.find(c => c.name === 'catch_body');
        expect(catchBodyCapture).toBeTruthy();
    });
});
