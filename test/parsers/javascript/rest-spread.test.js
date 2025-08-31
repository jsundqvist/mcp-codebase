import { expect } from 'chai';
import { createJavaScriptParser } from '../../../src/parsers/javascript.js';
import { spreadPattern } from '../../../src/parsers/javascript.js';
import { individual, query } from './test-utils.js';

const run = function(parser) {
    describe('Rest and Spread', () => {
        it('captures rest parameters and spread elements', () => {
            const code = `
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
const array = [1, 2, 3];
const combined = [...array, 4, 5];`;
            const captures = query(parser, code);
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
};

if (individual(import.meta.url)) {
    const parser = createJavaScriptParser(spreadPattern);
    run(parser);
}

export default run;
