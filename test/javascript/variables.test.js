import { parseAndQuery } from './test-utils.js';

describe('JavaScript Variables', () => {
    // const jsParser = createTestParser();

    it('captures variable declarations', () => {
        const code = `const answer = 42;
let count = 0;
var legacy = true;`;
        const captures = parseAndQuery(code);
        expect(captures).toBeTruthy();
        expect(captures.length).toBeGreaterThan(0);
        
        // Should find all three variable declarations
        const varCaptures = captures.filter(c => c.name === 'variable');
        expect(varCaptures.length).toBe(3);
        
        // Check the variable names
        const nameCaptures = captures.filter(c => c.name === 'var_name');
        expect(nameCaptures.length).toBe(3);
        expect(nameCaptures.map(c => c.node.text)).toEqual(['answer', 'count', 'legacy']);
    });
});
