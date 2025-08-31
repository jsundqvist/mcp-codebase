import { parseAndQuery } from './test-utils.js';

export default function() {
    describe('Rest and Spread', () => {
        // const jsParser = createTestParser();

        it('captures rest parameters and spread elements', () => {
            const code = `
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
const array = [1, 2, 3];
const combined = [...array, 4, 5];`;
            const captures = parseAndQuery(code);
            expect(captures).to.be.ok;

            // Check rest parameter
            const restParams = captures.filter(c => c.name === 'rest_param');
            expect(restParams.length).to.equal(1);
            expect(restParams[0].node.text).to.equal('numbers');

            // Check spread element
            const spreadVars = captures.filter(c => c.name === 'spread_var');
            expect(spreadVars.length).to.equal(1);
            expect(spreadVars[0].node.text).to.equal('array');
        });
    });
}
