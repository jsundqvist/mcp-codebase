import { parseAndQuery } from './test-utils.js';

export default function() {
    describe('Variables', () => {
        // const jsParser = createTestParser();

        it('captures variable declarations', () => {
            const code = `const answer = 42;
let count = 0;
var legacy = true;`;
            const captures = parseAndQuery(code);
            expect(captures).to.be.ok;
            expect(captures.length).to.be.greaterThan(0);

            // Should find all three variable declarations
            const varCaptures = captures.filter(c => c.name === 'variable');
            expect(varCaptures.length).to.equal(3);

            // Check the variable names
            const nameCaptures = captures.filter(c => c.name === 'var_name');
            expect(nameCaptures.length).to.equal(3);
            expect(nameCaptures.map(c => c.node.text)).to.deep.equal(['answer', 'count', 'legacy']);
        });
    });
}
